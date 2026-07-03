import type { AiMissingSlot } from '../../domain/ai/conversationContract';
import type { SupportedLanguage } from '../../domain/ai/conversationLanguage';

type SlotQuestionMap = Record<AiMissingSlot, string>;
type SlotAnswerMap = Record<AiMissingSlot, string[]>;

const SLOT_QUESTIONS: Record<SupportedLanguage, SlotQuestionMap> = {
  en: {
    type: 'What meal type do you want (breakfast, lunch, dinner, snack)?',
    cuisine: 'Any preferred cuisine (Italian, Mexican, Asian, etc.)?',
    includeIngredients: 'Which main ingredients would you like to include?',
    excludeIngredients: 'Any ingredients you want to avoid?',
    maxReadyTime: 'How many minutes do you have to prepare the meal?',
  },
  es: {
    type: '¿Qué tipo de comida quieres (desayuno, almuerzo, cena, merienda)?',
    cuisine: '¿Tienes alguna cocina preferida (italiana, mexicana, asiática, etc.)?',
    includeIngredients: '¿Qué ingredientes principales te gustaría incluir?',
    excludeIngredients: '¿Hay algún ingrediente que quieras evitar?',
    maxReadyTime: '¿Cuántos minutos tienes para preparar la comida?',
  },
  fr: {
    type: 'Quel type de repas voulez-vous (petit-déjeuner, déjeuner, dîner, collation)?',
    cuisine: 'Avez-vous une cuisine préférée (italienne, mexicaine, asiatique, etc.)?',
    includeIngredients: 'Quels ingrédients principaux souhaitez-vous inclure?',
    excludeIngredients: 'Y a-t-il des ingrédients que vous voulez éviter?',
    maxReadyTime: 'Combien de minutes avez-vous pour préparer le repas?',
  },
  de: {
    type: 'Welche Mahlzeit möchten Sie (Frühstück, Mittagessen, Abendessen, Snack)?',
    cuisine: 'Haben Sie eine bevorzugte Küche (Italienisch, Mexikanisch, Asiatisch, usw.)?',
    includeIngredients: 'Welche Hauptzutaten möchten Sie gerne einschließen?',
    excludeIngredients: 'Gibt es Zutaten, die Sie vermeiden möchten?',
    maxReadyTime: 'Wie viele Minuten haben Sie zur Zubereitung der Mahlzeit?',
  },
  it: {
    type: 'Che tipo di pasto vuoi (colazione, pranzo, cena, spuntino)?',
    cuisine: 'Hai una cucina preferita (italiana, messicana, asiatica, ecc.)?',
    includeIngredients: 'Quali ingredienti principali vorresti includere?',
    excludeIngredients: 'Ci sono ingredienti che vuoi evitare?',
    maxReadyTime: 'Quanti minuti hai per preparare il pasto?',
  },
  pt: {
    type: 'Que tipo de refeição você quer (café da manhã, almoço, jantar, lanche)?',
    cuisine: 'Você tem alguma culinária preferida (italiana, mexicana, asiática, etc.)?',
    includeIngredients: 'Quais ingredientes principais você gostaria de incluir?',
    excludeIngredients: 'Há algum ingrediente que você quer evitar?',
    maxReadyTime: 'Quantos minutos você tem para preparar a refeição?',
  },
};

const SLOT_POSSIBLE_ANSWERS: Record<SupportedLanguage, SlotAnswerMap> = {
  en: {
    type: ['breakfast', 'lunch', 'dinner', 'snack'],
    cuisine: ['italian', 'mexican', 'asian', 'mediterranean'],
    includeIngredients: ['chicken', 'beef', 'fish', 'tofu'],
    excludeIngredients: ['dairy', 'nuts', 'gluten', 'shellfish'],
    maxReadyTime: ['15', '30', '45', '60'],
  },
  es: {
    type: ['desayuno', 'almuerzo', 'cena', 'merienda'],
    cuisine: ['italiana', 'mexicana', 'asiática', 'mediterránea'],
    includeIngredients: ['pollo', 'ternera', 'pescado', 'tofu'],
    excludeIngredients: ['lácteos', 'frutos secos', 'gluten', 'mariscos'],
    maxReadyTime: ['15', '30', '45', '60'],
  },
  fr: {
    type: ['petit-déjeuner', 'déjeuner', 'dîner', 'collation'],
    cuisine: ['italienne', 'mexicaine', 'asiatique', 'méditerranéenne'],
    includeIngredients: ['poulet', 'bœuf', 'poisson', 'tofu'],
    excludeIngredients: ['produits laitiers', 'noix', 'gluten', 'fruits de mer'],
    maxReadyTime: ['15', '30', '45', '60'],
  },
  de: {
    type: ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack'],
    cuisine: ['Italienisch', 'Mexikanisch', 'Asiatisch', 'Mediterran'],
    includeIngredients: ['Hühnchen', 'Rindfleisch', 'Fisch', 'Tofu'],
    excludeIngredients: ['Milchprodukte', 'Nüsse', 'Gluten', 'Meeresfrüchte'],
    maxReadyTime: ['15', '30', '45', '60'],
  },
  it: {
    type: ['colazione', 'pranzo', 'cena', 'spuntino'],
    cuisine: ['italiana', 'messicana', 'asiatica', 'mediterranea'],
    includeIngredients: ['pollo', 'manzo', 'pesce', 'tofu'],
    excludeIngredients: ['latticini', 'noci', 'glutine', 'molluschi'],
    maxReadyTime: ['15', '30', '45', '60'],
  },
  pt: {
    type: ['café da manhã', 'almoço', 'jantar', 'lanche'],
    cuisine: ['italiana', 'mexicana', 'asiática', 'mediterrânea'],
    includeIngredients: ['frango', 'carne bovina', 'peixe', 'tofu'],
    excludeIngredients: ['laticínios', 'nozes', 'glúten', 'frutos do mar'],
    maxReadyTime: ['15', '30', '45', '60'],
  },
};

