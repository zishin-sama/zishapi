const ai = require('unlimited-ai');
const fs = require('fs').promises; // Use fs.promises for async/await
const path = require('path');

const models = new Set([
  'gpt-4o-mini-free', 'gpt-4o-mini', 'gpt-4o-free', 'gpt-4-turbo-2024-04-09',
  'gpt-4o-2024-08-06', 'grok-2', 'grok-2-mini', 'claude-3-opus-20240229',
  'claude-3-opus-20240229-gcp', 'claude-3-sonnet-20240229', 'claude-3-5-sonnet-20240620',
  'claude-3-haiku-20240307', 'claude-2.1', 'gemini-1.5-flash-exp-0827', 'gemini-1.5-pro-exp-0827'
]);

const conversationHistoryFile = path.join(__dirname, 'conversationHistories.json');

// Load conversation histories from the file
async function loadConversationHistories() {
  try {
    const data = await fs.readFile(conversationHistoryFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or another error occurs, return an empty object
    console.error("Error loading conversation histories:", error);
    return {};
  }
}

// Save conversation histories to the file
async function saveConversationHistories(histories) {
  try {
    await fs.writeFile(conversationHistoryFile, JSON.stringify(histories, null, 2));
  } catch (error) {
    console.error("Error saving conversation histories:", error);
  }
}

exports.config = {
  name: 'ai',
  author: 'Zishin Sama',
  description: 'Advanced API for dynamic text generation using various AI models',
  category: 'ai',
  usage: ['/ai?q=hi&id=1']
};

exports.initialize = async function ({ req, res }) {
  const { q: question, id: userId, model, system } = req.query;

  if (question && question.toLowerCase() === 'clear') {
    const conversationHistories = await loadConversationHistories();
    delete conversationHistories[userId];
    await saveConversationHistories(conversationHistories);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send({
      data: {
        message: "Conversation history has been cleared."
      }
    });
  }

  if (!userId || !question) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).send({
      data: {
        error: "Missing required parameters",
        message: "Please provide 'id' (user ID) and 'q' (question) query parameters.",
        exampleUsage: "/ai?q=Hello&id=100&model=gpt-4-turbo-2024-04-09&system=You%20are%20a%20helpful%20assistant"
      }
    });
  }

  // Validate model if provided
  const conversationHistories = await loadConversationHistories();
  if (model && !models.has(model)) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).send({
      data: {
        error: "Invalid model selection",
        message: `The model '${model}' is not supported. Please select from the available models.`,
        availableModels: Array.from(models)
      }
    });
  }

  if (!conversationHistories[userId]) {
    conversationHistories[userId] = {
      history: [],
      model: model || 'gpt-4-turbo-2024-04-09'
    };
  }

  const messages = [
    { role: 'user', content: question }
  ];

  try {
    const chatResponse = await ai.generate(conversationHistories[userId].model, messages);

    // Store the conversation in user history
    const conversation = {
      question,
      response: chatResponse
    };
    conversationHistories[userId].history.push(conversation);

    // Save updated histories to the file
    await saveConversationHistories(conversationHistories);

    // Clean API response
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      data: {
        query: question,
        response: chatResponse,
        author: exports.config.author
      }
    });
  } catch (error) {
    console.error("Error in AI response generation:", error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send({
      data: {
        error: "Internal Server Error",
        message: "An unexpected error occurred during AI response generation. Please try again later.",
        errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

// Load initial conversation histories when the server starts
(async () => {
  conversationHistories = await loadConversationHistories();
})();
