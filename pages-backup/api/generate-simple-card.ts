import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

const generateCompleteCardPrompt = (pokemonName: string) => `
You are a Trading Card Game expert. Create a COMPLETE creature card for "${pokemonName}".

Use your knowledge of this creature to generate authentic stats, attacks, and details that match its canonical abilities and characteristics.

Return this exact JSON structure (IMPORTANT: Return ONLY the JSON, no other text):

{
  "name": "${pokemonName}",
  "subname": null,
  "hitpoints": 120,
  "supertypeId": 1,
  "typeId": 2,
  "subtypeId": 1,
  "variationId": null,
  "rarityId": null,
  "weaknessTypeId": 3,
  "resistanceTypeId": null,
  "retreatCost": 2,
  "illustrator": "PlayMore TCG",
  "cardNumber": "001",
  "totalInSet": "150",
  "dexStats": "Height: 1'04\\" Weight: 13.2 lbs",
  
  "description": null,
  "hasAbility": false,
  "ability": null,
  "move1": {
    "name": "Thunder Shock",
    "description": "Flip a coin. If tails, this attack does nothing.",
    "damageAmount": 30,
    "damageModifier": null,
    "energyCost": [
      {"amount": 1, "typeId": 4}
    ]
  },
  "hasMove2": true,
  "move2": {
    "name": "Thunderbolt",
    "description": "Discard an Energy card attached to this creature.",
    "damageAmount": 90,
    "damageModifier": null,
    "energyCost": [
      {"amount": 2, "typeId": 4},
      {"amount": 1, "typeId": 11}
    ]
  }
}

REFERENCE IDs:
Types: 1=Grass, 2=Fire, 3=Water, 4=Lightning, 5=Psychic, 6=Fighting, 7=Dark, 8=Metal, 9=Dragon, 10=Fairy, 11=Colorless
Subtypes: 1=Basic, 2=Stage1, 3=Stage2, 4=V, 5=VMAX, 6=VSTAR

GENERATION RULES:
1. Use canonical creature data (type, evolution stage, size, abilities)
2. Create 1-2 thematic attacks based on the creature's known moves
3. Set appropriate HP (Basic: 60-120, Stage1: 80-140, Stage2: 100-180)
4. Choose logical weakness/resistance based on creature type matchups
5. Set retreat cost based on creature size/weight (small=0-1, medium=1-2, large=2-4)
6. Generate authentic creature encyclopedia entry and stats that do NOT contain the word "pokemon"
7. Make energy costs balanced (total 1-4 energy per attack)
8. Include interesting attack effects that match the creature's personality
9. Use "damageModifier": "×" for multiplication, "+" for addition, null for none
10. Set hasMove2 to false if creature should only have 1 attack
11. Set hasAbility to true and include ability if creature has a signature ability
12. Make card number sequential and set size appropriate (usually 150-200 cards per set)

Create an authentic, balanced, and fun-to-play creature card!
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pokemonName } = req.body;

  if (!pokemonName?.trim()) {
    return res.status(400).json({ error: 'Creature name is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: generateCompleteCardPrompt(pokemonName.trim()),
    });

    if (!response.text) {
      throw new Error('No response from Gemini AI');
    }

    let responseText = response.text.trim();

    // Clean up response - remove any non-JSON text
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON found in AI response');
    }

    responseText = responseText.substring(jsonStart, jsonEnd);

    let cardData;
    try {
      cardData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('AI response:', responseText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate required fields
    if (!cardData.name || !cardData.hitpoints || !cardData.supertypeId) {
      throw new Error('AI response missing required fields');
    }

    return res.status(200).json(cardData);
  } catch (error) {
    console.error('AI generation error:', error);

    let errorMessage = 'Failed to generate card. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Google AI service not properly configured.';
      } else if (error.message.includes('parse')) {
        errorMessage = 'AI returned invalid data. Please try again.';
      } else if (error.message.includes('No response')) {
        errorMessage = 'AI service temporarily unavailable. Please try again.';
      }
    }

    return res.status(500).json({ error: errorMessage });
  }
}
