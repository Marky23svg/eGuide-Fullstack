import Requirement from '../models/requirement.js';
import Announcement from '../models/announcement.js';

const CACHE_TTL_MS = 2 * 60 * 1000;
const RELEVANCE_THRESHOLD = 20;

let chatbotCache = {
  requirements: null,
  announcements: null,
  expiresAt: 0,
};

export const invalidateChatbotCache = () => {
  chatbotCache = {
    requirements: null,
    announcements: null,
    expiresAt: 0,
  };
};

// Utility functions
const normalize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text = '') => {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'your', 'you',
    'what', 'when', 'where', 'how', 'why', 'about', 'need', 'can', 'should',
    'please', 'show', 'tell', 'me', 'my', 'are', 'is', 'do', 'to', 'of', 'a', 'an',
    'in', 'on', 'at', 'be', 'it', 'as', 'or', 'also'
  ]);
  
  return normalize(text)
    .split(' ')
    .filter((token) => token.length >= 3 && !stopWords.has(token));
};

const summarizeText = (text = '', maxLength = 200) => {
  const cleaned = normalize(text).trim();
  if (!cleaned) return '';
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + '...';
};

const uniqueByTitle = (docs) => {
  const seen = new Set();
  return docs.filter((doc) => {
    const titleKey = normalize(doc.title);
    if (!titleKey || seen.has(titleKey)) return false;
    seen.add(titleKey);
    return true;
  });
};

// More aggressive dedup: remove near-duplicates (titles that are substrings of each other)
const deduplicateNearMatches = (docs) => {
  if (docs.length <= 1) return docs;
  
  const sorted = [...docs].sort((a, b) => a.title.length - b.title.length);
  const kept = [];
  
  for (const doc of sorted) {
    const norm = normalize(doc.title);
    // Skip if a longer, more specific title with the same core tokens already exists
    const isDuplicate = kept.some(kept_doc => {
      const keptNorm = normalize(kept_doc.title);
      // If this doc's normalized title is a substring of an already-kept doc, skip it
      if (keptNorm.includes(norm) && keptNorm !== norm) {
        console.log(`[RAG DEBUG] Filtering near-match: "${doc.title}" ⊂ "${kept_doc.title}"`);
        return true;
      }
      return false;
    });
    
    if (!isDuplicate) {
      kept.push(doc);
    }
  }
  
  return kept;
};

const isGreeting = (question = '') => 
  /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(question);

const isLatestQuery = (question = '') => {
  const text = normalize(question);
  return /\b(latest|recent|new|announcement|news)\b/.test(text);
};

const classifyQuestion = (question = '') => {
  const text = normalize(question);
  const hasRequirement = /\b(requirement|document|enrollment|registration|procedure|steps|form|sog|transcript|tor)\b/i.test(text);
  const hasAnnouncement = /\b(announcement|news|update|notice|bulletin|latest|recent)\b/i.test(text);
  
  if (hasRequirement && !hasAnnouncement) return 'requirement';
  if (hasAnnouncement && !hasRequirement) return 'announcement';
  if (hasRequirement && hasAnnouncement) return 'both';
  return 'general';
};

// Retrieve all requirements from cache or database
const getAllRequirements = async () => {
  if (Date.now() < chatbotCache.expiresAt && chatbotCache.requirements) {
    console.log('[RAG DEBUG] Returning cached requirements:', chatbotCache.requirements.map(r => r.title));
    return chatbotCache.requirements;
  }
  
  const docs = await Requirement.find()
    .sort({ date_posted: -1 })
    .select('_id title requirements procedure date_posted')
    .lean();
  
  console.log('[RAG DEBUG] Fetched from database - Requirement count:', docs.length);
  docs.forEach(doc => console.log(`  - "${doc.title}"`));
  
  const result = docs.map((doc) => ({
    id: doc._id.toString(),
    type: 'requirement',
    title: doc.title,
    requirements: doc.requirements || '',
    procedure: doc.procedure || '',
    date_posted: doc.date_posted,
    fullText: `${doc.title} ${doc.requirements} ${doc.procedure}`,
  }));
  
  chatbotCache.requirements = result;
  if (chatbotCache.announcements) {
    chatbotCache.expiresAt = Date.now() + CACHE_TTL_MS;
  }
  
  return result;
};

