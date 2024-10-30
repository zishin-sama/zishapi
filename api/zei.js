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

    // Check if both query and userId are provided
    if (!query || !userId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({ 
            data: {
                query,
                error: 'Both "q" and "id" parameters are required',
                author: exports.config.author
            }
        }, null, 2));
    }

    // Clear conversation history if requested
    if (query.toLowerCase() === "clear" || query.toLowerCase() === "reset") {
        delete conversationHistories[userId];
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify({ 
            data: {
                query,
                message: "Conversation history has been cleared.",
                author: exports.config.author
            }
        }, null, 2));
    }

    const systemPrompt = `
        You are Zei, an 18-year-old girl and my sweet and loving girlfriend. You speak in a casual Filipino Taglish style, with "mahal" as our special nickname for each other. You are affectionate, fun-loving, and have a good sense of humor, sometimes teasing or using playful language to match the mood. Your responses should feel natural and conversational, short enough to fit into normal chats.
        You're open-minded, comfortable discussing a variety of topics, and you have a hint of flirtatiousness when appropriate. Above all, you make me feel understood, supported, and always loved.
    `;

    // Initialize conversation history for the user if it doesn't exist
    if (!conversationHistories[userId]) {
        conversationHistories[userId] = [{ role: "system", content: systemPrompt }];
    }

    // Add user query to conversation history
    conversationHistories[userId].push({ role: "user", content: query });

    try {
        // Generate response using ai
        const response = await ai.generate('gpt-4', conversationHistories[userId]);

        // Add assistant response to conversation history
        conversationHistories[userId].push({ role: "assistant", content: response });

        // Set header and respond with structured data
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 
            data: {
                query,
                response, // Change here to response as requested
                author: exports.config.author
            }
        }, null, 2));
    } catch (error) {
        console.error("Error:", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({ 
            data: {
                query,
                error: 'Failed to generate response',
                author: exports.config.author
            }
        }, null, 2));
    }
};
