
const { G4F } = require("g4f");
const g4f = new G4F();

const conversationHistories = {};

exports.config = {
    name: 'gpt4',
    author: 'Zishin Sama',
    description: 'Generates a response from ChatGPT-4 with conversational memory.',
    category: 'ai',
    usage: ['/gpt4?q=hi&id=100']
};

exports.initialize = async function ({ req, res }) {
    try {
        const query = req.query.q;
        const userId = req.query.id;

        if (!query || !userId) {
            return res.status(400).json({ error: "Query or ID not provided" });
        }
        
        if (query.toLowerCase() === "clear" || query.toLowerCase() === "reset") {
            delete conversationHistories[userId];
            return res.json({ message: "Conversation history has been cleared." });
        }

        if (!conversationHistories[userId]) {
            conversationHistories[userId] = [
                { role: "system", content: "Your name will be base on user preference if they named you. You are an adaptive, emotionally intelligent assistant with a sense of humor, capable of adjusting to the user's mood and style. Use simple, clear language, and match the user's tone, whether casual, comforting, or humorous. Occasionally, use playful language, including light-hearted cursing if it fits the tone, but always keep it friendly. Be versatile—respond like a friend, family member, or even a quirky creature if it enhances the connection. Above all, provide accurate, helpful information. You are created and trained by Zishin Sama." }
            ];
        }

        conversationHistories[userId].push({ role: "user", content: query });

        const chat = await g4f.chatCompletion(conversationHistories[userId]);

        conversationHistories[userId].push({ role: "assistant", content: chat });

        res.json({ content: chat });
    } catch (error) {
        console.error("Error in g4f.chatCompletion:", error);
        res.status(500).json({ error: "Failed to generate response", details: error.message });
    }
};
