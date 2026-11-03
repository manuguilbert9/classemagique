# Ajustement des maths et des aides des devoirs

Retour de Manu : maths trop élevées pour Axelle, bande numérique générique incohérente avec 42 + 10 pour Ismaël, et refus de donner le résultat sous couvert d’un modèle.

- Maths d’Axelle abaissées de C à B+ : centaines et calculs accessibles, nouveautés maintenues sous contrôle de l’enseignant. Lecture et orthographe conservées à C.
- Les 13 plans publiés à venir ont été modifiés uniquement sur `maths`, `profiles.maths` et la durée totale. Sauvegarde des anciens champs et des correctifs avant écriture, précondition sur la version des documents, puis relecture comparant tous les autres champs des 25 journées : aucun autre changement.
- Aides choisies à partir de la question réellement affichée et de son contexte, y compris la révision de remplacement. Suppression du widget générique lié au seul niveau de l’élève.
- Bande adaptée aux opérandes pour les petits calculs ; tableau de numération vide pour les positions ; jetons manipulés par l’élève sans total calculé ; bande de parts égales à colorier soi-même. Aucun résultat ou placement prérempli.
- Suppression de « Voir le modèle » et de la réponse possible après un essai, dans toutes les sessions et dans le fichier imprimable. Les mots Dyna-Mots restent observés avant le rappel de mémoire.
- Les questions ouvertes donnent une piste et des critères de relecture, avec confirmation par l’élève distincte d’une validation automatique. Deux essais incorrects permettent de demander une reprise avec le maître sans dévoiler le corrigé.
- Les indices révélant des résultats intermédiaires ou la réponse ont été réécrits. Les questions P2 déjà publiées reçoivent les indices révisés par correspondance exacte de leur contenu et de l’ancien indice identifié ; les questions et aides personnalisées restent conservées.

## Vérification

- [x] Tests RED puis GREEN : supports liés aux opérandes, absence de résultat prérempli, révision active, absence de corrigé imprimable et profil d’Axelle indépendant par matière.
- [x] 92 tests réussis et contrôle TypeScript réussi, dont conservation des aides personnalisées.
- [x] 25 vérifications navigateur du parcours, dont bande contenant 42 et une arrivée possible, tableau vide, jetons sans total calculé, fractions sans coloriage préalable, correction sans modèle et mode test sans écriture.
- [x] Relecture des 13 maths d’Axelle ; autres matières, autres élèves et historique inchangés.
- [x] Compilation et déploiement final réussis sur https://classemagique2.web.app/devoirs. Essai des deux sessions de maths en mode M. Manu : Axelle reçoit 306 puis 306 + 10 ; Ismaël reçoit la bande de 40 à 60 pour 42 + 10. Tableaux vides, arrivée non sélectionnée, absence de modèle corrigé même après erreur, support ne remplissant pas la réponse à la place de l’élève. Réponses corrigées et sessions terminées en simulation, rechargement restaurant l’état réel ; aucune erreur navigateur, aucune écriture de réponse élève et collection `homeworkFeedback` inchangée. Version imprimable sans corrigés vérifiée.
