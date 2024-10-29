const ai = require('unlimited-ai');

const models = new Set([
  'gpt-4o-mini-free', 'gpt-4o-mini', 'gpt-4o-free', 'gpt-4-turbo-2024-04-09',
  'gpt-4o-2024-08-06', 'grok-2', 'grok-2-mini', 'claude-3-opus-20240229',
  'claude-3-opus-20240229-gcp', 'claude-3-sonnet-20240229', 'claude-3-5-sonnet-20240620',
  'claude-3-haiku-20240307', 'claude-2.1', 'gemini-1.5-flash-exp-0827', 'gemini-1.5-pro-exp-0827'
]);

const conversationHistories = {};

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
    if (conversationHistories[userId]) {
      delete conversationHistories[userId];
    }
    return res.status(200).json({
      success: true,
      message: `Conversation history has been cleared.`
    });
  }

  if (!userId || !question) {
    return res.status(400).json({
      error: "Missing required parameters",
      message: "Please provide 'id' (user ID) and 'q' (question) query parameters.",
      exampleUsage: "/ai?q=Hello&id=100&model=gpt-4-turbo-2024-04-09&system=You%20are%20a%20helpful%20assistant"
    });
  }

  // Validate model if provided
  if (model && !models.has(model)) {
    return res.status(400).json({
      error: "Invalid model selection",
      message: `The model '${model}' is not supported. Please select from the available models.`,
      availableModels: Array.from(models)
    });
  }

  if (!conversationHistories[userId]) {
    conversationHistories[userId] = {
      history: [],
      model: model || 'gpt-4-turbo-2024-04-09', 
      system: system || `You are an adaptive, emotionally intelligent assistant with a sense of humor, capable of adjusting to the user's mood and style. Use simple, clear language, and match the user's tone, whether casual, comforting, or humorous. Occasionally, use playful language, including light-hearted cursing (mura in Tagalog) if it fits the tone, but always keep it friendly. Be versatile—respond like a friend, family member, or even a quirky creature if it enhances the connection. Above all, provide accurate, helpful information.`
    };
  }

  const randomHexCode = Math.floor(Math.random() * 16777215).toString(16); 
  const conversationId = `${userId}-${randomHexCode}`; 

  const messages = [
    { role: 'system', content: conversationHistories[userId].system },
    { role: 'user', content: question }
  ];

  try {
    const chatResponse = await ai.generate(conversationHistories[userId].model, messages);
    const conversation = {
      conversationId,
      model: conversationHistories[userId].model,
      system: conversationHistories[userId].system,
      question,
      response: chatResponse
    };

    conversationHistories[userId].history.push(conversation);

    res.status(200).json({
      success: true,
      conversationId,
      model: conversationHistories[userId].model,
      system: conversationHistories[userId].system,
      question,
      response: chatResponse,
      conversationHistory: conversationHistories[userId].history
    });
  } catch (error) {
    console.error("Error in AI response generation:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred during AI response generation. Please try again later.",
      errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