// Retrieve all announcements from cache or database
const getAllAnnouncements = async () => {
  if (Date.now() < chatbotCache.expiresAt && chatbotCache.announcements) {
    return chatbotCache.announcements;
  }
  
  const docs = await Announcement.find()
    .sort({ date_posted: -1 })
    .select('_id title content description fullDetails category date date_posted')
    .lean();
  
  const result = docs.map((doc) => ({
    id: doc._id.toString(),
    type: 'announcement',
    title: doc.title,
    content: doc.content || '',
    description: doc.description || '',
    fullDetails: doc.fullDetails || '',
    category: doc.category || '',
    date: doc.date,
    date_posted: doc.date_posted,
    fullText: `${doc.title} ${doc.content} ${doc.description} ${doc.fullDetails}`,
  }));
  
  chatbotCache.announcements = result;
  if (chatbotCache.requirements) {
    chatbotCache.expiresAt = Date.now() + CACHE_TTL_MS;
  }
  
  return result;
};

// Search requirements using full-text search, prioritizing title matches
const searchRequirements = async (question) => {
  const query = tokenize(question).join(' ');
  if (!query) {
    const all = await getAllRequirements();
    console.log('[RAG] searchRequirements - empty query, returning all:', all.map(r => r.title));
    return all;
  }
  
  const allRequirements = await getAllRequirements();
  
  // Filter by title match first
  const titleMatches = allRequirements.filter((doc) => {
    const titleTokens = tokenize(doc.title);
    const queryTokens = tokenize(question);
    return queryTokens.some(q => titleTokens.some(t => t.includes(q) || q.includes(t)));
  });
  
  console.log(`[RAG] searchRequirements("${question}") - title matches: ${titleMatches.map(t => t.title).join(', ')}`);
  
  if (titleMatches.length > 0) {
    const deduped = uniqueByTitle(titleMatches);
    const filtered = deduplicateNearMatches(deduped);
    console.log(`[RAG] After dedup: ${filtered.map(t => t.title).join(', ')}`);
    return filtered;
  }
  
  // Fallback to full-text search if no title matches
  try {
    const results = await Requirement.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, date_posted: -1 })
      .select('_id title requirements procedure date_posted')
      .lean();
    
    console.log(`[RAG] searchRequirements - full-text fallback for "${query}": ${results.map(r => r.title).join(', ')}`);
    
    if (results.length > 0) {
      const mapped = results.map((doc) => ({
        id: doc._id.toString(),
        type: 'requirement',
        title: doc.title,
        requirements: doc.requirements || '',
        procedure: doc.procedure || '',
        date_posted: doc.date_posted,
        fullText: `${doc.title} ${doc.requirements} ${doc.procedure}`,
      }));
      const deduped = uniqueByTitle(mapped);
      const filtered = deduplicateNearMatches(deduped);
      console.log(`[RAG] Full-text after dedup: ${filtered.map(t => t.title).join(', ')}`);
      return filtered;
    }
  } catch (error) {
    console.error('[RAG] Text search error:', error.message);
  }
  
  return [];
};

