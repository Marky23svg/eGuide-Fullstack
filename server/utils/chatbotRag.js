import Requirement from '../models/requirement.js';
import Announcement from '../models/announcement.js';

const CACHE_TTL_MS = 2 * 60 * 1000;
const RELEVANCE_SCORE_THRESHOLD = 25;

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

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'your', 'you', 'what',
  'when', 'where', 'how', 'why', 'about', 'need', 'need', 'can', 'could', 'should',
  'please', 'show', 'tell', 'me', 'my', 'our', 'are', 'is', 'do', 'does', 'to', 'of',
  'a', 'an', 'in', 'on', 'at', 'into', 'be', 'it', 'as', 'or', 'also', 'latest', 'recent'
]);

// ── Fuzzy matching ────────────────────────────────────────────────────────────

/**
 * Levenshtein distance between two strings.
 * Returns the number of single-character edits needed to transform a → b.
 */
const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = 1 + Math.min(
          matrix[i - 1][j],     // deletion
          matrix[i][j - 1],     // insertion
          matrix[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

/**
 * Returns true if `query` is close enough to `target` to be considered a match.
 * Tolerance scales with word length: short words need exact match, longer words
 * allow 1–2 edits.
 */
const isFuzzyMatch = (query, target) => {
  if (query === target) return true;
  const len = Math.max(query.length, target.length);
  // Allow 1 edit for words 5–7 chars, 2 edits for 8+ chars
  const tolerance = len >= 8 ? 2 : len >= 5 ? 1 : 0;
  if (tolerance === 0) return false;
  return levenshtein(query, target) <= tolerance;
};

/**
 * Given a list of query tokens (possibly with typos), expand them by finding
 * fuzzy matches against a known vocabulary set.
 * Returns a new Set of tokens that includes both originals and matched corrections.
 */
const expandTokensWithFuzzy = (queryTokens, vocabularyTokens) => {
  const expanded = new Set(queryTokens);
  for (const qToken of queryTokens) {
    for (const vToken of vocabularyTokens) {
      if (!expanded.has(vToken) && isFuzzyMatch(qToken, vToken)) {
        expanded.add(vToken);
      }
    }
  }
  return expanded;
};

const normalize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text = '') =>
  normalize(text)
    .split(' ')
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));

