export const searchQuestions = (questions, searchTerm, limit = 10) => {
  if (!searchTerm.trim()) return [];
  
  const term = searchTerm.toLowerCase();
  
  return questions
    .filter(q => {
      // Search in title
      const titleMatch = q.title && q.title.toLowerCase().includes(term);
      
      // Search in author
      const authorMatch = q.author && q.author.toLowerCase().includes(term);
      
      // Search in tags
      const tagMatch = q.tags && Array.isArray(q.tags) && 
        q.tags.some(tag => tag.toLowerCase().includes(term));
      
      // Search in answer text (if exists)
      let answerMatch = false;
      if (q.answer && typeof q.answer === 'string') {
        answerMatch = q.answer.toLowerCase().includes(term);
      } else if (Array.isArray(q.answers)) {
        answerMatch = q.answers.some(ans => 
          ans.text && ans.text.toLowerCase().includes(term)
        );
      }
      
      return titleMatch || authorMatch || tagMatch || answerMatch;
    })
    .slice(0, limit);
};
// Additional utility functions for search
export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const getSearchSuggestions = (questions, searchTerm) => {
  // Get unique words from all question titles and answers
  const allWords = new Set();
  
  questions.forEach(q => {
    // Add words from title
    if (q.title) {
      q.title.split(' ').forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        if (cleanWord.length > 2) allWords.add(cleanWord);
      });
    }
    
    // Add words from answers
    if (q.answer) {
      const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
      answers.forEach(answer => {
        const text = typeof answer === 'string' ? answer : answer.text || '';
        text.split(' ').forEach(word => {
          const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
          if (cleanWord.length > 2) allWords.add(cleanWord);
        });
      });
    }
  });
  
  // Filter words that start with search term
  return Array.from(allWords)
    .filter(word => word.startsWith(searchTerm.toLowerCase()))
    .slice(0, 5);
};