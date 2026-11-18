(function(root){
  const DEFAULTS = {
    base:1944.08, rate:12.79, seniority:2,
    ot25:15.9875, ot50:19.185, nonMaj:12.79,
    plt:9.59, pext:15.54, as:20, gpj:30, dimfer:23.90,
    majHjf:12.79, dep12:12.79, cpDed:70, cpPay:75.75,
    threshold:35, threshold150:43, jfReduction:7, cpReduction:5.8,
    leaveHours:35, leaveDays:6,
    disability:0.6, health:23.10, ret1:6.9, ret2:0.4, ret3:4.79,
    dialogue:0.025, csg1:6.79, csg2:2.9, hsExempt:11.31
  };
  function isoWeek(dateString){
    const d=new Date(dateString+"T12:00:00");
    const u=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
    u.setUTCDate(u.getUTCDate()+4-(u.getUTCDay()||7));
    const yearStart=new Date(Date.UTC(u.getUTCFullYear(),0,1));
    const week=Math.ceil((((u-yearStart)/86400000)+1)/7);
    return u.getUTCFullYear()+"-S"+String(week).padStart(2,"0");
  }
  function hoursFromTimes(start,end,breakMinutes){
    if(!start||!end)return 0;
    const [sh,sm]=start.split(":").map(Number),[eh,em]=end.split(":").map(Number);
    let a=sh*60+sm,b=eh*60+em;if(b<a)b+=1440;
    return Math.max(0,(b-a-(Number(breakMinutes)||0))/60);
  }
  function weekMondayFromKey(key){
    const m=/^(\d{4})-S(\d{2})$/.exec(key||"");
    if(!m)return null;
    const year=Number(m[1]),week=Number(m[2]);
    const jan4=new Date(Date.UTC(year,0,4));
    const monday=new Date(jan4);
    monday.setUTCDate(jan4.getUTCDate()-((jan4.getUTCDay()+6)%7)+(week-1)*7);
    return monday.toISOString().slice(0,10);
  }
  function weekOverlapsMonth(key,month){
    if(!month)return true;
    const monday=weekMondayFromKey(key);if(!monday)return false;
    const start=new Date(monday+"T12:00:00");
    const end=new Date(start);end.setDate(end.getDate()+6);
    const first=new Date(month+"-01T12:00:00");
    const last=new Date(first.getFullYear(),first.getMonth()+1,0,12);
    return start<=last&&end>=first;
  }
  function calculate(days,weekSettings,settings,month){
    const s={...DEFAULTS,...(settings||{})};
    const monthDays=(days||[]).filter(d=>!month||String(d.date||"").startsWith(month));
    const groups={};
    monthDays.forEach(d=>{
      const key=isoWeek(d.date);
      if(!groups[key])groups[key]={key,days:[],tte:0,jf:0,cpj:0,plt:0,pext:0,as:0,gpj:0,dimfer:0,majHjf:0,dep12:0};
      const g=groups[key];g.days.push(d);
      g.tte+=Number(d.tte)||0;g.jf+=Number(d.jf)||0;g.cpj+=Number(d.cpj)||0;
      for(const k of ["plt","pext","as","gpj","dimfer","majHjf","dep12"])g[k]+=Number(d[k])||0;
    });
    Object.keys(weekSettings||{}).forEach(key=>{
      if(weekOverlapsMonth(key,month)&&!groups[key])
        groups[key]={key,days:[],tte:0,jf:0,cpj:0,plt:0,pext:0,as:0,gpj:0,dimfer:0,majHjf:0,dep12:0};
    });
    let ot25Hours=0,ot50Hours=0,nonMajHours=0,cpDays=0;
    const weeks=Object.values(groups).sort((a,b)=>a.key.localeCompare(b.key)).map(g=>{
      const w=(weekSettings||{})[g.key]||{};
      const leaveWeeks=Math.max(0,Number(w.leaveWeeks)||0);
      const extraCpDays=Math.max(0,Number(w.extraCpDays)||0);
      const paidCpDays=leaveWeeks*s.leaveDays+extraCpDays;
      const totalHours=g.tte+leaveWeeks*s.leaveHours;
      const reducedThreshold=s.threshold-g.jf*s.jfReduction-g.cpj*s.cpReduction;
      const h25=Math.max(0,Math.min(totalHours-s.threshold,s.threshold150-s.threshold));
      const h50=Math.max(0,totalHours-s.threshold150);
      // Reproduction prudente de la formule Excel de HS non majorées.
      // Le classeur peut produire des valeurs négatives ; elles sont ramenées à zéro ici.
      const hNon=Math.max(0,Math.min(totalHours,s.threshold)-reducedThreshold);
      ot25Hours+=h25;ot50Hours+=h50;nonMajHours+=hNon;cpDays+=paidCpDays;
      return {...g,leaveWeeks,extraCpDays,paidCpDays,totalHours,reducedThreshold,h25,h50,hNon};
    });
    const sum=key=>monthDays.reduce((a,d)=>a+(Number(d[key])||0),0);
    const counts={plt:sum("plt"),pext:sum("pext"),as:sum("as"),gpj:sum("gpj"),dimfer:sum("dimfer"),majHjf:sum("majHjf"),dep12:sum("dep12")};
    const ot25Pay=ot25Hours*s.ot25,ot50Pay=ot50Hours*s.ot50,nonMajPay=nonMajHours*s.nonMaj;
    const cpDeduction=cpDays*s.cpDed,cpIndemnity=cpDays*s.cpPay;
    const seniorityBase=s.base+ot25Pay+ot50Pay+nonMajPay;
    const seniorityPay=seniorityBase*s.seniority/100;
    const items={
      base:s.base,cpIndemnity,cpDeduction,ot25Pay,ot50Pay,nonMajPay,seniorityPay,
      pltPay:counts.plt*s.plt,asPay:counts.as*s.as,gpjPay:counts.gpj*s.gpj,
      dimferPay:counts.dimfer*s.dimfer,majHjfPay:counts.majHjf*s.majHjf,dep12Pay:counts.dep12*s.dep12
    };
    const gross=Object.values(items).reduce((a,b)=>a+b,0);
    const deductions={
      disability:gross*s.disability/100,health:s.health,ret1:gross*s.ret1/100,
      ret2:gross*s.ret2/100,ret3:gross*s.ret3/100,dialogue:gross*s.dialogue/100,
      csg1:gross*s.csg1/100,csg2:gross*s.csg2/100,
      hsExemption:-(ot25Pay+ot50Pay)*s.hsExempt/100
    };
    const totalDeductions=Object.values(deductions).reduce((a,b)=>a+b,0);
    const reimbursement=counts.pext*s.pext;
    const net=gross-totalDeductions+reimbursement;
    return {monthDays,weeks,counts,ot25Hours,ot50Hours,nonMajHours,cpDays,items,deductions,
      ot25Pay,ot50Pay,nonMajPay,gross,totalDeductions,reimbursement,net,totalHours:monthDays.reduce((a,d)=>a+(Number(d.tte)||0),0)};
  }
  const api={DEFAULTS,isoWeek,weekMondayFromKey,hoursFromTimes,calculate};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else root.SalaryCore=api;
})(typeof window!=="undefined"?window:globalThis);