(()=> {
  "use strict";
  const $=id=>document.getElementById(id);
  const Core=window.SalaryCore;
  const STORAGE="salaireAmbulancierDataV1";
  const defaultData=()=>({days:[],weekSettings:{},settings:{...Core.DEFAULTS},slip:{}});
  let data;
  try{data=JSON.parse(localStorage.getItem(STORAGE))||defaultData()}catch{data=defaultData()}
  if(!Array.isArray(data.days))data.days=[];
  if(!data.weekSettings)data.weekSettings={};
  if(!data.settings)data.settings={...Core.DEFAULTS};
  data.settings={...Core.DEFAULTS,...data.settings};
  let editingId=null;
  const money=n=>(Number(n)||0).toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
  const val=id=>Number($(id).value)||0;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function month(){return $("simMonth").value||$("homeMonth").value}
  function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(data));render()}catch(e){alert("Stockage local indisponible ou plein. Exporte une sauvegarde et libère de l'espace.")}}
  function switchTab(id){document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===id));document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));if(id==="simulation")render();window.scrollTo({top:0,behavior:"smooth"})}
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
  document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.go)));
  function selectedDays(){return data.days.filter(d=>!month()||d.date.startsWith(month()))}
  function compute(){return Core.calculate(data.days,data.weekSettings,data.settings,month())}
  function dayCard(d,actions){
    const date=new Date(d.date+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
    const detail=`${Number(d.tte||0).toFixed(2)} h · PLT ${d.plt||0} · P.EXT ${d.pext||0} · AS ${d.as||0} · Garde ${d.gpj||0}`;
    return `<article class="dayitem"><div><b>${date}</b><small>${esc(detail)}${d.note?" · "+esc(d.note):""}</small></div>${actions?`<div class="day-actions"><button data-edit="${esc(d.id)}">Modifier</button><button data-delete="${esc(d.id)}" aria-label="Supprimer">×</button></div>`:""}</article>`;
  }
  function render(){
    const r=compute(),ds=selectedDays();
    $("homeNet").textContent=money(r.net);$("homeGross").textContent=money(r.gross);
    $("homeHours").textContent=r.totalHours.toFixed(2)+" h";
    $("homeOvertime").textContent=(r.ot25Hours+r.ot50Hours).toFixed(2)+" h";
    $("homeCount").textContent=ds.length+" journée"+(ds.length>1?"s":"");
    const sorted=[...ds].sort((a,b)=>b.date.localeCompare(a.date));
    $("recentDays").className="list"+(sorted.length?"":" empty");
    $("recentDays").innerHTML=sorted.slice(0,4).map(d=>dayCard(d,false)).join("")||"Aucune journée saisie.";
    $("allDays").className="list"+(sorted.length?"":" empty");
    $("allDays").innerHTML=sorted.map(d=>dayCard(d,true)).join("")||"Aucune journée saisie.";
    $("dayMonthLabel").textContent=month()||"Tous les mois";
    $("simGross").textContent=money(r.gross);$("simDeductions").textContent="− "+money(r.totalDeductions);
    $("simReimburse").textContent="+ "+money(r.reimbursement);$("simNet").textContent=money(r.net);
    const grossRows=[
      ["Salaire de base",r.items.base],["Indemnité congés payés",r.items.cpIndemnity],
      ["Déduction congés pris",-r.items.cpDeduction],["HS 25 %",r.items.ot25Pay],
      ["HS 50 %",r.items.ot50Pay],["HS non majorées",r.items.nonMajPay],
      ["Prime d'ancienneté",r.items.seniorityPay],["Repas unique PLT",r.items.pltPay],
      ["Prime AS / UPH",r.items.asPay],["Prime garde GPJ/N",r.items.gpjPay],
      ["Dimanche / férié",r.items.dimferPay],["Majoration heure fériée",r.items.majHjfPay],
      ["Dépassement 12 h",r.items.dep12Pay]
    ];
    $("grossBreakdown").innerHTML=grossRows.map(x=>row(x[0],x[1])).join("");
    const dedNames={disability:"Incapacité / invalidité",health:"Complément santé fixe",ret1:"Retraite 1",ret2:"Retraite 2",ret3:"Retraite 3",dialogue:"Financement dialogue",csg1:"CSG déductible",csg2:"CSG non déductible",hsExemption:"Exonération sociale HS"};
    $("deductionBreakdown").innerHTML=Object.entries(r.deductions).map(([k,v])=>row(dedNames[k],v)).join("")+row("Total cotisations",r.totalDeductions);
    $("weekBreakdown").innerHTML=r.weeks.map(w=>`<div class="breakdown-row"><span><b>${w.key}</b><br><small>${w.tte.toFixed(2)} h saisies + ${w.leaveWeeks} semaine(s) CP</small></span><b>${w.totalHours.toFixed(2)} h<br><small>125 % : ${w.h25.toFixed(2)} h · 150 % : ${w.h50.toFixed(2)} h · non maj. : ${w.hNon.toFixed(2)} h</small></b></div>`).join("")||'<span class="muted">Aucune journée pour ce mois.</span>';
    renderWeekSettings(r.weeks);
  }
  function row(label,value){return `<div class="breakdown-row"><span>${esc(label)}</span><b>${money(value)}</b></div>`}
  function openEditor(d){
    editingId=d?.id||null;$("editorTitle").textContent=editingId?"Modifier la journée":"Nouvelle journée";
    const fields={Date:"date",Start:"start",End:"end",Break:"break",Tte:"tte",Jf:"jf",Plt:"plt",Pext:"pext",As:"as",Gpj:"gpj",Dimfer:"dimfer",MajHjf:"majHjf",Dep12:"dep12",CpJ:"cpj",Note:"note"};
    const defaults={date:new Date().toISOString().slice(0,10),start:"08:00",end:"17:00",break:30,tte:"",jf:0,plt:0,pext:0,as:0,gpj:0,dimfer:0,majHjf:0,dep12:0,cpj:0,note:""};
    Object.entries(fields).forEach(([suffix,key])=>{$("f"+suffix).value=d?.[key]??defaults[key]});
    $("dayEditor").classList.remove("hidden");$("dayEditor").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function closeEditor(){$("dayEditor").classList.add("hidden");editingId=null}
  $("newDay").onclick=()=>openEditor();$("closeEditor").onclick=closeEditor;$("cancelDay").onclick=closeEditor;
  $("saveDay").onclick=()=>{
    const date=$("fDate").value;if(!date){alert("Choisis une date.");return}
    const start=$("fStart").value,end=$("fEnd").value,brk=val("fBreak");
    const tte=$("fTte").value.trim()===""?Core.hoursFromTimes(start,end,brk):val("fTte");
    const d={id:editingId||String(Date.now()),date,start,end,break:brk,tte,
      jf:val("fJf"),plt:val("fPlt"),pext:val("fPext"),as:val("fAs"),gpj:val("fGpj"),
      dimfer:val("fDimfer"),majHjf:val("fMajHjf"),dep12:val("fDep12"),cpj:val("fCpJ"),note:$("fNote").value};
    if(editingId)data.days=data.days.map(x=>x.id===editingId?d:x);else data.days.push(d);
    closeEditor();persist();
  };
  $("allDays").addEventListener("click",e=>{
    const edit=e.target.dataset.edit,del=e.target.dataset.delete;
    if(edit){const d=data.days.find(x=>x.id===edit);if(d)openEditor(d)}
    if(del&&confirm("Supprimer cette journée ?")){data.days=data.days.filter(x=>x.id!==del);persist()}
  });
  function renderWeekSettings(weeks){
    $("weekSettings").innerHTML=weeks.map(w=>{
      const existing=data.weekSettings[w.key]||{};
      return `<div class="week-card"><div class="week-card-head"><b>${w.key}</b><span class="muted">${w.tte.toFixed(2)} h saisies</span></div>
      <div class="formgrid">
        <label>Semaine complète en congé<input type="number" min="0" max="1" step="1" data-week="${w.key}" data-field="leaveWeeks" value="${Number(existing.leaveWeeks)||0}"></label>
        <label>Jours CP supplémentaires<input type="number" min="0" step="0.5" data-week="${w.key}" data-field="extraCpDays" value="${Number(existing.extraCpDays)||0}"></label>
      </div><div class="week-metrics">Total retenu : ${w.totalHours.toFixed(2)} h · JF : ${w.jf} · CP J : ${w.cpj} · réduction du seuil : ${(w.jf*data.settings.jfReduction+w.cpj*data.settings.cpReduction).toFixed(2)} h</div></div>`;
    }).join("")||'<div class="empty">Les ajustements hebdomadaires apparaîtront après la première saisie.</div>';
  }
  $("weekSettings").addEventListener("change",e=>{
    const el=e.target;if(!el.dataset.week)return;
    const k=el.dataset.week,f=el.dataset.field;if(!data.weekSettings[k])data.weekSettings[k]={};
    data.weekSettings[k][f]=Math.max(0,Number(el.value)||0);persist();
  });
  $("leaveWeekDate").value=new Date().toISOString().slice(0,10);
  $("addLeaveWeek").onclick=()=>{
    const date=$("leaveWeekDate").value;if(!date){alert("Choisis une date de la semaine de congé.");return}
    const key=Core.isoWeek(date);
    if(!data.weekSettings[key])data.weekSettings[key]={leaveWeeks:1,extraCpDays:0};
    else data.weekSettings[key].leaveWeeks=Math.max(1,Number(data.weekSettings[key].leaveWeeks)||0);
    persist();
  };
  const settingMap={
    sBase:"base",sRate:"rate",sSeniority:"seniority",sOt25:"ot25",sOt50:"ot50",sNonMaj:"nonMaj",
    sPlt:"plt",sPext:"pext",sAs:"as",sGpj:"gpj",sDimfer:"dimfer",sMajHjf:"majHjf",sDep12:"dep12",
    sCpDed:"cpDed",sCpPay:"cpPay",sThreshold:"threshold",sThreshold150:"threshold150",
    sJfReduction:"jfReduction",sCpReduction:"cpReduction",sLeaveHours:"leaveHours",sLeaveDays:"leaveDays",
    sDisability:"disability",sHealth:"health",sRet1:"ret1",sRet2:"ret2",sRet3:"ret3",
    sDialogue:"dialogue",sCsg1:"csg1",sCsg2:"csg2",sHsExempt:"hsExempt"
  };
  function loadSettings(){Object.entries(settingMap).forEach(([id,k])=>$(id).value=data.settings[k])}
  $("saveSettings").onclick=()=>{Object.entries(settingMap).forEach(([id,k])=>data.settings[k]=val(id));persist();alert("Paramètres enregistrés.")};
  $("resetSettings").onclick=()=>{if(confirm("Remettre les paramètres d'origine du classeur ?")){data.settings={...Core.DEFAULTS};loadSettings();persist()}};
  function setMonth(m){$("homeMonth").value=m;$("simMonth").value=m;render()}
  const now=new Date(),thisMonth=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0");
  $("homeMonth").value=thisMonth;$("simMonth").value=thisMonth;
  $("homeMonth").onchange=()=>setMonth($("homeMonth").value);
  $("simMonth").onchange=()=>setMonth($("simMonth").value);
  $("compareBtn").onclick=()=>{
    const r=compute(),net=Number($("slipNet").value),gross=$("slipGross").value===""?null:Number($("slipGross").value),ded=$("slipDeductions").value===""?null:Number($("slipDeductions").value);
    if($("slipNet").value===""){alert("Saisis au moins le net payé du bulletin.");return}
    data.slip={net:$("slipNet").value,gross:$("slipGross").value,deductions:$("slipDeductions").value};persist();
    $("comparison").innerHTML=`Net estimé : <b>${money(r.net)}</b><br>Net bulletin : <b>${money(net)}</b><br>Écart bulletin − estimation : <b>${money(net-r.net)}</b>${gross===null?"":`<br>Écart brut : <b>${money(gross-r.gross)}</b>`}${ded===null?"":`<br>Écart cotisations : <b>${money(ded-r.totalDeductions)}</b>`}<br><small>Analyse les rubriques et assiettes avant de conclure à une anomalie.</small>`;
  };
  if(data.slip){$("slipNet").value=data.slip.net??"";$("slipGross").value=data.slip.gross??"";$("slipDeductions").value=data.slip.deductions??""}
  function download(name,blob){const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
  $("exportJson").onclick=()=>download("SALAIRE_Ambulancier_sauvegarde.json",new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  $("importJson").onchange=async e=>{
    try{const v=JSON.parse(await e.target.files[0].text());if(!Array.isArray(v.days)||!v.settings)throw Error("format");
      data={...defaultData(),...v,settings:{...Core.DEFAULTS,...v.settings}};persist();loadSettings();alert("Sauvegarde importée.");
    }catch{alert("Fichier JSON invalide ou incomplet.")}finally{e.target.value=""}
  };
  $("clearAll").onclick=()=>{if(confirm("Effacer toutes les journées, les réglages hebdomadaires et les comparaisons enregistrés sur cet appareil ?")){data=defaultData();loadSettings();persist();$("comparison").textContent="Saisis les montants du bulletin pour calculer les écarts."}};
  function excelXml(){
    const r=compute(),days=[["Date","Début","Fin","Pause min","TTE h","JF","PLT","P.EXT","AS","GPJ/N","Dim/Fer","Maj HJF h","Dépassement 12 h","CP J","Note"],...selectedDays().map(d=>[d.date,d.start,d.end,d.break,d.tte,d.jf,d.plt,d.pext,d.as,d.gpj,d.dimfer,d.majHjf,d.dep12,d.cpj,d.note||""])];
    const sim=[["Rubrique","Montant (€)"],["Salaire brut",r.gross],["Cotisations estimées",r.totalDeductions],["Repas ext. hors brut",r.reimbursement],["Net estimé",r.net],["Heures HS 25 %",r.ot25Hours],["Heures HS 50 %",r.ot50Hours],["Heures non majorées",r.nonMajHours],["Jours CP retenus",r.cpDays],[],["Semaine","TTE saisi","Total retenu","JF","CP J","HS 25 %","HS 50 %","Non majorées"],...r.weeks.map(w=>[w.key,w.tte,w.totalHours,w.jf,w.cpj,w.h25,w.h50,w.hNon])];
    const settings=[["Paramètre","Valeur"],...Object.entries(data.settings)];
    const escXml=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    const sheet=(name,rows)=>`<Worksheet ss:Name="${name}"><Table>${rows.map(row=>"<Row>"+row.map(v=>`<Cell><Data ss:Type="${typeof v==="number"?"Number":"String"}">${escXml(v)}</Data></Cell>`).join("")+"</Row>").join("")}</Table></Worksheet>`;
    return `<?xml version="1.0" encoding="UTF-8"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheet("Journées",days)}${sheet("Simulation",sim)}${sheet("Paramètres",settings)}</Workbook>`;
  }
  $("exportExcel").onclick=()=>download("SALAIRE_Ambulancier_"+month()+".xls",new Blob([excelXml()],{type:"application/vnd.ms-excel;charset=utf-8"}));
  $("printPdf").onclick=()=>window.print();$("exportPdfSettings").onclick=()=>{switchTab("simulation");window.print()};
  $("themeToggle").onclick=()=>{document.documentElement.classList.toggle("light");localStorage.setItem("salaryTheme",document.documentElement.classList.contains("light")?"light":"dark")};
  if(localStorage.getItem("salaryTheme")==="light")document.documentElement.classList.add("light");
  loadSettings();render();
  if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();