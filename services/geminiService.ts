
import { GoogleGenAI, Type } from "@google/genai";
import { Game, AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeGame(game: Game): Promise<AIAnalysisResult> {
  const prompt = `
    Analyze the following live sports game data and provide a betting recommendation.
    Target "Safe" and "High Probability" outcomes by cross-referencing momentum indicators.
    
    Game Details:
    Sport: ${game.sport}
    Matchup: ${game.homeTeam} vs ${game.awayTeam}
    Time Elapsed: ${game.stats.time} minutes
    Current Score: ${game.stats.score[0]} - ${game.stats.score[1]}
    Possession: ${game.stats.possession[0]}% - ${game.stats.possession[1]}%
    Shots on Target: ${game.stats.shots[0]} - ${game.stats.shots[1]}
    Corners: ${game.stats.corners[0]} - ${game.stats.corners[1]}
    Fouls: ${game.stats.fouls[0]} - ${game.stats.fouls[1]}
    Aggregate Player Form (Index 0-10): ${game.stats.playerForm[0]} - ${game.stats.playerForm[1]}
    Odds: Home(${game.homeOdds}), Away(${game.awayOdds})${game.drawOdds ? `, Draw(${game.drawOdds})` : ''}

    Rules:
    - If confidence is below 85%, recommend 'SKIP'.
    - Prioritize teams with higher player form and momentum (possession/shots/corners).
    - Consider disciplinary issues (fouls/yellow cards) as risk factors.
    - Provide a concise reasoning explaining why the recommendation is "Safe".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidence: { type: Type.NUMBER, description: "Confidence score from 0-100" },
            reasoning: { type: Type.STRING, description: "Brief logical explanation for the recommendation" },
            recommendation: { 
              type: Type.STRING, 
              enum: ['HOME', 'AWAY', 'DRAW', 'SKIP'],
              description: "The team to bet on or skip"
            },
          },
          required: ["confidence", "reasoning", "recommendation"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      confidence: result.confidence || 0,
      reasoning: result.reasoning || "Failed to analyze.",
      recommendation: result.recommendation || "SKIP"
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      confidence: 0,
      reasoning: "System overload. Analysis unavailable.",
      recommendation: "SKIP"
    };
  }
}
