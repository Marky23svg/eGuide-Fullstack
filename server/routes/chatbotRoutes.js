import express from 'express';
import { retrieveChatbotContext, generateChatbotAnswer } from '../utils/chatbotRag.js';
import Requirement from '../models/requirement.js';
import Announcement from '../models/announcement.js';

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
    const { results: retrievedSources, correctedInterpretation } =
      await retrieveChatbotContext(sanitizedQuestion, 4);

    const { text: answer, requirementSources } = generateChatbotAnswer(
      sanitizedQuestion,
      retrievedSources
    );

    res.json({
      success: true,
      answer,
      requirementSources,
      // Non-null only when the bot corrected typos/abbreviations.
      // e.g. user typed "enrollmnt" → correctedInterpretation: "enrollment"
      correctedInterpretation: correctedInterpretation || null,
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

// Debug endpoint: show all requirements in database
router.get('/debug/requirements', async (req, res) => {
  try {
    const docs = await Requirement.find().select('_id title').lean();
    res.json({
      count: docs.length,
      requirements: docs.map(d => ({ id: d._id, title: d.title })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint: remove duplicate by keeping first occurrence
router.post('/admin/deduplicate', async (req, res) => {
  try {
    const docs = await Requirement.find().sort({ date_posted: 1 }).lean();
    const seen = new Map(); // title -> _id (first occurrence)
    const toDelete = [];

    for (const doc of docs) {
      const key = doc.title.toLowerCase().trim();
      if (seen.has(key)) {
        toDelete.push(doc._id);
        console.log(`[CLEANUP] Removing duplicate: "${doc.title}" (ID: ${doc._id})`);
      } else {
        seen.set(key, doc._id);
      }
    }

    if (toDelete.length === 0) {
      return res.json({ message: 'No duplicates found', deleted: 0 });
    }

    const result = await Requirement.deleteMany({ _id: { $in: toDelete } });
    res.json({
      message: `Deleted ${result.deletedCount} duplicate(s)`,
      deleted: result.deletedCount,
      removedIds: toDelete,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