// Search announcements using full-text search, prioritizing title matches
const searchAnnouncements = async (question, latest = false) => {
  if (latest) {
    const docs = await Announcement.find()
      .sort({ date_posted: -1 })
      .limit(5)
      .select('_id title content description fullDetails category date date_posted')
      .lean();
    
    return docs.map((doc) => ({
      id: doc._id.toString(),
      type: 'announcement',
      title: doc.title,
      content: doc.content || '',
      description: doc.description || '',
      fullDetails: doc.fullDetails || '',
      category: doc.category || '',
      date: doc.date,
      date_posted: doc.date_posted,
      fullText: `${doc.title} ${doc.content} ${doc.description} ${doc.fullDetails}`,
    }));
  }
  
  const query = tokenize(question).join(' ');
  if (!query) return getAllAnnouncements();
  
  const allAnnouncements = await getAllAnnouncements();
  
  // Filter by title match first
  const titleMatches = allAnnouncements.filter((doc) => {
    const titleTokens = tokenize(doc.title);
    const queryTokens = tokenize(question);
    return queryTokens.some(q => titleTokens.some(t => t.includes(q) || q.includes(t)));
  });
  
  if (titleMatches.length > 0) {
    const deduped = uniqueByTitle(titleMatches);
    const filtered = deduplicateNearMatches(deduped);
    console.log(`[RAG] Announcements after dedup: ${filtered.map(t => t.title).join(', ')}`);
    return filtered;
  }
  
  // Fallback to full-text search if no title matches
  try {
    const results = await Announcement.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, date_posted: -1 })
      .select('_id title content description fullDetails category date date_posted')
      .lean();
    
    if (results.length > 0) {
      const mapped = results.map((doc) => ({
        id: doc._id.toString(),
        type: 'announcement',
        title: doc.title,
        content: doc.content || '',
        description: doc.description || '',
        fullDetails: doc.fullDetails || '',
        category: doc.category || '',
        date: doc.date,
        date_posted: doc.date_posted,
        fullText: `${doc.title} ${doc.content} ${doc.description} ${doc.fullDetails}`,
      }));
      const deduped = uniqueByTitle(mapped);
      const filtered = deduplicateNearMatches(deduped);
      console.log(`[RAG] Announcements full-text after dedup: ${filtered.map(t => t.title).join(', ')}`);
      return filtered;
    }
  } catch (error) {
    console.error('[RAG] Text search error:', error.message);
  }
  
  return [];
};

// Score a document based on question relevance
const scoreRelevance = (question, document) => {
  const questionTokens = tokenize(question);
  const docTokens = tokenize(document.fullText);
  
  let score = 0;
  const titleTokens = tokenize(document.title);
  
  // Title matches are worth more
  for (const token of questionTokens) {
    if (titleTokens.some(t => t.includes(token) || token.includes(t))) {
      score += 20;
    }
  }
  
  // Full text matches
  for (const token of questionTokens) {
    const matches = docTokens.filter(t => t.includes(token) || token.includes(t)).length;
    score += matches * 5;
  }
  
  return score;
};

