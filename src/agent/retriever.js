import knowledgeBaseData from '../../data/raw_twitter_support_sample.json' with { type: 'json' };

const knowledgeBase = knowledgeBaseData || [];

// Tokenize text into normalized word n-grams
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

// BM25 / TF-IDF Hybrid Search Retriever
export function retrieveContext(queryText, intent = null, topK = 3) {
  if (!knowledgeBase || knowledgeBase.length === 0) {
    return [];
  }

  const queryTokens = tokenize(queryText);
  if (queryTokens.length === 0) {
    return knowledgeBase.slice(0, topK);
  }

  const scoredDocs = knowledgeBase.map(doc => {
    const docText = `${doc.customer_query} ${doc.brand_reply} ${doc.resolution_steps} ${doc.tags ? doc.tags.join(' ') : ''}`;
    const docTokens = tokenize(docText);
    
    // 1. Keyword Overlap (BM25 token match approximation)
    let tfidfScore = 0;
    queryTokens.forEach(qToken => {
      const occurrences = docTokens.filter(t => t === qToken).length;
      if (occurrences > 0) {
        tfidfScore += (1 + Math.log(occurrences)) * (qToken.length > 5 ? 1.5 : 1.0);
      }
    });

    // 2. Intent Alignment Boost
    let intentBonus = 0;
    if (intent && doc.intent === intent) {
      intentBonus = 2.0;
    }

    const finalScore = tfidfScore + intentBonus;
    return { doc, score: +finalScore.toFixed(3) };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.slice(0, topK).map(item => item.doc);
}
