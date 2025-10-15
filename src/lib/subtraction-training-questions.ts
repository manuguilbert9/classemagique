export interface SubtractionQuestion {
  num1: number;
  num2: number;
  borrowCount: number; // 0, 1, or 2
}

/**
 * Generates a subtraction without any borrowing needed
 */
function generateNoBorrowSubtraction(): SubtractionQuestion {
  // Generate a 2-digit number where each digit in num1 >= corresponding digit in num2
  const tens1 = Math.floor(Math.random() * 6) + 4; // 4-9
  const units1 = Math.floor(Math.random() * 10); // 0-9

  const tens2 = Math.floor(Math.random() * (tens1 + 1)); // 0 to tens1
  const units2 = Math.floor(Math.random() * (units1 + 1)); // 0 to units1

  const num1 = tens1 * 10 + units1;
  const num2 = tens2 * 10 + units2;

  return { num1, num2, borrowCount: 0 };
}

/**
 * Generates a subtraction with exactly 1 borrowing needed
 */
function generateOneBorrowSubtraction(): SubtractionQuestion {
  // Strategy: Make units2 > units1, but tens1 >= tens2 (after borrow)
  const tens1 = Math.floor(Math.random() * 6) + 4; // 4-9
  const units1 = Math.floor(Math.random() * 5); // 0-4 (low units)

  const units2 = Math.floor(Math.random() * (10 - units1 - 1)) + units1 + 1; // units2 > units1
  const tens2 = Math.floor(Math.random() * (tens1 - 1)) + 1; // 1 to tens1-1 (ensure we can borrow)

  const num1 = tens1 * 10 + units1;
  const num2 = tens2 * 10 + units2;

  // Verify it's actually 1 borrow
  if (units1 < units2 && tens1 >= tens2) {
    return { num1, num2, borrowCount: 1 };
  }

  // Fallback: construct one manually
  return { num1: 52, num2: 27, borrowCount: 1 };
}

/**
 * Generates a subtraction with exactly 2 borrowings needed
 */
function generateTwoBorrowSubtraction(): SubtractionQuestion {
  // Strategy: 3-digit number where we need to borrow twice
  // Example: 302 - 158 (borrow from tens to units, then from hundreds to tens)

  const hundreds1 = Math.floor(Math.random() * 6) + 4; // 4-9
  const tens1 = Math.floor(Math.random() * 3); // 0-2 (low tens)
  const units1 = Math.floor(Math.random() * 3); // 0-2 (low units)

  const hundreds2 = Math.floor(Math.random() * (hundreds1 - 1)) + 1; // 1 to hundreds1-1
  const tens2 = Math.floor(Math.random() * 5) + 4; // 4-8 (high tens)
  const units2 = Math.floor(Math.random() * 5) + 4; // 4-8 (high units)

  const num1 = hundreds1 * 100 + tens1 * 10 + units1;
  const num2 = hundreds2 * 100 + tens2 * 10 + units2;

  // Verify the borrow conditions
  const needsUnitsBorrow = units1 < units2;
  const needsTensBorrow = tens1 < tens2;

  if (needsUnitsBorrow && needsTensBorrow) {
    return { num1, num2, borrowCount: 2 };
  }

  // Fallback: construct one manually
  return { num1: 502, num2: 278, borrowCount: 2 };
}

/**
 * Generates the 3 progressive subtraction problems for one exercise session
 */
export function generateSubtractionTrainingSet(): SubtractionQuestion[] {
  return [
    generateNoBorrowSubtraction(),
    generateOneBorrowSubtraction(),
    generateTwoBorrowSubtraction(),
  ];
}
