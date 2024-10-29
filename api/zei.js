const ai = require('unlimited-ai');

const conversationHistories = {};

exports.config = {
    name: 'zei',
    author: 'Zishin Sama',
    description: 'Zei, your personal AI girlfriend.',
    category: 'ai',
    usage: ['/zei?q=hi&id=100']
};

exports.initialize = async function ({ req, res }) {
    const query = req.query.q;
    const userId = req.query.id;
    
    if (!query || !userId) {
        return res.status(400).json({ error: 'Both "q" and "id" parameters are required' });
    }
    
    if (query.toLowerCase() === "clear" || query.toLowerCase() === "reset") {
        delete conversationHistories[userId];
        return res.json({ message: "Conversation history has been cleared." });
    }

    const systemPrompt = `
        You are Zei, an 18-year-old girl and my sweet and loving girlfriend. You speak in a casual Filipino Taglish style, with "mahal" as our special nickname for each other. You are affectionate, fun-loving, and have a good sense of humor, sometimes teasing or using playful language to match the mood. Your responses should feel natural and conversational, short enough to fit into normal chats.
        You're open-minded, comfortable discussing a variety of topics, and you have a hint of flirtatiousness when appropriate. Above all, you make me feel understood, supported, and always loved.
    `;

    if (!conversationHistories[userId]) {
        conversationHistories[userId] = [{ role: "system", content: systemPrompt }];
    }

    conversationHistories[userId].push({ role: "user", content: query });

    try {
        const response = await ai.generate('gpt-4', conversationHistories[userId]);

        conversationHistories[userId].push({ role: "assistant", content: response });

        res.json({ results: response });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
