import { GeneratedProblem, ProblemCategory } from "@/ai/flows/word-problems-flow";

export const PROBLEM_STOCK: Record<ProblemCategory, GeneratedProblem[]> = {
    "problemes-transformation": [
        {
            text: "Léo avait 5 billes. Il en a gagné 3 à la récréation. Combien de billes a-t-il maintenant ?",
            data: [5, 3],
            expectedOperation: "addition",
            expectedResult: 8,
            unit: "billes"
        },
        {
            text: "Il y avait 8 oiseaux sur la branche. 2 oiseaux se sont envolés. Combien d'oiseaux reste-t-il ?",
            data: [8, 2],
            expectedOperation: "subtraction",
            expectedResult: 6,
            unit: "oiseaux"
        },
        {
            text: "Ce matin, il y avait 4 pommes dans le panier. Maman en a acheté d'autres. Maintenant, il y a 10 pommes. Combien de pommes Maman a-t-elle achetées ?",
            data: [4, 10],
            expectedOperation: "subtraction",
            expectedResult: 6,
            unit: "pommes"
        },
        {
            text: "Paul a 12 euros. Il achète un livre à 5 euros. Combien d'argent lui reste-t-il ?",
            data: [12, 5],
            expectedOperation: "subtraction",
            expectedResult: 7,
            unit: "euros"
        },
        {
            text: "Dans le bus, il y avait 15 passagers. 4 personnes descendent. Combien reste-t-il de passagers ?",
            data: [15, 4],
            expectedOperation: "subtraction",
            expectedResult: 11,
            unit: "passagers"
        },
        {
            text: "Julie avait 7 images. Son frère lui en donne 5. Combien d'images a Julie maintenant ?",
            data: [7, 5],
            expectedOperation: "addition",
            expectedResult: 12,
            unit: "images"
        },
        {
            text: "Il y avait 6 voitures sur le parking. D'autres voitures arrivent. Maintenant il y en a 9. Combien de voitures sont arrivées ?",
            data: [6, 9],
            expectedOperation: "subtraction",
            expectedResult: 3,
            unit: "voitures"
        },
        {
            text: "Tom avait 10 bonbons. Il en a mangé 3. Combien lui en reste-t-il ?",
            data: [10, 3],
            expectedOperation: "subtraction",
            expectedResult: 7,
            unit: "bonbons"
        },
        {
            text: "La plante mesurait 12 cm. Elle a grandi de 4 cm. Quelle est sa taille maintenant ?",
            data: [12, 4],
            expectedOperation: "addition",
            expectedResult: 16,
            unit: "cm"
        },
        {
            text: "Il y avait 20 élèves en classe. 2 sont sortis. Combien d'élèves sont en classe ?",
            data: [20, 2],
            expectedOperation: "subtraction",
            expectedResult: 18,
            unit: "élèves"
        },
        {
            text: "Pierre avait 15 billes. Il en a perdu 5. Combien lui en reste-t-il ?",
            data: [15, 5],
            expectedOperation: "subtraction",
            expectedResult: 10,
            unit: "billes"
        },
        {
            text: "Sophie a 8 ans. Dans 3 ans, quel âge aura-t-elle ?",
            data: [8, 3],
            expectedOperation: "addition",
            expectedResult: 11,
            unit: "ans"
        },
        {
            text: "Le bus transporte 10 personnes. 5 personnes montent. Combien y a-t-il de personnes dans le bus ?",
            data: [10, 5],
            expectedOperation: "addition",
            expectedResult: 15,
            unit: "personnes"
        },
        {
            text: "J'avais 18 euros. J'ai dépensé 6 euros. Combien me reste-t-il ?",
            data: [18, 6],
            expectedOperation: "subtraction",
            expectedResult: 12,
            unit: "euros"
        },
        {
            text: "Il y avait 5 oiseaux. 4 autres arrivent. Combien y a-t-il d'oiseaux maintenant ?",
            data: [5, 4],
            expectedOperation: "addition",
            expectedResult: 9,
            unit: "oiseaux"
        }
    ],
    "problemes-composition": [
        {
            text: "Dans un vase, il y a 3 fleurs rouges et 4 fleurs jaunes. Combien y a-t-il de fleurs en tout ?",
            data: [3, 4],
            expectedOperation: "addition",
            expectedResult: 7,
            unit: "fleurs"
        },
        {
            text: "Léa a 5 crayons bleus et 2 crayons rouges. Combien de crayons a-t-elle en tout ?",
            data: [5, 2],
            expectedOperation: "addition",
            expectedResult: 7,
            unit: "crayons"
        },
        {
            text: "Dans la classe, il y a 12 filles et 10 garçons. Combien y a-t-il d'élèves en tout ?",
            data: [12, 10],
            expectedOperation: "addition",
            expectedResult: 22,
            unit: "élèves"
        },
        {
            text: "Un fermier a 8 vaches et 5 cochons. Combien d'animaux a-t-il ?",
            data: [8, 5],
            expectedOperation: "addition",
            expectedResult: 13,
            unit: "animaux"
        },
        {
            text: "J'ai mangé 3 pommes et 2 bananes. Combien de fruits ai-je mangés ?",
            data: [3, 2],
            expectedOperation: "addition",
            expectedResult: 5,
            unit: "fruits"
        },
        {
            text: "Dans mon sac, j'ai 4 livres et 3 cahiers. Combien d'objets ai-je ?",
            data: [4, 3],
            expectedOperation: "addition",
            expectedResult: 7,
            unit: "objets"
        },
        {
            text: "Sur la table, il y a 6 assiettes et 6 verres. Combien y a-t-il d'objets de vaisselle ?",
            data: [6, 6],
            expectedOperation: "addition",
            expectedResult: 12,
            unit: "objets"
        },
        {
            text: "Paul a 10 billes. 4 sont rouges, les autres sont bleues. Combien a-t-il de billes bleues ?",
            data: [10, 4],
            expectedOperation: "subtraction",
            expectedResult: 6,
            unit: "billes"
        },
        {
            text: "Dans un bouquet de 15 fleurs, il y a 5 roses. Les autres sont des tulipes. Combien y a-t-il de tulipes ?",
            data: [15, 5],
            expectedOperation: "subtraction",
            expectedResult: 10,
            unit: "tulipes"
        },
        {
            text: "Une boîte contient 12 chocolats. 8 sont au lait, les autres sont noirs. Combien y a-t-il de chocolats noirs ?",
            data: [12, 8],
            expectedOperation: "subtraction",
            expectedResult: 4,
            unit: "chocolats"
        },
        {
            text: "Pierre a 20 euros. Il a un billet de 10 euros et des pièces. Combien a-t-il en pièces ?",
            data: [20, 10],
            expectedOperation: "subtraction",
            expectedResult: 10,
            unit: "euros"
        },
        {
            text: "Il y a 25 élèves. 12 sont des filles. Combien y a-t-il de garçons ?",
            data: [25, 12],
            expectedOperation: "subtraction",
            expectedResult: 13,
            unit: "garçons"
        },
        {
            text: "J'ai 7 feutres et 8 crayons de couleur. Combien ai-je de crayons en tout ?",
            data: [7, 8],
            expectedOperation: "addition",
            expectedResult: 15,
            unit: "crayons"
        },
        {
            text: "Dans le frigo, il y a 6 yaourts à la fraise et 4 à la vanille. Combien de yaourts y a-t-il ?",
            data: [6, 4],
            expectedOperation: "addition",
            expectedResult: 10,
            unit: "yaourts"
        },
        {
            text: "Marie a 5 poupées et 3 ours en peluche. Combien de jouets a-t-elle ?",
            data: [5, 3],
            expectedOperation: "addition",
            expectedResult: 8,
            unit: "jouets"
        }
    ],
    "problemes-comparaison": [
        {
            text: "Léo a 8 billes. Tom en a 3 de plus que Léo. Combien de billes a Tom ?",
            data: [8, 3],
            expectedOperation: "addition",
            expectedResult: 11,
            unit: "billes"
        },
        {
            text: "Julie a 10 ans. Son frère a 2 ans de moins qu'elle. Quel âge a son frère ?",
            data: [10, 2],
            expectedOperation: "subtraction",
            expectedResult: 8,
            unit: "ans"
        },
        {
            text: "Ma tour mesure 15 cubes. La tienne en a 4 de moins. Combien de cubes a ta tour ?",
            data: [15, 4],
            expectedOperation: "subtraction",
            expectedResult: 11,
            unit: "cubes"
        },
        {
            text: "J'ai 5 pommes. Tu en as 3 de plus que moi. Combien as-tu de pommes ?",
            data: [5, 3],
            expectedOperation: "addition",
            expectedResult: 8,
            unit: "pommes"
        },
        {
            text: "Le chien pèse 12 kg. Le chat pèse 8 kg de moins. Combien pèse le chat ?",
            data: [12, 8],
            expectedOperation: "subtraction",
            expectedResult: 4,
            unit: "kg"
        },
        {
            text: "Paul a 20 images. Pierre en a 5 de moins. Combien d'images a Pierre ?",
            data: [20, 5],
            expectedOperation: "subtraction",
            expectedResult: 15,
            unit: "images"
        },
        {
            text: "Sarah a 6 bonbons. Marc en a 4 de plus. Combien de bonbons a Marc ?",
            data: [6, 4],
            expectedOperation: "addition",
            expectedResult: 10,
            unit: "bonbons"
        },
        {
            text: "Mon immeuble a 5 étages. Le tien en a 2 de plus. Combien d'étages a ton immeuble ?",
            data: [5, 2],
            expectedOperation: "addition",
            expectedResult: 7,
            unit: "étages"
        },
        {
            text: "J'ai couru 10 minutes. Tu as couru 5 minutes de plus. Combien de temps as-tu couru ?",
            data: [10, 5],
            expectedOperation: "addition",
            expectedResult: 15,
            unit: "minutes"
        },
        {
            text: "Il fait 20 degrés. Hier il faisait 2 degrés de moins. Quelle température faisait-il hier ?",
            data: [20, 2],
            expectedOperation: "subtraction",
            expectedResult: 18,
            unit: "degrés"
        },
        {
            text: "Léa a 12 crayons. Sophie en a 3 de plus. Combien de crayons a Sophie ?",
            data: [12, 3],
            expectedOperation: "addition",
            expectedResult: 15,
            unit: "crayons"
        },
        {
            text: "Mon sac pèse 4 kg. Le tien pèse 1 kg de moins. Combien pèse ton sac ?",
            data: [4, 1],
            expectedOperation: "subtraction",
            expectedResult: 3,
            unit: "kg"
        },
        {
            text: "J'ai lu 8 pages. Tu en as lu 4 de plus. Combien de pages as-tu lues ?",
            data: [8, 4],
            expectedOperation: "addition",
            expectedResult: 12,
            unit: "pages"
        },
        {
            text: "Il y a 15 voitures rouges. Il y a 5 voitures bleues de moins. Combien y a-t-il de voitures bleues ?",
            data: [15, 5],
            expectedOperation: "subtraction",
            expectedResult: 10,
            unit: "voitures"
        },
        {
            text: "Tom a 9 ans. Sa soeur a 3 ans de plus. Quel âge a sa soeur ?",
            data: [9, 3],
            expectedOperation: "addition",
            expectedResult: 12,
            unit: "ans"
        }
    ],
    "problemes-composition-transformation": [
        {
            text: "Au jeu de l'oie, j'avance de 5 cases puis je recule de 2 cases. De combien de cases ai-je avancé en tout ?",
            data: [5, 2],
            expectedOperation: "subtraction",
            expectedResult: 3,
            unit: "cases"
        },
        {
            text: "Dans le bus, 3 personnes montent au premier arrêt, puis 4 personnes montent au deuxième. Combien de personnes sont montées en tout ?",
            data: [3, 4],
            expectedOperation: "addition",
            expectedResult: 7,
            unit: "personnes"
        },
        {
            text: "J'ai gagné 5 billes le matin, puis j'en ai perdu 2 l'après-midi. Combien de billes ai-je gagnées en tout ?",
            data: [5, 2],
            expectedOperation: "subtraction",
            expectedResult: 3,
            unit: "billes"
        },
        {
            text: "L'ascenseur monte de 4 étages, puis descend de 1 étage. De combien d'étages est-il monté ?",
            data: [4, 1],
            expectedOperation: "subtraction",
            expectedResult: 3,
            unit: "étages"
        },
        {
            text: "J'ai ajouté 2 verres d'eau, puis encore 3 verres. Combien de verres ai-je ajoutés ?",
            data: [2, 3],
            expectedOperation: "addition",
            expectedResult: 5,
            unit: "verres"
        },
        {
            text: "Il a fait +2 degrés le matin et +5 degrés l'après-midi. De combien la température a-t-elle augmenté ?",
            data: [2, 5],
            expectedOperation: "addition",
            expectedResult: 7,
            unit: "degrés"
        },
        {
            text: "J'ai mangé 2 bonbons à 10h et 1 bonbon à 16h. Combien de bonbons ai-je mangés ?",
            data: [2, 1],
            expectedOperation: "addition",
            expectedResult: 3,
            unit: "bonbons"
        },
        {
            text: "J'ai perdu 1 euro, puis j'ai perdu encore 2 euros. Combien ai-je perdu en tout ?",
            data: [1, 2],
            expectedOperation: "addition",
            expectedResult: 3,
            unit: "euros"
        },
        {
            text: "Le niveau de l'eau a monté de 10 cm, puis a baissé de 4 cm. De combien a-t-il monté en tout ?",
            data: [10, 4],
            expectedOperation: "subtraction",
            expectedResult: 6,
            unit: "cm"
        },
        {
            text: "J'ai fait 5 pas en avant, puis 2 pas en arrière. De combien de pas ai-je avancé ?",
            data: [5, 2],
            expectedOperation: "subtraction",
            expectedResult: 3,
            unit: "pas"
        },
        {
            text: "J'ai gagné 10 points, puis j'ai perdu 5 points. Combien de points ai-je gagnés ?",
            data: [10, 5],
            expectedOperation: "subtraction",
            expectedResult: 5,
            unit: "points"
        },
        {
            text: "J'ai reçu 3 lettres lundi et 2 lettres mardi. Combien de lettres ai-je reçues ?",
            data: [3, 2],
            expectedOperation: "addition",
            expectedResult: 5,
            unit: "lettres"
        },
        {
            text: "J'ai dépensé 5 euros pour un livre et 4 euros pour un cahier. Combien ai-je dépensé ?",
            data: [5, 4],
            expectedOperation: "addition",
            expectedResult: 9,
            unit: "euros"
        },
        {
            text: "Le train a avancé de 20 km puis a reculé de 5 km. A quelle distance est-il de son point de départ ?",
            data: [20, 5],
            expectedOperation: "subtraction",
            expectedResult: 15,
            unit: "km"
        },
        {
            text: "J'ai versé 5 litres d'eau puis j'en ai enlevé 2 litres. Combien de litres ai-je ajoutés ?",
            data: [5, 2],
            expectedOperation: "subtraction",
            expectedResult: 3,
            unit: "litres"
        }
    ]
};
