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
];

/**
 * Génère une question de niveau B
 * - Prix ronds (sans cents)
 * - Argent donné : un seul billet légèrement supérieur
 * - Monnaie à rendre : simple
 */
function generateLevelBQuestion(id: number): Question {
  const item = shopItems[id % shopItems.length];

  // Prix possibles : 3€, 4€, 6€, 7€, 8€, 12€, 13€, 16€
  const possiblePrices = [3, 4, 6, 7, 8, 12, 13, 16];
  const price = possiblePrices[Math.floor(Math.random() * possiblePrices.length)];

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
function generateLevelCQuestion(id: number): Question {
  const item = shopItems[id % shopItems.length];

  // Prix possibles : X.50€ entre 3.50€ et 19.50€
  const basePrice = Math.floor(Math.random() * 17) + 3; // 3 à 19
  const price = basePrice + 0.5;

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
function generateLevelDQuestion(id: number): Question {
  const item = shopItems[id % shopItems.length];

  // Prix avec tous les cents : entre 5€ et 35€
  const euros = Math.floor(Math.random() * 31) + 5; // 5 à 35
  const cents = Math.floor(Math.random() * 100); // 0 à 99
  const price = euros + (cents / 100);

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

  for (let i = 0; i < count; i++) {
    switch (level) {
      case "B":
        questions.push(generateLevelBQuestion(i));
        break;
      case "C":
        questions.push(generateLevelCQuestion(i));
        break;
      case "D":
        questions.push(generateLevelDQuestion(i));
        break;
    }
  }

  return questions;
}
