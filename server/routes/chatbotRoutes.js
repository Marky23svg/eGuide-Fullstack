import express from 'express';
import { retrieveChatbotContext, generateChatbotAnswer } from '../utils/chatbotRag.js';

const router = express.Router();

router.post('/query', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question.',
      });
    }

    const sanitizedQuestion = question.trim().slice(0, 500);
    const retrievedSources = await retrieveChatbotContext(sanitizedQuestion, 4);
    const answer = generateChatbotAnswer(sanitizedQuestion, retrievedSources);

    res.json({
      success: true,
      answer,
      sources: retrievedSources.map((item) => ({
        id: item.source.id,
        type: item.source.type,
        title: item.source.title,
        score: item.score,
      })),
    });
  } catch (error) {
    console.error('❌ Chatbot RAG error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to answer right now. Please try again in a moment.',
    });
  }
});

export default router;
