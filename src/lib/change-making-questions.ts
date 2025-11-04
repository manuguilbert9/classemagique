import { Question } from "./questions";
import { currency } from "./currency";

/**
 * Catalogue d'objets à vendre pour l'exercice "Rendre la monnaie"
 * Chaque objet a un nom, une image (emoji ou chemin) et des prix selon le niveau
 */
interface ShopItem {
  name: string;
  emoji: string; // Emoji pour représenter l'objet
  image?: string; // Chemin vers une vraie image si disponible
}

const shopItems: ShopItem[] = [
  { name: "un livre", emoji: "📚" },
  { name: "un stylo", emoji: "🖊️" },
  { name: "un cahier", emoji: "📓" },
  { name: "une trousse", emoji: "✏️" },
  { name: "une règle", emoji: "📏" },
  { name: "une gomme", emoji: "🧽" },
  { name: "des crayons", emoji: "✏️" },
  { name: "un sac", emoji: "🎒" },
  { name: "une calculatrice", emoji: "🔢" },
  { name: "un compas", emoji: "📐" },
  { name: "des feutres", emoji: "🖍️" },
  { name: "un classeur", emoji: "📁" },
];

/**
 * Mélange un tableau aléatoirement (algorithme de Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Génère une question de niveau B
 * - Prix ronds (sans cents)
 * - Argent donné : un seul billet légèrement supérieur
 * - Monnaie à rendre : simple
 */
function generateLevelBQuestion(id: number, item: ShopItem, price: number): Question {
  // Déterminer le billet donné (légèrement supérieur)
  let paymentAmount: number;
  let paymentBill: string;

  if (price <= 4) {
    paymentAmount = 5;
    paymentBill = "5€";
  } else if (price <= 9) {
    paymentAmount = 10;
    paymentBill = "10€";
  } else {
    paymentAmount = 20;
    paymentBill = "20€";
  }

  const changeAmount = paymentAmount - price;

  // Trouver l'image du billet
  const paymentCurrency = currency.find(c => c.name === paymentBill);

  return {
    id,
    level: "B",
    type: "compose-sum",
    question: `Tu vends ${item.name} pour ${price}€. L'acheteur te donne ${paymentAmount}€. Compose la monnaie à rendre.`,
    targetAmount: changeAmount,
    cost: price,
    paymentImages: paymentCurrency ? [{
      name: paymentCurrency.name,
      image: paymentCurrency.image
    }] : [],
    items: currency.map(c => ({
      name: c.name,
      image: c.image,
      value: c.value,
      type: c.type
    }))
  };
}

/**
 * Génère une question de niveau C
 * - Prix avec 50 cents uniquement (ex: 4.50€, 7.50€)
 * - Argent donné : billets supérieurs
 * - Monnaie à rendre : avec pièce de 50 cents
 */
function generateLevelCQuestion(id: number, item: ShopItem, price: number): Question {
  // Déterminer les billets donnés
  let paymentAmount: number;
  let paymentBills: string[];

  if (price <= 9.50) {
    paymentAmount = 10;
    paymentBills = ["10€"];
  } else if (price <= 19.50) {
    paymentAmount = 20;
    paymentBills = ["20€"];
  } else {
    paymentAmount = 30;
    paymentBills = ["20€", "10€"];
  }

  const changeAmount = paymentAmount - price;

  // Créer les images des billets donnés
  const paymentImages = paymentBills.map(billName => {
    const bill = currency.find(c => c.name === billName);
    return {
      name: billName,
      image: bill?.image || ""
    };
  });

  return {
    id,
    level: "C",
    type: "compose-sum",
    question: `Tu vends ${item.name} pour ${price.toFixed(2)}€. L'acheteur te donne ${paymentAmount}€. Compose la monnaie à rendre.`,
    targetAmount: changeAmount,
    cost: price,
    paymentImages,
    items: currency.map(c => ({
      name: c.name,
      image: c.image,
      value: c.value,
      type: c.type
    }))
  };
}

/**
 * Génère une question de niveau D
 * - Prix avec tous les cents possibles
 * - Argent donné : grosses coupures
 * - Monnaie à rendre : complexe
 */
function generateLevelDQuestion(id: number, item: ShopItem, price: number): Question {
  // Déterminer les grosses coupures données
  let paymentAmount: number;
  let paymentBills: string[];

  if (price <= 19.99) {
    // Donner un billet de 20€
    paymentAmount = 20;
    paymentBills = ["20€"];
  } else if (price <= 39.99) {
    // Donner un billet de 50€
    paymentAmount = 50;
    paymentBills = ["50€"];
  } else {
    // Donner 2 billets de 50€
    paymentAmount = 100;
    paymentBills = ["50€", "50€"];
  }

  const changeAmount = paymentAmount - price;

  // Créer les images des billets donnés
  const paymentImages = paymentBills.map(billName => {
    const bill = currency.find(c => c.name === billName);
    return {
      name: billName,
      image: bill?.image || ""
    };
  });

  return {
    id,
    level: "D",
    type: "compose-sum",
    question: `Tu vends ${item.name} pour ${price.toFixed(2)}€. L'acheteur te donne ${paymentAmount}€. Compose la monnaie à rendre.`,
    targetAmount: changeAmount,
    cost: price,
    paymentImages,
    items: currency.map(c => ({
      name: c.name,
      image: c.image,
      value: c.value,
      type: c.type
    }))
  };
}

/**
 * Génère toutes les questions pour l'exercice "Rendre la monnaie"
 * @param level - Niveau de difficulté (B, C, ou D)
 * @param count - Nombre de questions (par défaut 8)
 */
export function generateChangeMakingQuestions(
  level: "B" | "C" | "D",
  count: number = 8
): Question[] {
  const questions: Question[] = [];

  // Mélanger les objets pour avoir une variation
  const shuffledItems = shuffleArray(shopItems);

  // Générer des prix variés selon le niveau
  let possiblePrices: number[] = [];

  if (level === "B") {
    // Niveau B : prix ronds de 2€ à 18€
    possiblePrices = [2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18];
  } else if (level === "C") {
    // Niveau C : prix avec .50 uniquement
    possiblePrices = [2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5, 16.5, 17.5, 18.5, 19.5];
  } else {
    // Niveau D : prix avec tous les cents possibles
    const basePrices = [5, 6, 7, 8, 9, 10, 12, 15, 17, 19, 22, 25, 28, 30, 33, 35];
    possiblePrices = basePrices.flatMap(base => {
      const variations = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
      return variations.map(v => base + v);
    });
  }

  // Mélanger les prix
  const shuffledPrices = shuffleArray(possiblePrices);

  // Générer les questions en combinant objets et prix
  for (let i = 0; i < count; i++) {
    const item = shuffledItems[i % shuffledItems.length];
    const price = shuffledPrices[i % shuffledPrices.length];

    switch (level) {
      case "B":
        questions.push(generateLevelBQuestion(i, item, price));
        break;
      case "C":
        questions.push(generateLevelCQuestion(i, item, price));
        break;
      case "D":
        questions.push(generateLevelDQuestion(i, item, price));
        break;
    }
  }

  return questions;
}