// Main RAG retrieval function
export const retrieveChatbotContext = async (question, topK = 4) => {
  const questionType = classifyQuestion(question);
  const isLatest = isLatestQuery(question);
  
  if (isLatest) {
    const announcements = await searchAnnouncements(question, true);
    return {
      results: announcements.map((doc, idx) => ({
        source: doc,
        score: 100 - idx,
      })),
      correctedInterpretation: null,
    };
  }
  
  // Fetch sources based on question type
  let requirements = [];
  let announcements = [];
  
  if (questionType !== 'announcement') {
    requirements = await searchRequirements(question);
  }
  if (questionType !== 'requirement') {
    announcements = await searchAnnouncements(question, false);
  }
  
  const allDocs = [...requirements, ...announcements];
  
  if (allDocs.length === 0) {
    return { results: [], correctedInterpretation: null };
  }
  
  // Score and rank documents
  const scored = allDocs
    .map((doc) => ({
      source: doc,
      score: scoreRelevance(question, doc),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  return { results: scored, correctedInterpretation: null };
};

// Format requirement document for display
const formatRequirement = (doc) => {
  const lines = [`📘 ${doc.title}`]

  if (doc.requirements?.trim()) {
    lines.push('\nWhat you need:')
    doc.requirements.split('\n').filter(s => s.trim()).forEach(line => {
      const noteMatch = line.match(/^\[note:(strict|moderate|normal|plain)\] (.*)/)
      if (noteMatch) {
        lines.push(`  ⚠️ ${noteMatch[2]}`)
      } else {
        lines.push(`  • ${line.trim()}`)
      }
    })
  }

  if (doc.procedure?.trim()) {
    lines.push('\nProcedure:')
    let stepNum = 0
    doc.procedure.split('\n').filter(s => s.trim()).forEach(line => {
      const noteMatch = line.match(/^\[note:(strict|moderate|normal|plain)\] (.*)/)
      if (noteMatch) {
        lines.push(`  ⚠️ ${noteMatch[2]}`)
      } else {
        stepNum++
        lines.push(`  ${stepNum}. ${line.trim()}`)
      }
    })
  }

  return lines.join('\n')
}

// Format announcement document for display
const formatAnnouncement = (doc) => {
  const lines = [`📢 ${doc.title}`];
  
  if (doc.date) lines.push(`📅 ${doc.date}`);
  if (doc.category) lines.push(`Category: ${doc.category}`);
  
  const details = doc.fullDetails || doc.description || doc.content;
  if (details) {
    lines.push(summarizeText(details, 200));
  }
  
  return lines.join('\n');
};

// Main answer generation function
export const generateChatbotAnswer = (question, retrievedSources = []) => {
  if (!question?.trim()) {
    return {
      text: 'Hello! I can help you find academic requirements, documents, and announcements. What would you like to know?',
      requirementSources: [],
    };
  }
  
  if (isGreeting(question)) {
    return {
      text: 'Hi there! I can help you with academic requirements, documents, and announcements. What would you like to know?',
      requirementSources: [],
    };
  }
  
  if (!retrievedSources.length) {
    return {
      text: 'I couldn\'t find matching documents. Please try asking about a specific requirement or announcement, or check the Documents page.',
      requirementSources: [],
    };
  }
  
  // Check if this is a "latest announcements" query
  if (isLatestQuery(question) && retrievedSources[0]?.source?.type === 'announcement') {
    const announcements = retrievedSources
      .map((item, idx) => {
        const doc = item.source;
        return `${idx + 1}. **${doc.title}** - ${doc.date || 'Recent'}`;
      })
      .join('\n');
    
    return {
      text: `📢 Latest Announcements:\n\n${announcements}\n\nAsk for details on any announcement by name.`,
      requirementSources: [],
    };
  }
  
  // Filter by relevance threshold
  const bestScore = retrievedSources[0]?.score || 0;
  if (bestScore < RELEVANCE_THRESHOLD) {
    return {
      text: 'I couldn\'t find a close match for your question. Please try rephrasing or check the Documents page.',
      requirementSources: [],
    };
  }
  
  // Deduplicate by document ID and normalized title
  const seen = new Set();
  const seenTitles = new Set();
  const unique = [];
  
  for (const item of retrievedSources) {
    const doc = item.source || item;
    
    if (!doc || !doc.id) {
      console.log('[RAG DEBUG] Skipping invalid item:', item);
      continue;
    }
    
    // Deduplicate by normalized title to catch exact duplicates with different IDs
    const normalizedTitle = normalize(doc.title);
    
    if (seen.has(doc.id) || seenTitles.has(normalizedTitle)) {
      console.log(`[RAG DEBUG] Skipping duplicate: "${doc.title}" (ID: ${doc.id})`);
      continue;
    }
    
    seen.add(doc.id);
    seenTitles.add(normalizedTitle);
    unique.push({ source: doc, score: item.score || 0 });
  }
  
  // Format answer
  const formattedDocs = unique
    .map((item) => 
      item.source.type === 'requirement'
        ? formatRequirement(item.source)
        : formatAnnouncement(item.source)
    )
    .join('\n\n');
  
  // Extract requirement sources for buttons
  const requirementSources = unique
    .filter((item) => item.source.type === 'requirement')
    .map((item) => ({
      id: item.source.id,
      title: item.source.title,
    }));
  
  const hasButtons = requirementSources.length > 0 ? '\n\nTap the button below to view the full document.' : ''

  return {
    text: `${formattedDocs}${hasButtons}`,
    requirementSources,
  }
};

// Create text indexes for faster searches
export const ensureTextIndexes = async () => {
  try {
    await Requirement.collection.createIndex(
      { title: 'text', requirements: 'text', procedure: 'text' },
      { default_language: 'none' }
    );
    console.log('✅ Text indexes created on Requirement');
    
    await Announcement.collection.createIndex(
      { title: 'text', content: 'text', description: 'text', fullDetails: 'text' },
      { default_language: 'none' }
    );
    console.log('✅ Text indexes created on Announcement');
  } catch (error) {
    console.error('❌ Error creating text indexes:', error.message);
  }
};
