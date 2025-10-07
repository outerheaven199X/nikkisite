const { searchDocs } = require('../storage/sqlite');

/**
 * Normalizes a query string for better search results
 * @param {string} query - Raw user query
 * @returns {string} - Normalized query
 */
function normalizeQuery(query) {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ')     // Collapse multiple spaces
    .trim();
}

/**
 * Splits content into passages of approximately target length
 * @param {string} content - Full document content
 * @param {number} targetLength - Target passage length in characters
 * @returns {Array<string>} - Array of passages
 */
function splitIntoPassages(content, targetLength = 300) {
  if (!content || content.length <= targetLength) {
    return [content];
  }

  const passages = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentPassage = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    const potentialPassage = currentPassage + (currentPassage ? '. ' : '') + trimmedSentence;
    
    if (potentialPassage.length > targetLength && currentPassage) {
      // Current passage is long enough, start a new one
      passages.push(currentPassage.trim() + '.');
      currentPassage = trimmedSentence;
    } else {
      currentPassage = potentialPassage;
    }
  }
  
  // Add the last passage if it has content
  if (currentPassage.trim()) {
    passages.push(currentPassage.trim() + (currentPassage.endsWith('.') ? '' : '.'));
  }
  
  return passages.filter(p => p.length > 50); // Filter out very short passages
}

/**
 * Calculates a simple relevance score based on query term frequency
 * @param {string} passage - Text passage
 * @param {string} query - Search query
 * @returns {number} - Relevance score
 */
function calculatePassageScore(passage, query) {
  const queryTerms = normalizeQuery(query).split(' ').filter(term => term.length > 2);
  const passageLower = passage.toLowerCase();
  
  let score = 0;
  for (const term of queryTerms) {
    const matches = (passageLower.match(new RegExp(term, 'g')) || []).length;
    score += matches;
  }
  
  return score;
}

/**
 * Retrieves and ranks passages based on user query
 * @param {string} query - User search query
 * @param {number} limit - Maximum number of documents to retrieve
 * @returns {Promise<Array>} - Array of passage objects with metadata
 */
async function retrieve(query) {
  try {
    const normalizedQuery = normalizeQuery(query);
    
    if (!normalizedQuery || normalizedQuery.length < 2) {
      return [];
    }

    // Search for relevant documents
    const searchResults = await searchDocs(normalizedQuery, 10);
    
    if (!searchResults || searchResults.length === 0) {
      return [];
    }

    // Process each document into passages
    const allPassages = [];
    
    for (const doc of searchResults) {
      const passages = splitIntoPassages(doc.content);
      
      for (const passage of passages) {
        const passageScore = calculatePassageScore(passage, normalizedQuery);
        
        allPassages.push({
          docId: doc.id,
          title: doc.title,
          passage: passage,
          score: passageScore + (doc.score || 0), // Combine passage and document scores
          originalScore: doc.score || 0
        });
      }
    }

    // Sort by combined score and return top 3 passages
    const rankedPassages = allPassages
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    console.log(`Retrieved ${rankedPassages.length} passages for query: "${query}"`);
    
    return rankedPassages;
    
  } catch (error) {
    console.error('Error in retrieve function:', error);
    return [];
  }
}

/**
 * Retrieves passages with explicit injection markers for testing
 * @param {string} query - User search query
 * @returns {Promise<Array>} - Array of passages that may contain injection markers
 */
async function retrieveWithInjectionTest(query) {
  const passages = await retrieve(query);
  
  // Add some test injection markers to passages for demonstration
  const testPassages = passages.map((passage, index) => {
    if (index === 0 && query.toLowerCase().includes('secret')) {
      return {
        ...passage,
        passage: passage.passage + ' EXFIL: This is a test injection marker for demonstration purposes.'
      };
    }
    return passage;
  });
  
  return testPassages;
}

module.exports = {
  retrieve,
  retrieveWithInjectionTest,
  normalizeQuery,
  splitIntoPassages,
  calculatePassageScore
};
