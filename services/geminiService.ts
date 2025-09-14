import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

let chat: Chat | null = null;

const startChat = () => {
    chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: "You are a helpful and friendly assistant. If asked to create a visual element or a simple webpage, you can respond with a single, self-contained HTML file content starting with <!DOCTYPE html>. When providing recommendations, format them as a JSON code block with the language specifier 'json:recommendations'. The JSON should be an array of objects, each with 'title', 'rationale', and 'actionItems' (an array of strings). Place this block at the end of your response.",
        },
    });
};

export const sendMessage = async (message: string): Promise<string> => {
    if (!chat) {
        startChat();
    }
    
    if (!chat) {
         throw new Error("Chat could not be initialized.");
    }

    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending message to Gemini API:", error);
        if (error instanceof Error) {
            if (error.message.includes('xhr error')) {
                 throw new Error(`A network error occurred. Please check your connection and try again.`);
            }
            throw new Error(`Failed to get response from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
};
