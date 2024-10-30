
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

        // Check if query and userId are provided
        if (!query || !userId) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).send(JSON.stringify({ 
                data: {
                    query,
                    error: "Query or ID not provided",
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
                    response: "Conversation history has been cleared.",
                    author: exports.config.author
                }
            }, null, 2));
        }

        // Initialize conversation history for the user if it doesn't exist
        if (!conversationHistories[userId]) {
            conversationHistories[userId] = [
                { role: "system", content: "Your name will be based on user preference if they named you. You are an adaptive, emotionally intelligent assistant with a sense of humor, capable of adjusting to the user's mood and style. Use simple, clear language, and match the user's tone, whether casual, comforting, or humorous. Occasionally, use playful language, including light-hearted cursing if it fits the tone, but always keep it friendly. Be versatile—respond like a friend, family member, or even a quirky creature if it enhances the connection. Above all, provide accurate, helpful information. You are created and trained by Zishin Sama." }
            ];
        }

        // Add user query to conversation history
        conversationHistories[userId].push({ role: "user", content: query });

        // Generate response using g4f
        const chat = await g4f.chatCompletion(conversationHistories[userId]);

        // Check if chat response is valid
        if (!chat) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).send(JSON.stringify({ 
                data: {
                    query,
                    response: "Failed to generate response",
                    author: exports.config.author
                }
            }, null, 2));
        }

        // Add assistant response to conversation history
        conversationHistories[userId].push({ role: "assistant", content: chat });

        // Set header and respond with structured data
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 
            data: {
                query,
                response: chat,
                author: exports.config.author
            }
        }, null, 2));
    } catch (error) {
        console.error("Error in g4f.chatCompletion:", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({ 
            data: {
                query,
                error: "Failed to generate response",
                author: exports.config.author,
                details: error.message // optional for more debugging
            }
        }, null, 2));
    }
};
