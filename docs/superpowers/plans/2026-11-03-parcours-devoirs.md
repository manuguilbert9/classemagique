# Parcours de devoirs et retours correctifs

Demande de Manu : remplacer la longue fiche d’une journée par des sessions à lancer séparément (lecture, mots, maths), avec un retour après validation et la possibilité de se corriger.

- Accueil compact avec progression et lancement/reprise de chaque session. Une question à la fois ; bilan et enregistrement de fin de session. Les élèves sans Dyna-Mots conservent deux sessions.
- Lecture : texte avant les questions, relecture accessible, audio et syllabes colorées conservés. Mots : observer, cacher, écrire, vérifier. Maths : question, indice, manipulation si prévue et retour correctif.
- Correction déterministe des mots (accents et terminaisons), des valeurs et des décompositions numériques reconnues. Les formulations ouvertes ou non reconnues donnent une comparaison avec une réponse possible ; la confirmation par l’élève reste explicitement distincte d’une validation automatique.
- Après une erreur : indice, nouvel essai, modèle facultatif. Après deux essais incorrects avec modèle consulté, possibilité de signaler un besoin d’aide au maître et poursuivre. Une session terminée ne signifie pas nécessairement une compétence acquise.
- Sauvegarde des réponses et validations à chaque vérification ; enregistrement d’un brouillon avant de revenir au parcours. Reprise après rechargement. En cas d’échec réseau, la saisie reste affichée et l’enregistrement n’est pas annoncé comme réussi.
- Historique borné à vingt essais par question, conservant le premier et les dix-neuf derniers. Suivi enseignant : essais, modèle consulté, validation automatique, confirmation de l’élève ou aide demandée.
- La modification d’une réponse ou du corrigé invalide sa validation. Les anciennes réponses restent lisibles ; aucun changement des plans publiés ni migration des résultats historiques.
- Mode M. Manu : parcours complet en simulation locale, aucun appel de sauvegarde des réponses d’un élève. Les essais disparaissent au rechargement.

## Vérification

- [x] Tests RED avant implémentation des corrections et du menu de sessions.
- [x] Suite complète : 87 tests réussis ; contrôle TypeScript et compilation de production réussis.
- [x] 21 contrôles navigateur : parcours mobile, correction, reprise, panne réseau, suivi enseignant, simulation, profils adaptés et ouverture du jeudi le mardi à 15 h Paris.
- [x] Sauvegarde réelle avec une identité de test unique, relecture des brouillons/validations/historiques et suppression vérifiée de ses seuls trois documents.
- [x] Déploiement réussi sur https://classemagique2.web.app/devoirs. Essai Axelle en mode M. Manu : trois sessions terminées, sept mots, erreurs suivies d’une correction, réponse ouverte confirmée après comparaison et rechargement restaurant les données réelles. Aucune écriture élève ni erreur navigateur ; collection `homeworkFeedback` inchangée avant/après. Affichage mobile inspecté sur le site publié.
