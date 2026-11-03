import type { HomeworkActivity, HomeworkMaths, HomeworkProfile, HomeworkQuestion } from '../lib/homework-plan';
const q = (prompt: string, answer: string, hint: string): HomeworkQuestion => ({ prompt, answer, hint });
const task = (title: string, questions: HomeworkQuestion[], prerequisite?: string): HomeworkMaths => ({
  title, questions, minutes: 4, instruction: 'Réponds à voix haute, montre ou manipule. Tu peux demander de lire la question.',
  introduced: !prerequisite, ...(prerequisite ? { prerequisite } : {}),
});
const calc = (a: number, sign: '+' | '−' | '×', b: number, hint: string) => q(`Combien font ${a} ${sign} ${b} ?`, String(sign === '+' ? a + b : sign === '−' ? a - b : a * b), hint);
const collection = (n: number, change: number) => task('Je transforme une collection', [
  q(`Prépare ${n} jetons. Montre comment tu vérifies qu’il y en a ${n}.`, `${n} jetons, comptés une seule fois chacun.`, 'Déplace chaque jeton compté dans une nouvelle zone.'),
  q(`On ${change > 0 ? 'ajoute' : 'retire'} ${Math.abs(change)} jeton${Math.abs(change) > 1 ? 's' : ''}. Combien y en aura-t-il ? Prévois, puis vérifie.`, `${n + change} jetons.`, `Pars de ta collection de ${n}. Fais l’action puis recompte.`),
]);
const tens = (n: number) => task('Dizaines et unités', [
  q(`Dans ${n}, combien y a-t-il de dizaines et d’unités ?`, `${Math.floor(n / 10)} dizaines et ${n % 10} unités.`, 'Un paquet de dix forme une dizaine.'),
  calc(n, '+', 10, 'Ajoute une dizaine ; les unités restent les mêmes.'),
]);
const hundreds = (n: number) => task('Centaines, dizaines et unités', [
  q(`Décompose ${n} en centaines, dizaines et unités.`, `${Math.floor(n / 100)} centaines, ${Math.floor(n / 10) % 10} dizaines, ${n % 10} unités.`, 'Le chiffre de droite indique les unités, puis viennent les dizaines et les centaines.'),
  calc(n, '+', 10, 'Ajoute une dizaine sans changer les unités.'),
]);
const large = (n: number, other: number) => task('Je repère les grands nombres', [
  q(`Lis ${n.toLocaleString('fr-FR')}. Combien contient-il de milliers entiers ?`, `${Math.floor(n / 1000)} milliers entiers et ${n % 1000} unités restantes.`, 'Sépare les trois derniers chiffres du groupe des milliers.'),
  q(`Quel nombre est le plus grand : ${n} ou ${other} ? Explique.`, `${Math.max(n, other)}. Compare les chiffres de gauche à droite jusqu’au premier chiffre différent.`, 'Commence par compter les chiffres, puis compare leurs positions.'),
]);
const product = (a: number) => task('Je comprends un produit', [
  calc(a, '×', 10, 'Cherche dix groupes du même nombre.'),
  q(`Utilise ${a} × 10 et ${a} × 2 pour trouver ${a} × 12.`, `${a * 10} + ${a * 2} = ${a * 12}.`, 'Douze groupes, c’est dix groupes et encore deux groupes.'),
], 'Décomposition d’un produit par 12 travaillée en classe');
const reunion = (a: number, b: number, item: string) => task('Je réunis deux quantités', [
  q(`Il y a ${a} ${item} dans une boîte et ${b} dans une autre. On les réunit. Combien y en a-t-il ?`, `${a + b} ${item}.`, 'Représente les deux boîtes ou utilise des objets, puis réunis les quantités.'),
  q('Explique comment tu peux vérifier ta réponse.', 'Recompter les objets réunis, refaire le calcul ou utiliser l’opération inverse.', 'Tu peux montrer les deux groupes avec des objets.'),
]);

