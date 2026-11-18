# Correspondance des formules du classeur

Référence principale : feuille `SALAIRE - REF`.

| Rubrique | Source / formule du classeur | Application |
|---|---|---|
| Salaire de base | C2 = 1 944,08 € | Paramètre `base` |
| HS 25 % | C5 = Y5 × Z5 ; Z5 = 15,9875 € | Heures hebdo au-delà de 35 h, plafonnées à 8 h |
| HS 50 % | C6 = Y6 × Z6 ; Z6 = 19,185 € | Heures hebdo au-delà de 43 h |
| HS non majorées | C7 = Y11 × Z11 ; Z11 = 12,79 € | Seuil de 35 h réduit de 7 h par JF et 5,8 h par CP J |
| Ancienneté | C8 = (C2+C5+C6+C7) × 2 % | Reproduit |
| Majoration heure fériée | C9 = Y17 × Z17 ; Z17 = 12,79 € | Compte saisi × taux |
| Dimanche / JF | C10 = Y16 × Z16 ; Z16 = 23,90 € | Compte saisi × taux |
| Dépassement 12 h | C11 = Y18 × Z18 ; Z18 = 12,79 € | Compte saisi × taux |
| PLT | C12 = Y12 × Z12 ; Z12 = 9,59 € | Compte saisi × taux |
| Prime garde GPJ/N | C13 = Y15 × Z15 ; Z15 = 30 € | Compte saisi × taux |
| Prime UPH / AS | C14 = Y14 × Z14 ; Z14 = 20 € | Compte saisi × taux |
| Brut | C15 = SOMME(C4:C14)+C2-C3 | Reproduit à partir des postes ci-dessus |
| Cotisations | C17:C25 | Taux repris ; appliqués au brut global |
| Repas ext. / GPJ | C28 = Y13 × Z13 ; Z13 = 15,54 € | Ajouté au net hors brut |
| Net | C30 = C15-C26+C28 | Reproduit |

## Réserves
- `T20:X20` calcule la réduction de seuil CP J avec des références croisées qui semblent décalées. L'application utilise 5,8 h (Z19) comme valeur unitaire CP J, modifiable dans les réglages.
- La formule de HS non majorées peut renvoyer un nombre négatif dans certains cas. L'application borne ce résultat à zéro pour éviter une ligne de rémunération négative ; ce choix est signalé.
- Le traitement des semaines de congé complet est repris de `T4 = I10 + F3*35` et `T21 = F3*6`. Les jours CP supplémentaires sont une saisie complémentaire pour les situations partielles.
- Les cotisations ne reproduisent pas les éventuelles assiettes/plafonds spécifiques du bulletin.
