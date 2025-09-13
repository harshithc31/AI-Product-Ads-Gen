import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Example models:
// - gemini-1.5-flash  (fast, cheaper, good for text+light multimodal)
// - gemini-1.5-pro    (higher quality, slower)
// - imagen-3          (image generation)
// - veo-2 / veo-3     (video generation, if your plan allows)

export const geminiTextModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
export const geminiImageModel = genAI.getGenerativeModel({ model: "imagen-3.0" });
export const geminiVideoModel = genAI.getGenerativeModel({ model: "veo-2" });
