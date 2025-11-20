'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FleaMarketInputSchema = z.object({
    itemName: z.string(),
    studentPrice: z.number(),
    level: z.enum(['B', 'C', 'D']),
});

const FleaMarketOutputSchema = z.object({
    emoji: z.string(),
    finalPrice: z.number(),
    message: z.string(),
    isNegotiated: z.boolean(),
});

type FleaMarketInput = z.infer<typeof FleaMarketInputSchema>;
type FleaMarketOutput = z.infer<typeof FleaMarketOutputSchema>;

const fleaMarketPrompt = ai.definePrompt({
    name: 'fleaMarketPrompt',
    input: { schema: FleaMarketInputSchema },
    output: { schema: FleaMarketOutputSchema },
    prompt: `Tu es un client dans une brocante organisée par une classe d'école primaire.
Un élève te propose de vendre un objet.

Objet : "{{itemName}}"
Prix proposé par l'élève : {{studentPrice}}€
Niveau de l'élève : {{level}}

Tes objectifs :
1. Trouver un émoji qui correspond le mieux à l'objet "{{itemName}}".
2. Décider d'un prix final (finalPrice) en respectant STRICTEMENT les contraintes pédagogiques du niveau :
   - Niveau B (CE1) : Le prix DOIT être un nombre ENTIER (pas de centimes) et inférieur à 20€.
   - Niveau C (CE2) : Le prix DOIT être un nombre ENTIER (pas de centimes) et inférieur à 100€.
   - Niveau D (CM1) : Le prix peut avoir des centimes (ex: 12.50, 5.90) ou être entier, inférieur à 100€.

Comportement de négociation :
- Si le prix proposé par l'élève respecte déjà les contraintes du niveau, tu peux l'accepter tel quel, OU le négocier légèrement (à la baisse) pour rendre le jeu amusant (ex: "C'est un peu cher pour un vieux livre...").
- Si le prix NE respecte PAS les contraintes (ex: 25€ pour niveau B, ou 12.50€ pour niveau B), tu DOIS proposer un nouveau prix qui respecte les contraintes.
- Sois bienveillant et amusant dans ton message.

Retourne un JSON :
{
  "emoji": "l'émoji",
  "finalPrice": le prix final (nombre),
  "message": "Ton message à l'élève (ex: 'D'accord, je te le prends !' ou 'C'est trop cher, je te propose X€.')",
  "isNegotiated": true si tu as changé le prix, false sinon
}
`,
});

const fleaMarketFlowInternal = ai.defineFlow(
    {
        name: 'fleaMarketFlow',
        inputSchema: FleaMarketInputSchema,
        outputSchema: FleaMarketOutputSchema,
    },
    async (input: FleaMarketInput) => {
        const { output } = await fleaMarketPrompt(input);
        return output!;
    }
);

export async function fleaMarketFlow(input: FleaMarketInput): Promise<FleaMarketOutput> {
    return fleaMarketFlowInternal(input);
}
