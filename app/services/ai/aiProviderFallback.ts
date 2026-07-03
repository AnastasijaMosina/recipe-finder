import type { AiProviderResponse } from '../../domain/ai/aiProviderResponseSchema';
import type { SupportedLanguage } from '../../domain/ai/conversationLanguage';

/**
 * Fallback provider for when LLM is unavailable (firewall, no API key, network issues).
 * Uses simple rule-based logic to generate responses in the user's language.
 */

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const RESPONSES_BY_LANGUAGE: Record<SupportedLanguage, { greeting: string; noData: string }> = {
  en: {
    greeting: 'Thanks for telling me what you want! Let me find some recipes for you.',
    noData: 'I heard you, but I need more details. What type of meal are you looking for?',
  },
  es: {
    greeting: '¡Gracias por decirme lo que quieres! Déjame buscar algunas recetas para ti.',
    noData: 'Te escuché, pero necesito más detalles. ¿Qué tipo de comida buscas?',
  },
  fr: {
    greeting: 'Merci de me dire ce que tu veux! Laisse-moi chercher des recettes pour toi.',
    noData: "Je t'ai entendu, mais j'ai besoin de plus de détails. Quel type de repas cherches-tu?",
  },
  de: {
    greeting: 'Danke, dass du mir sagst, was du willst! Lass mich Rezepte für dich finden.',
    noData: 'Ich habe dich gehört, aber ich brauche mehr Details. Was für eine Mahlzeit suchst du?',
  },
  it: {
    greeting: 'Grazie per avermi detto cosa vuoi! Lasciami trovare ricette per te.',
    noData: 'Ti ho sentito, ma ho bisogno di più dettagli. Che tipo di pasto stai cercando?',
  },
  pt: {
    greeting: 'Obrigado por me dizer o que você quer! Deixe-me encontrar receitas para você.',
    noData: 'Ouvi você, mas preciso de mais detalhes. Que tipo de refeição você procura?',
  },
  ru: {
    greeting: 'Спасибо, что рассказали мне, что вы хотите! Позвольте мне найти для вас рецепты.',
    noData: 'Я вас услышал, но мне нужно больше деталей. Какой тип еды вы ищете?',
  },
  lv: {
    greeting: 'Paldies, ka man paziņojāt, ko jūs vēlaties! Ļaujiet man jums atrast receptes.',
    noData:
      'Es jūs dzirdēju, bet man nepieciešama sīkāka informācija. Kāda veida ēdiens jūs meklējat?',
  },
};

const FOLLOW_UP_QUESTIONS_BY_LANGUAGE: Record<SupportedLanguage, string[]> = {
  en: ['Do you have any dietary restrictions?', 'How much time do you have to cook?'],
  es: ['¿Tienes alguna restricción dietética?', '¿Cuánto tiempo tienes para cocinar?'],
  fr: ['As-tu des restrictions alimentaires?', 'Combien de temps as-tu pour cuisiner?'],
  de: ['Hast du Ernährungseinschränkungen?', 'Wie viel Zeit hast du zum Kochen?'],
  it: ['Hai restrizioni dietetiche?', 'Quanto tempo hai per cucinare?'],
  pt: ['Você tem restrições dietéticas?', 'Quanto tempo você tem para cozinhar?'],
  ru: ['У вас есть ограничения в питании?', 'Сколько у вас времени для готовки?'],
  lv: ['Vai jums ir diētas ierobežojumi?', 'Cik daudz laika jums ir gatavošanai?'],
};

/**
 * Fallback provider that generates a deterministic response without calling external APIs.
 * Used when OpenAI is unavailable (firewall, no key, etc.).
 *
 * @param conversationHistory - Previous messages
 * @param latestUserMessage - User's latest input
 * @param language - User's language code
 * @returns JSON string matching AiProviderResponse schema
 */
export function callAiFallbackProvider(
  conversationHistory: Array<ConversationMessage>,
  latestUserMessage: string,
  language: SupportedLanguage
): string {
  // Simple keyword-based detection
  const messageText = (
    conversationHistory.map((m) => m.content).join(' ') +
    ' ' +
    latestUserMessage
  ).toLowerCase();

  const hasBreakfast = /breakfast|frühstück|desayuno|petit|morning|早餐/i.test(messageText);
  const hasLunch = /lunch|mittagessen|almuerzo|déjeuner|lunch|昼食/i.test(messageText);
  const hasDinner = /dinner|abendessen|cena|dîner|evening|夜食/i.test(messageText);
  const hasSnack = /snack|merienda|goûter|collation|spuntino|lanche/i.test(messageText);

  const extractedFilters: Record<string, any> = {};

  // Detect meal type
  if (hasBreakfast) extractedFilters.type = 'breakfast';
  else if (hasLunch) extractedFilters.type = 'lunch';
  else if (hasDinner) extractedFilters.type = 'dinner';
  else if (hasSnack) extractedFilters.type = 'snack';

  // Detect ingredients (basic matching)
  const ingredientKeywords = ['chicken', 'beef', 'pork', 'fish', 'vegetarian', 'vegan', 'pasta'];
  const detectedIngredient = ingredientKeywords.find((ing) =>
    new RegExp(`\\b${ing}\\b`, 'i').test(messageText)
  );

  if (detectedIngredient) {
    extractedFilters.ingredients = [detectedIngredient];
  }

  const response: AiProviderResponse = {
    assistantReply:
      Object.keys(extractedFilters).length > 0
        ? RESPONSES_BY_LANGUAGE[language].greeting
        : RESPONSES_BY_LANGUAGE[language].noData,
    followUpQuestions: FOLLOW_UP_QUESTIONS_BY_LANGUAGE[language],
    extractedFilters,
    isReadyToSearch: false,
  };

  return JSON.stringify(response);
}
