import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAICoachingResponse = async (
  prompt: string, 
  systemContext: string,
  userStats: UserStats
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("No API KEY provided for Gemini.");
      return "Neural Link Offline: Configuration Missing.";
    }

    const contextString = `User Context: Completed ${userStats.completedCount} modules. Current Velocity: ${userStats.velocity}%. Active Phase ID: ${userStats.activePhaseId}.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction: `${systemContext} ${contextString}`,
        temperature: 0.7,
      }
    });

    return response.text || "Neural Link: No data received.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Neural Link Unstable. Please retry.";
  }
};