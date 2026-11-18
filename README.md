# SALAIRE Ambulancier — PWA personnelle

Cette archive contient le projet source d'une application web progressive (PWA) installable sur Android. **Ce n'est pas un APK Android natif.**

## Installation sur Android
La fonction d'installation PWA et le mode hors ligne nécessitent une adresse HTTPS.

1. Décompresse `SALAIRE_Ambulancier_PWA.zip`.
2. Héberge le contenu du dossier sur un hébergement HTTPS (par exemple GitHub Pages ou un hébergement web personnel).
3. Ouvre l'adresse HTTPS dans Chrome sur Android.
4. Ouvre le menu ⋮ puis choisis **Installer l'application** ou **Ajouter à l'écran d'accueil**.
5. Lance l'application une première fois avec Internet. Les fichiers sont mis en cache ; les ouvertures suivantes fonctionnent hors ligne.
6. Dans l'application, utilise **Réglages → Sauvegarde JSON** pour conserver une copie de tes données.

## Fonctions
- Saisie quotidienne : horaires, pause, TTE, JF, PLT, P.EXT, AS/UPH, GPJ/N, Dim/Fer, majoration HJF, dépassement 12 h et CP J.
- Ajustements hebdomadaires : congé complet et jours CP supplémentaires.
- Estimation brut, cotisations, indemnité P.EXT et net.
- Comparaison avec le net, le brut et les cotisations du bulletin.
- Paramètres modifiables, thème sombre/clair, stockage local.
- Export Excel compatible (`.xls`, format SpreadsheetML), sauvegarde JSON et impression PDF via le navigateur.

## Classeur analysé
Le fichier `SALAIRE Ambulancier.xlsx` a été analysé, notamment les feuilles `SALAIRE - REF` et `CYCLE A`. Paramètres de départ relevés :
- Salaire de base : 1 944,08 €
- Taux horaire : 12,79 €
- HS 25 % : 15,9875 €/h ; HS 50 % : 19,185 €/h ; HS non majorées : 12,79 €/h
- Ancienneté : 2 % dans la feuille `SALAIRE - REF`
- PLT : 9,59 € ; P.EXT : 15,54 € ; AS/UPH : 20 € ; GPJ/N : 30 €
- Dim/Fer : 23,90 € ; majoration HJF : 12,79 € ; dépassement 12 h : 12,79 €
- Congé : déduction 70 €/jour et indemnité 75,75 €/jour
- Cotisations : incapacité/invalidité 0,6 %, santé fixe 23,10 €, retraite 1 6,9 %, retraite 2 0,4 %, retraite 3 4,79 %, financement dialogue 0,025 %, CSG 6,79 % et 2,9 %, exonération sociale HS 11,31 %.

## Limites importantes
L'application reproduit les grandes formules visibles du classeur, mais ne doit pas être utilisée comme un calcul officiel de paie :
- Le seuil d'heures supplémentaires est calculé à 35 h, avec 8 h à 125 % puis le surplus à 150 % à partir de 43 h.
- Les formules de la ligne `HS Non Majorées` tiennent compte d'une réduction de seuil liée aux JF et CP J. Dans le classeur, les références de `T20:X20` paraissent décalées entre semaines ; l'application utilise 5,8 h (cellule Z19) comme valeur CP J modifiable.
- Le calcul de congé complet ajoute 35 h et 6 jours CP par semaine, selon les cellules et formules du modèle. Les jours CP supplémentaires sont saisissables.
- Les cotisations sont calculées sur le brut global avec les taux du classeur. Les plafonds, assiettes distinctes, régularisations, autres rubriques de bulletin et règles conventionnelles ne sont pas reproduits.
- Pour une semaine chevauchant deux mois, saisis toutes les journées de cette semaine et vérifie la répartition des heures supplémentaires.
- L'export `.xls` est un classeur SpreadsheetML lisible par Excel et LibreOffice, pas un fichier `.xlsx` moderne.
- Le PDF est généré via la fonction Imprimer du navigateur : choisis « Enregistrer au format PDF ».

Pour enregistrer une semaine complète de congé sans journée travaillée, ouvre « Journées », choisis une date de cette semaine puis utilise « Ajouter une semaine complète de congé ».\n\nLes données restent dans le stockage local du navigateur. La désinstallation ou l'effacement des données du navigateur peut les supprimer. Exporte une sauvegarde JSON régulièrement.