const summarizeText = (text = '', maxLength = 220) => {
  const cleaned = normalize(text).replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}...`;
};

const chunkContent = (text = '') => {
  const cleaned = normalize(text);
  if (!cleaned) return [];

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) return [cleaned];

  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length <= 220) {
      current = next;
      continue;
    }

    if (current) chunks.push(current);
    current = sentence;
  }

  if (current) chunks.push(current);
  return chunks;
};

const isGreeting = (question = '') => /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalize(question));

const buildGenericResponse = (question = '') => {
  if (isGreeting(question)) {
    return 'Hello! I can help with academic requirements, document steps, and the latest announcements. Ask me about a specific document or announcement.';
  }

  return 'I can help with academic requirements, document steps, and the latest announcements. Try asking about a specific requirement, document, or announcement.';
};

const buildTextSearchQuery = (question) => {
  const tokens = tokenize(question);
  return tokens.length > 0 ? tokens.join(' ') : null;
};

const isSogQuestion = (question) => {
  return /\b(sog|summary of grades|summary grades|grades summary|grade summary)\b/i.test(question);
};

// ✅ Check if user is asking for latest/general announcements
const isLatestAnnouncementQuery = (question) => {
  const text = normalize(question);
  const latestPatterns = [
    /^(latest|recent|new)\s*(announcements?|news|updates?)$/i,
    /announcements?(\s*(latest|recent|new))?$/i,
    /what's?\s*(new|latest|recent)/i,
    /show\s*(me\s*)?(latest|recent)\s*(announcements?|news)/i,
    /any\s*(new|latest|recent)\s*(announcements?|news)/i,
    /^(announcements?|news|updates)\s*$/i,
    /^(latest|recent|new)\s*$/i,
  ];
  
  return latestPatterns.some(pattern => pattern.test(text));
};

const classifyQuestionType = (question) => {
  const text = normalize(question);
  
  // Special case: short announcement queries
  if (text === 'announcements' || text === 'announcement' || 
      text === 'latest' || text === 'news' || text === 'updates') {
    return 'announcement';
  }
  
  const announcementKeywords = /\b(announcement|news|update|notice|latest|urgent|bulletin|posted|reminder|recent)\b/;
  const requirementKeywords = /\b(enroll|enrollment|registration|sog|summary of grades|summary grades|grades summary|grade summary|prospectus|admission|application|document|documents|requirements|procedure|steps|forms|form 137|psa|birth certificate|school id|student id|transcript|clearance|applicant|assessment)\b/;
  
  const isAnnouncement = announcementKeywords.test(text);
  const isRequirement = requirementKeywords.test(text);

  if (isRequirement && !isAnnouncement) return 'requirement';
  if (isAnnouncement && !isRequirement) return 'announcement';
  if (isRequirement && isAnnouncement) return 'both';
  return 'general';
};

const sourceMatchesSog = (source) => {
  const text = normalize([
    source.title,
    source.content,
    source.description || '',
    source.fullDetails || '',
    Array.isArray(source.requirementsList) ? source.requirementsList.join(' ') : '',
  ].join(' '));

  return /\b(sog|summary of grades|summary grades|grades summary|grade summary)\b/.test(text);
};

// Extract main topic from question (e.g., "TOR" from "how to get TOR")
const extractMainTopic = (question) => {
  const patterns = [
    /how to get\s+([a-z\s]+)/i,
    /how to obtain\s+([a-z\s]+)/i,
    /what is\s+([a-z\s]+)/i,
    /tell me about\s+([a-z\s]+)/i,
    /where to get\s+([a-z\s]+)/i,
    /requirements for\s+([a-z\s]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      return normalize(match[1]);
    }
  }
  return null;
};

// Extract question intent
const extractIntent = (question) => {
  const text = normalize(question);
  
  if (/\b(how to get|how to obtain|how to request|how do i get|where to get|procedure|steps)\b/.test(text)) {
    return 'procedure';
  }
  
  if (/\b(what are the requirements|what do i need|documents needed|requirements for)\b/.test(text)) {
    return 'requirements_only';
  }
  
  return 'general';
};

const getAllRequirementSources = async () => {
  if (Date.now() < chatbotCache.expiresAt && chatbotCache.requirements) {
    return chatbotCache.requirements;
  }

  const requirements = await Requirement.find()
    .sort({ date_posted: -1 })
    .select('title requirements procedure date_posted')
    .lean();

  const result = requirements.map((item) => ({
    id: item._id.toString(),
    type: 'requirement',
    title: item.title,
    requirementsText: item.requirements,
    procedureText: item.procedure,
    content: `${item.title}\n${item.requirements}\n${item.procedure}`,
    metadata: {
      date_posted: item.date_posted || null,
    },
  }));

  chatbotCache.requirements = result;
  if (chatbotCache.announcements) {
    chatbotCache.expiresAt = Date.now() + CACHE_TTL_MS;
  }

  return result;
};

const getAllAnnouncementSources = async () => {
  if (Date.now() < chatbotCache.expiresAt && chatbotCache.announcements) {
    return chatbotCache.announcements;
  }

  const announcements = await Announcement.find()
    .sort({ date_posted: -1 })
    .select('title content description fullDetails category date date_posted requirements')
    .lean();

  const result = announcements.map((item) => ({
    id: item._id.toString(),
    type: 'announcement',
    title: item.title,
    description: item.description,
    fullDetails: item.fullDetails,
    category: item.category,
    date: item.date,
    requirementsList: Array.isArray(item.requirements) ? item.requirements : [],
    content: [
      item.title,
      item.description,
      item.content,
      item.fullDetails,
      item.category,
      ...(Array.isArray(item.requirements) ? item.requirements : []),
    ]
      .filter(Boolean)
      .join('\n'),
    metadata: {
      date: item.date || null,
      category: item.category || null,
      date_posted: item.date_posted || null,
    },
  }));

  chatbotCache.announcements = result;
  if (chatbotCache.requirements) {
    chatbotCache.expiresAt = Date.now() + CACHE_TTL_MS;
  }

  return result;
};

const searchRequirementSources = async (question) => {
  const textSearch = buildTextSearchQuery(question);

  // Try MongoDB text search first
  if (textSearch) {
    const results = await Requirement.find(
      { $text: { $search: textSearch } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, date_posted: -1 })
      .select('title requirements procedure date_posted')
      .lean();

    if (results.length > 0) {
      return results.map((item) => ({
        id: item._id.toString(),
        type: 'requirement',
        title: item.title,
        requirementsText: item.requirements,
        procedureText: item.procedure,
        content: `${item.title}\n${item.requirements}\n${item.procedure}`,
        metadata: { date_posted: item.date_posted || null },
      }));
    }
  }

  // Fallback: load all requirements so fuzzy scoring can work on typos
  return getAllRequirementSources();
};

const searchAnnouncementSources = async (question, isLatest = false) => {
  // If asking for latest announcements, return recent ones
  if (isLatest) {
    const recentAnnouncements = await Announcement.find()
      .sort({ date_posted: -1 })
      .limit(5)
      .select('title content description fullDetails category date date_posted requirements')
      .lean();
    
    return recentAnnouncements.map((item) => ({
      id: item._id.toString(),
      type: 'announcement',
      title: item.title,
      description: item.description,
      fullDetails: item.fullDetails,
      category: item.category,
      date: item.date,
      requirementsList: Array.isArray(item.requirements) ? item.requirements : [],
      content: [
        item.title,
        item.description,
        item.content,
        item.fullDetails,
        item.category,
        ...(Array.isArray(item.requirements) ? item.requirements : []),
      ]
        .filter(Boolean)
        .join('\n'),
      metadata: {
        date: item.date || null,
        category: item.category || null,
        date_posted: item.date_posted || null,
      },
    }));
  }

  const textSearch = buildTextSearchQuery(question);

  // Try MongoDB text search first
  if (textSearch) {
    const results = await Announcement.find(
      { $text: { $search: textSearch } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, date_posted: -1 })
      .select('title content description fullDetails category date date_posted requirements')
      .lean();

    if (results.length > 0) {
      return results.map((item) => ({
        id: item._id.toString(),
        type: 'announcement',
        title: item.title,
        description: item.description,
        fullDetails: item.fullDetails,
        category: item.category,
        date: item.date,
        requirementsList: Array.isArray(item.requirements) ? item.requirements : [],
        content: [
          item.title,
          item.description,
          item.content,
          item.fullDetails,
          item.category,
          ...(Array.isArray(item.requirements) ? item.requirements : []),
        ]
          .filter(Boolean)
          .join('\n'),
        metadata: {
          date: item.date || null,
          category: item.category || null,
          date_posted: item.date_posted || null,
        },
      }));
    }
  }

  // Fallback: load all announcements so fuzzy scoring can work on typos
  return getAllAnnouncementSources();
};

const scoreChunk = (questionTokens, chunkText, source, mainTopic = null, intent = 'general', expandedTokens = null) => {
  const chunkTokens = tokenize(chunkText);
  const titleTokens = tokenize(source.title);
  // Use fuzzy-expanded token set when available, fall back to original
  const tokenSet = expandedTokens || new Set(questionTokens);
  const questionText = questionTokens.join(' ');

  let score = 0;

  // Exact token matches
  for (const token of tokenSet) {
    if (titleTokens.includes(token)) score += 15;
    if (chunkTokens.includes(token)) score += 5;
  }

  // Full phrase match in title
  if (source.title && questionText.includes(normalize(source.title))) {
    score += 25;
  }

  // Massive boost if title contains the main topic
  if (mainTopic && normalize(source.title).includes(mainTopic)) {
    score += 50;
  }

  // Weighted overlap scoring
  const titleOverlap = titleTokens.filter((token) => tokenSet.has(token)).length;
  const contentOverlap = chunkTokens.filter((token) => tokenSet.has(token)).length;

  score += titleOverlap * 8;
  score += contentOverlap * 3;

  // Intent-based scoring
  if (intent === 'procedure') {
    const hasProcedure = source.procedureText || 
                         /\b(steps|procedure|process|how to|fill out|submit|request|apply)\b/i.test(chunkText);
    if (hasProcedure) score += 20;
    
    const isOnlyRequirements = /\b(requirements|documents|need)\b/i.test(chunkText) && 
                               !/\b(step|procedure|submit|fill|request)\b/i.test(chunkText);
    if (isOnlyRequirements) score -= 10;
  }
  
  if (intent === 'requirements_only') {
    const hasRequirements = /\b(requirements|documents|need|submit|provide)\b/i.test(chunkText);
    if (hasRequirements) score += 15;
  }

  // Type-specific bonuses
  if (source.type === 'announcement' && /announcement|news|update|latest|recent|notice/.test(questionText)) {
    score += 10;
  }

  if (source.type === 'requirement' && /requirement|procedure|steps|documents|document|enrollment|registration/.test(questionText)) {
    score += 8;
  }

  return score;
};

export const retrieveChatbotContext = async (question, topK = 4) => {
  const questionTokens = tokenize(question);
  const mainTopic = extractMainTopic(question);
  const intent = extractIntent(question);
  const questionType = classifyQuestionType(question);
  const isSog = isSogQuestion(question);
  const isLatestAnnouncement = isLatestAnnouncementQuery(question);
  
  // Adjust topK based on query type
  if (isLatestAnnouncement) {
    topK = 5;
  }
  
  if (questionType === 'requirement') topK = 3;
  
  // Handle latest announcements specially
  if (isLatestAnnouncement) {
    const announcements = await searchAnnouncementSources(question, true);
    
    // Format announcements directly without scoring
    return announcements.map((source, index) => ({
      source,
      chunk: source.content,
      score: 100 - index, // High scores for latest announcements
    }));
  }
  
  const [requirements, announcements] = await Promise.all([
    questionType === 'announcement' ? [] : searchRequirementSources(question),
    questionType === 'requirement' ? [] : searchAnnouncementSources(question, false),
  ]);

  // Build vocabulary from all candidate source titles + content for fuzzy expansion
  const allSources = [...requirements, ...announcements];
  const vocabularyTokens = new Set(
    allSources.flatMap((source) => [
      ...tokenize(source.title),
      ...tokenize(source.content),
    ])
  );
  const expandedTokens = expandTokensWithFuzzy(questionTokens, vocabularyTokens);

  let candidates = [...requirements, ...announcements]
    .flatMap((source) =>
      chunkContent(source.content).map((chunk) => ({
        source,
        chunk,
        score: scoreChunk(questionTokens, chunk, source, mainTopic, intent, expandedTokens),
      }))
    )
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (isSog) {
    const sogCandidates = candidates.filter((item) => sourceMatchesSog(item.source));
    if (sogCandidates.length > 0) {
      candidates = sogCandidates;
    }
    topK = 1;
  }

  // Score gap filtering
  const ranked = [];
  const seen = new Set();
  let bestScore = 0;

  for (const item of candidates) {
    if (seen.has(item.source.id)) continue;
    
    if (bestScore === 0) bestScore = item.score;
    
    // Stop if score is less than 30% of best score
    if (bestScore > 0 && item.score < bestScore * 0.3) {
      break;
    }
    
    seen.add(item.source.id);
    ranked.push(item);
    if (ranked.length >= topK) break;
  }

  return ranked;
};

const formatRequirementAnswer = (source) => {
  const requirements = source.requirementsText
    ? summarizeText(source.requirementsText, 260)
    : summarizeText(source.content.split('\n').slice(1, 2).join(' '), 260);

  const procedure = source.procedureText
    ? summarizeText(source.procedureText, 260)
    : summarizeText(source.content.split('\n').slice(2).join(' '), 260);

  return [
    `📘 ${source.title}`,
    requirements ? `Requirements: ${requirements}` : '',
    procedure ? `Procedure: ${procedure}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const formatAnnouncementAnswer = (source) => {
  const parts = [
    `📢 ${source.title}`,
    source.date ? `Date: ${source.date}` : '',
    source.category ? `Category: ${source.category}` : '',
  ].filter(Boolean);

  const detailSource = source.fullDetails || source.description || source.content.replace(source.title, '');
  const detail = summarizeText(detailSource, 280);
  if (detail) parts.push(detail);

  if (source.requirementsList && source.requirementsList.length > 0) {
    parts.push(`Requirements: ${summarizeText(source.requirementsList.join(', '), 220)}`);
  }

  return parts.join('\n');
};

