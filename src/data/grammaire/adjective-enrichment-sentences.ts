export interface AdjectiveEnrichmentSentence { id: string; level: 'B' | 'C'; baseSentence: string; adjectives: string[]; validSentences: string[]; }
// Corpus relu : C ajoute plusieurs groupes nominaux, accords et déterminants.
export const ADJECTIVE_ENRICHMENT_SENTENCES: AdjectiveEnrichmentSentence[] = [
  {
    "id": "1",
    "baseSentence": "Le chat dort.",
    "adjectives": [
      "petit"
    ],
    "validSentences": [
      "Le petit chat dort."
    ],
    "level": "B"
  },
  {
    "id": "2",
    "baseSentence": "La voiture roule.",
    "adjectives": [
      "rouge"
    ],
    "validSentences": [
      "La voiture rouge roule."
    ],
    "level": "B"
  },
  {
    "id": "3",
    "baseSentence": "Un oiseau chante.",
    "adjectives": [
      "joli"
    ],
    "validSentences": [
      "Un joli oiseau chante."
    ],
    "level": "B"
  },
  {
    "id": "4",
    "baseSentence": "La fille marche.",
    "adjectives": [
      "petite"
    ],
    "validSentences": [
      "La petite fille marche."
    ],
    "level": "B"
  },
  {
    "id": "5",
    "baseSentence": "Le chien aboie.",
    "adjectives": [
      "grand"
    ],
    "validSentences": [
      "Le grand chien aboie."
    ],
    "level": "B"
  },
  {
    "id": "6",
    "baseSentence": "Une fleur pousse.",
    "adjectives": [
      "rouge"
    ],
    "validSentences": [
      "Une fleur rouge pousse."
    ],
    "level": "B"
  },
  {
    "id": "7",
    "baseSentence": "Le livre tombe.",
    "adjectives": [
      "épais"
    ],
    "validSentences": [
      "L’épais livre tombe.",
      "Le livre épais tombe."
    ],
    "level": "B"
  },
  {
    "id": "8",
    "baseSentence": "La robe sèche.",
    "adjectives": [
      "bleue"
    ],
    "validSentences": [
      "La robe bleue sèche."
    ],
    "level": "B"
  },
  {
    "id": "9",
    "baseSentence": "Le chat dort sur le canapé.",
    "adjectives": [
      "petit"
    ],
    "validSentences": [
      "Le petit chat dort sur le canapé.",
      "Le chat dort sur le petit canapé."
    ],
    "level": "C"
  },
  {
    "id": "10",
    "baseSentence": "La fille mange une pomme.",
    "adjectives": [
      "petite"
    ],
    "validSentences": [
      "La petite fille mange une pomme.",
      "La fille mange une petite pomme."
    ],
    "level": "C"
  },
  {
    "id": "11",
    "baseSentence": "Le garçon porte un sac.",
    "adjectives": [
      "lourd"
    ],
    "validSentences": [
      "Le garçon porte un sac lourd.",
      "Le garçon porte un lourd sac.",
      "Le garçon lourd porte un sac.",
      "Le lourd garçon porte un sac."
    ],
    "level": "C"
  },
  {
    "id": "12",
    "baseSentence": "La reine porte une robe.",
    "adjectives": [
      "magnifique"
    ],
    "validSentences": [
      "La magnifique reine porte une robe.",
      "La reine magnifique porte une robe.",
      "La reine porte une magnifique robe.",
      "La reine porte une robe magnifique."
    ],
    "level": "C"
  },
  {
    "id": "13",
    "baseSentence": "Les enfants jouent dans le parc.",
    "adjectives": [
      "joyeux"
    ],
    "validSentences": [
      "Les joyeux enfants jouent dans le parc.",
      "Les enfants joyeux jouent dans le parc."
    ],
    "level": "C"
  },
  {
    "id": "14",
    "baseSentence": "Une musique résonne dans la salle.",
    "adjectives": [
      "douce"
    ],
    "validSentences": [
      "Une douce musique résonne dans la salle.",
      "Une musique douce résonne dans la salle.",
      "Une musique résonne dans la douce salle.",
      "Une musique résonne dans la salle douce."
    ],
    "level": "C"
  },
  {
    "id": "15",
    "baseSentence": "Des fleurs décorent la table.",
    "adjectives": [
      "belles"
    ],
    "validSentences": [
      "De belles fleurs décorent la table.",
      "Des fleurs belles décorent la table."
    ],
    "level": "C"
  },
  {
    "id": "16",
    "baseSentence": "Un ami est venu me voir.",
    "adjectives": [
      "vieil"
    ],
    "validSentences": [
      "Un vieil ami est venu me voir."
    ],
    "level": "C"
  }
];
// Ajustements obligatoires lors de l'insertion d'un adjectif.
export function formatEnrichedSentence(words: string[]): string {
 return words.join(' ').replace(/\b([Ll])e ([aàâeéèêëiîïoôuùûüyœ])/g, "$1'$2")
 .replace(/\b([Ll])a ([aàâeéèêëiîïoôuùûüyœ])/g, "$1'$2")
 .replace(/\bDes belles\b/g, 'De belles');
}
export function normalizeEnrichedSentence(sentence: string): string {
 return sentence.replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
}