/** Deux séances par semaine : lundi puis jeudi. Les nouveautés restent désactivées avant confirmation. */
export const HOMEWORK_MATHS: Record<HomeworkProfile, [HomeworkMaths, HomeworkMaths][]> = {
  'B-': [
    [collection(10, 1), collection(10, 1)],
    [task('Je reproduis une collection', [q('Prépare 11 jetons. Prépare une deuxième collection identique.', 'Deux collections de 11.', 'Mets un jeton de la deuxième collection en face de chaque jeton de la première.'), q('Comment sais-tu qu’il y en a autant ?', 'Chaque jeton a un partenaire, sans jeton isolé.', 'Compare les collections un à un.')]), collection(10, 2)],
    [task('Je compare', [q('Prépare 9 jetons et 11 jetons dans deux zones. Où y en a-t-il le plus ?', 'Dans la collection de 11.', 'Aligne les collections un à un.'), q('Combien de jetons faut-il ajouter à 9 pour en avoir 11 ?', '2.', 'Observe les jetons qui n’ont pas de partenaire.')]), collection(11, -2)],
    [task('Avant et après', [q('Quel nombre vient juste avant 11 ?', '10.', 'Compte de 8 à 12.'), q('Quel nombre vient juste après 11 ?', '12.', 'Avance d’un pas sur la bande numérique.')]), task('Je complète', [q('Il faut une carte pour chacun des 12 personnages. Tu as 10 cartes. Combien en manque-t-il ?', '2 cartes.', 'Prépare 12 places et distribue les 10 cartes.'), q('Vérifie qu’il y a maintenant une carte par personnage.', '12 cartes, une pour chacun.', 'Complète les places restées vides.')])],
    [task('La quantité reste la même', [q('Prépare 12 jetons en ligne. Écarte-les. Combien y en a-t-il maintenant ?', 'Toujours 12.', 'Vérifie si tu as ajouté ou retiré un jeton.'), q('Range ces 12 jetons en deux lignes. Vérifie leur nombre.', '12.', 'Compte chaque jeton une seule fois.')]), task('Juste ce qu’il faut', [q('Prépare 11 places. Mets un jeton sur chaque place. Combien de jetons faut-il ?', '11.', 'Distribue un jeton à la fois.'), q('Une place est retirée. Combien de jetons faut-il maintenant ?', '10.', 'Retire aussi le jeton de cette place.')])],
    [collection(9, 3), task('Autant dans les deux groupes', [q('Un groupe a 10 jetons, l’autre en a 12. Ajoute des jetons au premier pour avoir autant.', 'Ajouter 2 jetons au groupe de 10.', 'Aligne les jetons deux à deux.'), q('Comment peux-tu vérifier ?', 'Chaque collection a 12 jetons ; aucun jeton ne reste sans partenaire.', 'Fais correspondre les jetons un à un.')])],
    [collection(12, -1), collection(10, 2)],
  ],
  B: [
    [tens(35), tens(42)],
    [tens(64), reunion(12, 5, 'billets')],
    [task('Mes petits calculs', [calc(7, '+', 3, 'Complète dix avec tes doigts ou des jetons.'), calc(6, '+', 6, 'Cherche le double de six.')]), task('Des instruments sont rangés', [q('Il y a 15 instruments. On en range 4. Combien restent sur la table ?', '11 instruments.', 'Représente 15 objets et déplace ceux que l’on range.'), calc(15, '−', 4, 'Vérifie avec la situation précédente.')])],
    [task('Un de plus, une dizaine de moins', [calc(43, '+', 1, 'Ajoute une unité.'), calc(43, '−', 10, 'Retire une dizaine.')]), task('Les places libres', [q('Une petite salle a 20 places. 14 sont occupées. Combien de places sont libres ?', '6 places.', 'Représente deux rangées de dix et marque les places occupées.'), q('Comment vérifier avec une addition ?', '14 + 6 = 20.', 'Réunis les places occupées et les places libres.')])],
    [task('Je retire des dizaines et des unités', [calc(57, '−', 20, 'Retire deux dizaines.'), calc(57, '−', 3, 'Retire trois unités.')]), task('Deux guirlandes', [q('Une guirlande a 12 étoiles, l’autre en a 9. Combien en manque-t-il à la deuxième pour en avoir autant ?', '3 étoiles.', 'Dessine deux lignes d’étoiles et associe-les une à une.'), q('Combien d’étoiles y aura-t-il sur la deuxième après cet ajout ?', '12 étoiles.', 'Recompte ou calcule 9 + 3.')])],
    [task('Entre deux dizaines', [q('Entre quelles dizaines se trouve 47 ?', '40 et 50.', 'Récite les dizaines autour de 47.'), q('Entre quelles dizaines se trouve 83 ?', '80 et 90.', 'Cherche les dizaines juste avant et après.')]), task('Comparer des longueurs', [q('Deux rubans mesurent 20 cm et 30 cm. Lequel est le plus long ?', 'Celui de 30 cm.', 'Les deux mesures utilisent la même unité.'), q('Combien de centimètres a-t-il de plus ?', '10 cm.', 'Cherche ce qu’il faut ajouter à 20 pour atteindre 30.')], 'Comparaison de longueurs en centimètres travaillée en classe')],
    [task('Je retrouve mes calculs', [calc(36, '+', 10, 'Ajoute une dizaine.'), calc(48, '−', 6, 'Retire six unités.')]), reunion(13, 6, 'sachets de nourriture')],
  ],
  'B+': [
    [hundreds(527), hundreds(306)],
    [task('Comparer les nombres', [q('Quel nombre est le plus grand : 608 ou 680 ?', '680.', 'Compare d’abord les centaines, puis les dizaines.'), q('Décompose 804.', '800 + 4 : 8 centaines, 0 dizaine, 4 unités.', 'Le zéro marque l’absence de dizaines isolées.')]), reunion(124, 32, 'billets')],
    [task('Calculer avec les dizaines', [calc(240, '+', 30, 'Ajoute trois dizaines.'), calc(390, '−', 20, 'Retire deux dizaines.')]), task('Lire un tableau', [q('Instruments : lundi 12, mardi 15, jeudi 9. Quel jour compte-t-on 15 instruments ?', 'Mardi.', 'Associe chaque jour à son nombre.'), q('Combien d’instruments compte-t-on le lundi et le jeudi ensemble ?', '21.', 'Réunis 12 et 9.')])],
    [task('Je vérifie mon calcul', [calc(246, '+', 132, 'Réunis les centaines, puis les dizaines et les unités.'), q('Comment vérifier 378 − 132 = 246 avec une addition ?', '246 + 132 = 378.', 'Reconstitue le nombre de départ.')]), task('Un trajet', [q('Un voyage fait 180 km. 120 km sont déjà parcourus. Quelle distance reste-t-il ?', '60 km.', 'Cherche la distance qui complète 120 pour atteindre 180.'), q('Vérifie avec une addition.', '120 + 60 = 180.', 'Additionne la distance parcourue et celle qui reste.')])],
    [task('Un échange pour soustraire', [q('Pour calculer 352 − 126, échange une dizaine. Combien as-tu alors de dizaines et d’unités, en gardant les 3 centaines ?', '4 dizaines et 12 unités.', '5 dizaines et 2 unités valent autant que 4 dizaines et 12 unités.'), calc(352, '−', 126, 'Utilise l’échange : 12 − 6, puis 4 − 2 et 3 − 1.')], 'Soustraction par emprunt travaillée en classe'), task('Le stand du marché', [q('Un stand a 145 décorations. Il en vend 23. Combien en reste-t-il ?', '122 décorations.', 'Retire 20 puis 3, ou utilise ta procédure habituelle.'), q('Comment vérifier ?', '122 + 23 = 145.', 'Réunis ce qui reste et ce qui a été vendu.')])],
    [task('Comparer et calculer', [q('Quel nombre est le plus grand : 407 ou 470 ?', '470.', 'Les centaines sont identiques : compare les dizaines.'), calc(470, '−', 30, 'Retire trois dizaines.')]), task('Les visiteurs', [q('Bibliothèque : lundi 120 visiteurs, mardi 150, jeudi 130. Quel jour reçoit-on le plus de visiteurs ?', 'Mardi : 150.', 'Compare les trois nombres.'), q('Combien de visiteurs de plus le jeudi que le lundi ?', '10.', 'Cherche l’écart entre 120 et 130.')])],
    [task('Mes rappels', [q('Décompose 902.', '900 + 2.', 'Observe la place du zéro.'), calc(320, '+', 40, 'Ajoute quatre dizaines.')]), task('Les réserves du refuge', [q('Le refuge a 126 sachets. Il en reçoit 42. Combien en a-t-il maintenant ?', '168 sachets.', 'Réunis la réserve et la livraison.'), q('Vérifie en retirant les 42 sachets reçus.', '168 − 42 = 126.', 'Tu dois retrouver la réserve de départ.')])],
  ],
  C: [
    [large(205034,205304), task('Lire et multiplier par dix', [q('Dans 204006, combien y a-t-il de milliers entiers ?', '204 milliers entiers.', 'Sépare 204 et 006.'), calc(23, '×', 10, 'Dix groupes de 23 font 23 dizaines.')])],
    [large(140006,139999), product(23)],
    [task('Encadrer un grand nombre', [q('Encadre 205034 entre deux milliers consécutifs.', '205000 < 205034 < 206000.', 'Repère les milliers, puis le millier suivant.'), q('Quel est le plus proche : 205000 ou 206000 ?', '205000 : il est à 34 unités, contre 966.', 'Compare les distances aux deux bornes.')]), task('Estimer un produit', [q('Un élève annonce 32 × 12 = 3840. Est-ce vraisemblable ?', 'Non. 32 × 10 = 320 ; 12 groupes de 32 ne peuvent pas faire 3840.', 'Compare avec dix groupes puis vingt groupes.'), q('Retrouve le bon résultat.', '384 : 320 + 64.', 'Décompose douze en dix et deux.')], 'Produit par deux chiffres travaillé en classe')],
    [task('Produits par 10 et 100', [calc(34, '×', 10, '34 dizaines.'), calc(34, '×', 100, '34 centaines.')]), task('Des parts égales', [q('Une bande est partagée en 4 parts égales. Une part est coloriée. Quelle fraction est coloriée ?', 'Un quart : 1/4.', 'Le dénominateur indique le nombre de parts égales de l’unité.'), q('Deux des quatre parts sont coloriées. Est-ce la moitié ?', 'Oui : 2/4 de cette bande représentent sa moitié.', 'Deux parts sur quatre forment un des deux groupes égaux.')], 'Moitié et quart travaillés avec des partages égaux')],
    [task('Nommer une fraction', [q('Un disque est partagé en 3 parts égales. Comment nomme-t-on une part ?', 'Un tiers : 1/3.', 'Cherche le nom correspondant à trois parts égales.'), q('Une bande est partagée en 4 parts égales. Comment nomme-t-on trois parts ?', 'Trois quarts : 3/4.', 'Trois parts prises parmi les quatre.')], 'Fractions simples introduites en classe'), task('Un partage équitable', [q('Partage 12 jetons entre 3 personnes. Combien chacun reçoit-il ?', '4 jetons.', 'Distribue un jeton à chacun jusqu’à épuisement.'), q('Comment vérifier que tous les jetons ont été distribués ?', '3 × 4 = 12.', 'Réunis les trois parts égales.')], 'Sens du partage et de la division introduit en classe')],
    [task('Se repérer entre zéro et un', [q('Une droite va de 0 à 1 en quatre intervalles égaux. Quelle fraction est au premier repère après 0 ?', '1/4.', 'Chaque intervalle représente un quart de l’unité.'), q('Quelle fraction est au troisième repère après 0 ?', '3/4.', 'Avance de trois quarts à partir de zéro.')], 'Placement des fractions sur une droite travaillé en classe'), task('Partager avec un reste', [q('On partage 14 jetons entre 3 personnes, en donnant autant à chacun. Combien chacun reçoit-il et combien reste-t-il ?', '4 chacun et 2 jetons restants.', 'Fais trois groupes égaux ; arrête quand tu ne peux plus donner un jeton à chacun.'), q('Pourquoi ne peut-on pas distribuer les deux derniers jetons sans les couper ?', 'Il n’y en a pas assez pour en donner un à chacune des trois personnes.', 'Compare le reste au nombre de personnes.')], 'Quotient et reste travaillés en classe')],
    [task('Produits et fractions', [calc(26, '×', 10, '26 dizaines.'), q('Que représente un quart d’une unité ?', 'Une des quatre parts égales de cette unité.', 'Les quatre parts doivent avoir la même taille.')], 'Quart déjà étudié'), task('Préparer des lots', [q('Le refuge range 26 sachets dans des lots de 4. Combien de lots complets peut-il préparer ?', '6 lots complets.', 'Cherche combien de fois quatre entre dans 26.'), q('Combien reste-t-il de sachets ? Vérifie.', '2 sachets ; 6 × 4 + 2 = 26.', 'Compare 26 à la quantité rangée dans les six lots.')], 'Groupements et interprétation du reste travaillés en classe')],
  ],
};

export function mathsRevision(profile: HomeworkProfile, week: number): HomeworkActivity {
  const index = week - 8;
  if (profile === 'B-') return collection(9 + index % 3, 1);
  if (profile === 'B') return tens(32 + index * 3);
  if (profile === 'B+') return hundreds(302 + index * 21);
  return task('Je consolide mes calculs', [calc(21 + index, '×', 10, 'Cherche dix groupes du même nombre.'), calc(21 + index, '×', 2, 'Cherche le double.')]);
}
