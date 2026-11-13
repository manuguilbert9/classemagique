# Miaoudoku dans les récompenses

Demande : intégrer à Classe Magique un jeu reprenant le fonctionnement du jeu
jouable sur https://www.meowdoku.org/.

## Choix de réalisation

Intégration React native dans la salle des récompenses, comme les jeux existants.
Une intégration externe dépendrait du site tiers, de ses publicités et de ses
contrôles ; une nouvelle application indépendante ne correspondrait pas au parcours
récompenses demandé. Le jeu conserve les règles et le cycle vide → croix → chat →
vide observés sur le site de référence. Son nom français est « Miaoudoku ».

Décisions de réalisation : 2 pépites pour ouvrir une session comprenant toutes les
grilles, sans nouveau débit pour recommencer ou changer de niveau ; 24 grilles
originales (8 faciles en 5×5, 8 normales en 6×6, 8 difficiles en 8×8) ; aucun gain
de pépites. Les régions sont connexes et chaque grille possède une seule solution.

## Écran et fonctionnement

Retour aux récompenses, titre, choix de difficulté et de niveau, compteur de chats,
grille centrale, boutons Annuler / Indice / Recommencer et règles consultables.
Chaque ligne, colonne et région doit contenir exactement un chat. Les chats ne
peuvent pas se toucher en diagonale. Toute croix sur la case attendue d'un chat et
tout chat hors de sa bonne case sont signalés immédiatement, même sans conflit
entre chats. Les cases erronées sont entourées en rouge et un message au-dessus
de la grille explique la correction. Le bandeau garde une hauteur fixe pour ne
pas déplacer la grille entre les clics. L'élève peut corriger librement.
Un indice corrige un chat erroné ou révèle un chat
manquant, et reste annulable. Une victoire permet de passer au niveau suivant.
Les niveaux réussis sont conservés localement, séparément pour chaque élève.

Palette : fond blanc, encre #334155, accent turquoise #0f766e, régions pastel
(rose, bleu, jaune, vert, violet, pêche, cyan, gris). Polices du site existant.
Numéros de région discrets en complément des couleurs, limites épaisses entre
régions, boutons utilisables au clavier, écran adapté aux petits téléphones.

## Vérification

Tests du moteur (conflits, victoire, indices, annulation), vérification indépendante
des 24 solutions et de la connexité des régions, compilation TypeScript, suite
existante et essai visuel/interactif local sans toucher aux comptes élèves réels.
