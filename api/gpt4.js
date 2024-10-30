const { G4F } = require("g4f");
const g4f = new G4F();

const conversationHistories = {};

exports.config = {
    name: 'gpt',
    author: 'Zishin Sama',
    description: 'Chat with ChatGPT',
    category: 'ai',
    usage: ['/gpt?prompt=hi&id=1']
};

exports.initialize = async function ({ req, res }) {
    try {
        // Get query parameters
        const { prompt, id } = req.query;

        // Validate that both 'prompt' and 'id' are provided
        if (!prompt || !id) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).send(JSON.stringify({
                data: {
                    error: "Missing parameters: please add ?prompt=your_question_here&id=user_id",
                    author: exports.config.author
                }
            }, null, 2));
        }

        // Check for "clear" keyword to reset conversation history
        if (prompt.trim().toLowerCase() === "clear") {
            delete conversationHistories[id];
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).send(JSON.stringify({
                data: {
                    message: "Conversation history has been cleared.",
                    author: exports.config.author
                }
            }, null, 2));
        }

        // Initialize conversation history if it doesn't exist for the user
        if (!conversationHistories[id]) {
            conversationHistories[id] = [
                { role: "system", content: "You are Zishin a friendly assistant. Created and trained by Zishin" }
            ];
        }

        // Add the user question to conversation history
        conversationHistories[id].push({ role: "user", content: prompt });

        // Generate ChatGPT response
        const chat = await g4f.chatCompletion(conversationHistories[id]);

        // Check if response is valid
        if (!chat) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).send(JSON.stringify({
                data: {
                    prompt,
                    error: "Failed to generate a response. Try again later.",
                    author: exports.config.author
                }
            }, null, 2));
        }

        // Add AI response to conversation history
        conversationHistories[id].push({ role: "assistant", content: chat });

        // Return the AI response
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({
            data: {
                prompt,
                response: chat,
                author: exports.config.author
            }
        }, null, 2));
    } catch (error) {
        console.error("Error in chat generation:", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({
            data: {
                prompt,
                error: "An internal error occurred. Please try again later.",
                author: exports.config.author,
                details: error.message // Optional for debugging
            }
        }, null, 2));
    }
};
