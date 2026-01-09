import { GoogleGenAI, Type } from "@google/genai";
import { AIParseResult } from "../types";

export async function parseMenuItem(input: string): Promise<AIParseResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this food item description. Extract: 
    1. Title (catchy)
    2. Professional description
    3. Price (number)
    4. isVeg (boolean)
    5. Category (e.g., 'Main Course', 'Sides', 'Beverage', 'Dessert')

    Input: "${input}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          price: { type: Type.NUMBER },
          isVeg: { type: Type.BOOLEAN },
          category: { type: Type.STRING },
        },
        required: ["title", "description", "price", "isVeg", "category"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("The AI returned an empty response.");
  return JSON.parse(text) as AIParseResult;
}

export async function generateImage(dishTitle: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A professional food photography shot of ${dishTitle}. High resolution, bokeh background, commercial lighting, delicious presentation.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned.");
  } catch (err: any) {
    console.error("Gemini Image Error Details:", err);
    if (err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED") || err.status === 429) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    throw err;
  }
}

export function getUnsplashFallback(query: string): string {
  const encodedQuery = encodeURIComponent(query.replace(/\s+/g, ','));
  // Using LoremFlickr which is a more reliable proxy for searchable professional images
  return `https://loremflickr.com/800/800/food,${encodedQuery}/all?sig=${Math.floor(Math.random() * 1000)}`;
}