export const generateChatbotAnswer = (question, retrievedSources = []) => {
  if (!question?.trim()) return buildGenericResponse(question);

  if (isGreeting(question)) {
    return buildGenericResponse(question);
  }
  
  // Special handling for latest announcements query
  const isLatestAnnouncement = isLatestAnnouncementQuery(question);
  
  if (isLatestAnnouncement && retrievedSources.length > 0) {
    const announcementsList = retrievedSources
      .map((item, index) => {
        const source = item.source;
        // Safely parse date_posted which may be a string, Date, or number
        const parseDate = (val) => {
          if (!val) return null;
          if (typeof val === 'string') {
            const s = val.split('T')[0];
            return s || null;
          }
          if (val instanceof Date) return val.toISOString().split('T')[0];
          if (typeof val === 'number') return new Date(val).toISOString().split('T')[0];
          return null;
        };

        const dateFromMeta = parseDate(source.metadata?.date_posted);
        const date = source.date || dateFromMeta || 'Recent';
        const description = summarizeText(source.description || source.fullDetails || source.content, 120);
        return `${index + 1}. **${source.title}**\n   📅 ${date}\n   ${description}`;
      })
      .join('\n\n');
    
    return `📢 **Latest Announcements**\n\n${announcementsList}\n\nFor more details, ask about a specific announcement by name.`;
  }

  if (!retrievedSources.length) {
    return buildGenericResponse(question);
  }
  // Dynamic threshold: allow lower threshold for explicit announcement queries
  const questionType = classifyQuestionType(question);
  const dynamicThreshold = questionType === 'announcement' ? Math.min(RELEVANCE_SCORE_THRESHOLD, 6) : RELEVANCE_SCORE_THRESHOLD;

  // Check relevance score threshold using dynamic threshold
  const bestScore = retrievedSources[0]?.score || 0;
  if (bestScore < dynamicThreshold) {
    return 'I couldn\'t find information relevant to your question. Please try asking about a specific document, requirement, or announcement. For example: "What are the enrollment requirements?" or "Latest announcements?"';
  }

  // Filter out low-relevance sources: keep only sources scoring at least 50% of best score
  const minRelevantScore = Math.max(bestScore * 0.5, dynamicThreshold);
  const relevantSources = retrievedSources.filter((item) => item.score >= minRelevantScore);

  const isSog = isSogQuestion(question);
  if (relevantSources.length === 0) return buildGenericResponse(question);
  const source = relevantSources[0].source;

  if (isSog) {
    const answer = source.type === 'requirement'
      ? formatRequirementAnswer(source)
      : formatAnnouncementAnswer(source);

    return `📝 Summary of Grades (SOG) request information:\n\n${answer}`;
  }

  const sourceLines = relevantSources
    .map((item) =>
      item.source.type === 'requirement'
        ? formatRequirementAnswer(item.source)
        : formatAnnouncementAnswer(item.source)
    )
    .join('\n\n');

  return `Based on the latest eGuide records, here's what I found:\n\n${sourceLines}\n\nIf you want, I can also narrow this down to a specific document or announcement.`;
};

// Function to ensure MongoDB text indexes exist (call this on app startup)
export const ensureTextIndexes = async () => {
  try {
    await Requirement.collection.createIndex(
      { title: 'text', requirements: 'text', procedure: 'text' },
      { default_language: 'none' }
    );
    console.log('✅ Text index created on Requirement collection');
    
    await Announcement.collection.createIndex(
      { title: 'text', content: 'text', description: 'text', fullDetails: 'text' },
      { default_language: 'none' }
    );
    console.log('✅ Text index created on Announcement collection');
  } catch (error) {
    console.error('❌ Error creating text indexes:', error);
  }
};