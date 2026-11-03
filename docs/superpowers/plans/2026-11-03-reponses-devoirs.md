# Réponses et réalisation des devoirs

Demande de Manu après un essai avec Axelle : permettre de répondre dans les devoirs, conserver les réponses et enregistrer le travail terminé. Le mode M. Manu conserve la contrainte de consultation sans effet sur les élèves.

- Saisie de chaque réponse de lecture et de maths, de chaque mot Dyna-Mots et de la question d’accord. Un adulte peut transcrire une réponse orale.
- Enregistrement partiel par activité, reprise des saisies sauvegardées, validation par activité ou validation atomique des trois activités. Une réponse vide bloque la validation finale, pas l’enregistrement d’un travail en cours.
- État « terminé » distinct du retour seul / avec aide / à reprendre. Aucun score ajouté. Une modification non enregistrée ou une nouvelle version de l’activité ne conserve pas l’état terminé de l’ancienne réponse.
- Extension de `homeworkFeedback` avec les réponses, les questions auxquelles elles répondent, l’identité de l’activité et l’état draft/completed. Pas de modification des 208 plans ni de migration des résultats historiques.
- Mode M. Manu : mêmes saisies et boutons, simulation locale uniquement ; aucun appel au service de sauvegarde et aucune persistance des essais après rechargement.
- Réponses consultables dans le gestionnaire enseignant ; frise distinguant travail en cours et activité terminée.

## Vérifications

- Tests RED puis GREEN de la génération des champs, de la validation, des tâches modifiées et de la sauvegarde atomique.
- Suite complète : 79 tests réussis ; TypeScript valide.
- Navigateur : 18 contrôles, dont saisie mobile, panne réseau conservant le texte, reprise après rechargement, refus des réponses vides, état terminé persistant, lecture enseignant et simulation sans écriture.
- Persistance réelle : appel du service de l’application avec une identité de test unique ne correspondant à aucun élève ; trois activités sauvegardées en brouillon puis terminées et relues. Les trois documents de test sont supprimés ensuite et leur absence est vérifiée.
- [x] Déploiement réussi sur https://classemagique2.web.app/devoirs. Essai complet Axelle en mode M. Manu : réponses de lecture et de maths, sept mots Dyna-Mots, validation simulée des trois activités, rechargement restaurant les données réelles. Aucun appel d’écriture élève ni erreur navigateur. Collection homeworkFeedback inchangée avant/après l’essai.