const WELCOME_MESSAGES: Record<SupportedLanguage, string> = {
  en: 'Tell me what you are craving, and I will suggest possible answers until we can search.',
  es: 'Dime lo que te apetece comer y te ayudaré con preguntas hasta poder buscar recetas.',
  fr: "Dites-moi ce que vous avez envie de manger et je vous aiderai avec des questions jusqu'à pouvoir chercher des recettes.",
  de: 'Sagen Sie mir, worauf Sie Hunger haben, und ich stelle Ihnen Fragen, bis wir Rezepte suchen können.',
  it: 'Dimmi cosa ti va di mangiare e ti aiuterò con domande finché non potremo cercare ricette.',
  pt: 'Me diga o que você está com vontade de comer e vou fazer perguntas até conseguirmos buscar receitas.',
};

const ACKNOWLEDGMENT_MESSAGES: Record<SupportedLanguage, string> = {
  en: 'Got it.',
  es: 'Entendido.',
  fr: 'Compris.',
  de: 'Verstanden.',
  it: 'Capito.',
  pt: 'Entendido.',
};

const READY_MESSAGES: Record<SupportedLanguage, string> = {
  en: 'Great, I have enough details. I can search recipes now.',
  es: 'Perfecto, tengo suficientes detalles. Puedo buscar recetas ahora.',
  fr: "Parfait, j'ai assez de détails. Je peux chercher des recettes maintenant.",
  de: 'Wunderbar, ich habe genug Details. Ich kann jetzt Rezepte suchen.',
  it: 'Ottimo, ho abbastanza dettagli. Posso cercare ricette ora.',
  pt: 'Ótimo, tenho detalhes suficientes. Posso buscar receitas agora.',
};

const FALLBACK_MESSAGES: Record<SupportedLanguage, string> = {
  en: 'I could not process that request safely. Please try again with a short recipe preference.',
  es: 'No pude procesar esa solicitud. Por favor, intenta de nuevo con una preferencia de receta.',
  fr: "Je n'ai pas pu traiter cette demande. Veuillez réessayer avec une courte préférence de recette.",
  de: 'Ich konnte diese Anfrage nicht verarbeiten. Bitte versuchen Sie es erneut mit einer Rezeptpräferenz.',
  it: 'Non riesco a elaborare quella richiesta. Riprova con una breve preferenza di ricetta.',
  pt: 'Não foi possível processar essa solicitação. Tente novamente com uma preferência de receita.',
};

export const getSlotQuestion = (slot: AiMissingSlot, language: SupportedLanguage): string =>
  SLOT_QUESTIONS[language][slot];

export const getSlotPossibleAnswers = (
  slot: AiMissingSlot,
  language: SupportedLanguage
): string[] => SLOT_POSSIBLE_ANSWERS[language][slot];

export const getAllSlotQuestions = (language: SupportedLanguage): SlotQuestionMap =>
  SLOT_QUESTIONS[language];

export const getWelcomeMessage = (language: SupportedLanguage): string =>
  WELCOME_MESSAGES[language];

export const buildAssistantReply = (
  firstFollowUpQuestion: string | undefined,
  language: SupportedLanguage
): string =>
  firstFollowUpQuestion
    ? `${ACKNOWLEDGMENT_MESSAGES[language]} ${firstFollowUpQuestion}`
    : READY_MESSAGES[language];

export const getFallbackMessage = (language: SupportedLanguage): string =>
  FALLBACK_MESSAGES[language];
