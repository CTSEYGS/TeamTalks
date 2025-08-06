// Enhanced search function that searches through entire question data
export const searchQuestions = (questions, searchTerm, limit = 5) => {
  if (!searchTerm || !questions) return [];
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return questions
    .filter(q => {
      // Search in question title
      if (q.title && q.title.toLowerCase().includes(lowerSearchTerm)) {
        return true;
      }
      
      // Search in answers
      if (q.answer) {
        // Handle both array and single answer formats
        const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
        
        return answers.some(answer => {
          // Search in answer text
          const answerText = typeof answer === 'string' ? answer : answer.text || '';
          if (answerText.toLowerCase().includes(lowerSearchTerm)) {
            return true;
          }
          
          // Search in answer user/author
          if (answer.user && answer.user.toLowerCase().includes(lowerSearchTerm)) {
            return true;
          }
          
          // Search in answer date (optional)
          if (answer.date && answer.date.toLowerCase().includes(lowerSearchTerm)) {
            return true;
          }
          
          return false;
        });
      }
      
      return false;
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