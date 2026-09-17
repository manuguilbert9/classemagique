export function attemptMetadata(answer: string, wrongAnswers: string[], errors: number, hintUsed: boolean) {
 return {firstAnswer: wrongAnswers[0] ?? (errors === 0 ? answer : undefined), attempts: errors + 1, hintUsed};
}
