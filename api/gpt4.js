const { G4F } = require("g4f");
const g4f = new G4F();

const conversationHistories = {};

exports.config = {
    name: 'gpt',
    author: 'Zishin Sama',
    description: 'Chat with ChatGPT',
    category: 'ai',
    usage: ['/gpt?q=hi&id=1']
};

exports.initialize = async function ({ req, res }) {
    try {
        // Get query parameters
        const question = req.query.q;
        const userId = req.query.id;

        // Validate that both 'q' and 'id' are provided
        if (!question || !userId) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).send(JSON.stringify({
                data: {
                    error: "Missing parameters: please add ?q=your_question_here&id=user_id",
                    author: exports.config.author
                }
            }, null, 2));
        }

        // Check for "clear" keyword to reset conversation history
        if (question.trim().toLowerCase() === "clear") {
            delete conversationHistories[userId];
            res.setHeader('Content-Type', 'application/json');
            return res.send(JSON.stringify({
                data: {
                    message: "Conversation history has been cleared.",
                    author: exports.config.author
                }
            }, null, 2));
        }

        // Initialize conversation history if it doesn't exist for the user
        if (!conversationHistories[userId]) {
            conversationHistories[userId] = [
                { role: "system", content: "You’re a friendly assistant here to help." }
            ];
        }

        // Add the user question to conversation history
        conversationHistories[userId].push({ role: "user", content: question });

        // Generate ChatGPT response
        const chat = await g4f.chatCompletion(conversationHistories[userId]);

        // Check if response is valid
        if (!chat) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).send(JSON.stringify({
                data: {
                    question,
                    error: "Failed to generate a response. Try again later.",
                    author: exports.config.author
                }
            }, null, 2));
        }

        // Add AI response to conversation history
        conversationHistories[userId].push({ role: "assistant", content: chat });

        // Return the AI response
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            data: {
                question,
                response: chat,
                author: exports.config.author
            }
        }, null, 2));
    } catch (error) {
        console.error("Error in chat generation:", error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({
            data: {
                question,
                error: "An internal error occurred. Please try again later.",
                author: exports.config.author,
                details: error.message // Optional for debugging
            }
        }, null, 2));
    }
};
