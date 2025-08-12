const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// POST API to add a new question
router.post('/questionsv1', (req, res) => {
  console.log('API request received to add new question');
  const { title, answer, author } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const dataDir = path.join(__dirname, '../../data');
  
  // Find the next available question file number
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('Error reading data directory:', err);
      return res.status(500).json({ error: 'Failed to access data directory' });
    }

    // Find all existing question_X.json files and get the highest number
    const questionFiles = files
      .filter(f => f.match(/^question_\d+\.json$/))
      .map(f => parseInt(f.match(/question_(\d+)\.json/)[1]))
      .sort((a, b) => b - a);

    const nextFileNumber = questionFiles.length > 0 ? questionFiles[0] + 1 : 1001;
    const newFileName = `question_${nextFileNumber}.json`;
    const newFilePath = path.join(dataDir, newFileName);

    // Get the highest existing ID from all question files
    let maxId = 0;
    const allFiles = files.filter(f => f.endsWith('.json'));
    let processedFiles = 0;

    if (allFiles.length === 0) {
      maxId = 0;
      createNewQuestionFile();
    } else {
      allFiles.forEach(file => {
        const filePath = path.join(dataDir, file);
        fs.readFile(filePath, 'utf8', (readErr, data) => {
          processedFiles++;
          
          if (!readErr && data) {
            try {
              const fileData = JSON.parse(data);
              const questions = Array.isArray(fileData) ? fileData : (fileData.questions || []);
              questions.forEach(q => {
                if (q.id && q.id > maxId) {
                  maxId = q.id;
                }
              });
            } catch (parseErr) {
              console.error(`Error parsing ${file}:`, parseErr);
            }
          }

          if (processedFiles === allFiles.length) {
            createNewQuestionFile();
          }
        });
      });
    }

    function createNewQuestionFile() {
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const newQuestion = {
        id: maxId + 1,
        title: title.trim(),
        createdDate: currentDate,
        author: author && author.trim() ? author.trim() : 'Anonymous',
        answers: answer && answer.trim() ? 
          [{
            answerid: 100001,
            text: answer.trim(),
            user: author && author.trim() ? author.trim() : 'Anonymous',
            date: currentDate,
            upvotes: 0
          }] : 
          "No answer provided yet. Feel free to contribute an answer!"
      };

      const newFileContent = [newQuestion];

      fs.writeFile(newFilePath, JSON.stringify(newFileContent, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error creating new question file:', writeErr);
          return res.status(500).json({ error: 'Failed to save question' });
        }
        
        console.log(`New question saved to ${newFileName} with ID ${newQuestion.id}`);
        res.status(201).json({
          ...newQuestion,
          file: newFileName
        });
      });
    }
  });
});

// POST API to add a new question
router.post('/questions', (req, res) => {
  console.log('API request received to add new question');
  const { title, answer, author } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const dataDir = path.join(__dirname, '../../data');
  
  // Find the next available question file number
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('Error reading data directory:', err);
      return res.status(500).json({ error: 'Failed to access data directory' });
    }

    // Find all existing question_X.json files and get the highest number
    const questionFiles = files
      .filter(f => f.match(/^question_\d+\.json$/))
      .map(f => parseInt(f.match(/question_(\d+)\.json/)[1]))
      .sort((a, b) => b - a);

    const nextFileNumber = questionFiles.length > 0 ? questionFiles[0] + 1 : 1001;
    const newFileName = `question_${nextFileNumber}.json`;
    const newFilePath = path.join(dataDir, newFileName);

    // Create proper DateTime format
    const currentDateTime = new Date();
    const createdDate = currentDateTime.toISOString(); // Full ISO format: 2025-08-11T14:30:00.000Z
    
    // Also create display format for UI
    const displayDate = currentDateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const newQuestion = {
      id: nextFileNumber,
      title: title.trim(),
      createdDate: createdDate,        // Full DateTime for sorting
      createdDateDisplay: displayDate, // Human readable format
      upvotes: 0,
      author: author && author.trim() ? author.trim() : 'Anonymous',
      answers: answer && answer.trim() ? 
        [{
          answerid: 100001,
          text: answer.trim(),
          user: author && author.trim() ? author.trim() : 'Anonymous',
          date: displayDate,
          upvotes: 0
        }] : 
        []
    };

    const newFileContent = [newQuestion];

    fs.writeFile(newFilePath, JSON.stringify(newFileContent, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error creating new question file:', writeErr);
        return res.status(500).json({ error: 'Failed to save question' });
      }
      
      console.log(`New question saved to ${newFileName} with ID ${newQuestion.id} at ${createdDate}`);
      res.status(201).json({
        ...newQuestion,
        file: newFileName
      });
    });
  });
});

// PUT API to update an existing question with a new answer
router.put('/questions/:id', (req, res) => {
  console.log(`API request received to update question ${req.params.id}`);
  const questionId = parseInt(req.params.id);
  const { answer, user, date } = req.body;
  
  if (!answer || answer.trim() === '') {
    return res.status(400).json({ error: 'Answer is required' });
  }

  const dataDir = path.join(__dirname, '../../data');
  
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('Error reading data directory:', err);
      return res.status(500).json({ error: 'Failed to access data directory' });
    }

    const jsonFiles = files.filter(f => f.endsWith('.json'));
    let questionFound = false;
    let processedFiles = 0;

    jsonFiles.forEach(file => {
      const filePath = path.join(dataDir, file);
      
      fs.readFile(filePath, 'utf8', (readErr, data) => {
        processedFiles++;
        
        if (!readErr && data && !questionFound) {
          try {
            const fileData = JSON.parse(data);
            const questions = Array.isArray(fileData) ? fileData : [fileData];
            
            const questionIndex = questions.findIndex(q => q.id === questionId);
            
            if (questionIndex !== -1) {
              questionFound = true;
              const question = questions[questionIndex];
              
              const newAnswer = {
                answerid: Date.now(),
                text: answer.trim(),
                user: user || 'Anonymous User',
                date: date || new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }),
                upvotes: 0
              };
              
              if (typeof question.answers === 'string' && 
                  question.answers === "No answer provided yet. Feel free to contribute an answer!") {
                question.answers = [newAnswer];
              } else if (Array.isArray(question.answers)) {
                question.answers.push(newAnswer);
              } else {
                const existingAnswer = {
                  answerid: 1,
                  text: question.answer,
                  user: 'Original Author',
                  date: question.createdDate || 'Unknown',
                  upvotes: 0
                };
                question.answers = [existingAnswer, newAnswer];
              }
              
              fs.writeFile(filePath, JSON.stringify(questions, null, 2), (writeErr) => {
                if (writeErr) {
                  console.error('Error updating question file:', writeErr);
                  return res.status(500).json({ error: 'Failed to update question' });
                }
                
                console.log(`Question ${questionId} updated in ${file}`);
                res.json({
                  message: 'Question updated successfully',
                  questionId,
                  newAnswer
                });
              });
            }
          } catch (parseErr) {
            console.error(`Error parsing ${file}:`, parseErr);
          }
        }
        
        if (processedFiles === jsonFiles.length && !questionFound) {
          res.status(404).json({ error: 'Question not found' });
        }
      });
    });
  });
});

// Add this to your existing questionRoutes.js file
// Add this to your existing questionRoutes.js file

// PATCH API to update answer upvotes
router.patch('/questions/:id/answers/:answerId/upvote', (req, res) => {
  console.log(`API request received to upvote answer ${req.params.answerId} in question ${req.params.id}`);
  const questionId = parseInt(req.params.id);
  const answerId = parseInt(req.params.answerId);
  
  if (!questionId || !answerId) {
    return res.status(400).json({ error: 'Question ID and Answer ID are required' });
  }

  const dataDir = path.join(__dirname, '../../data');
  const questionFileName = `question_${questionId}.json`;
  const questionFilePath = path.join(dataDir, questionFileName);
  
  // Check if the specific question file exists
  fs.readFile(questionFilePath, 'utf8', (readErr, data) => {
    if (readErr) {
      console.error(`Error reading question file ${questionFileName}:`, readErr);
      return res.status(404).json({ error: 'Question not found' });
    }

    try {
      const questions = JSON.parse(data);
      const questionArray = Array.isArray(questions) ? questions : [questions];
      
      // Find the question (should be the first/only one in the file)
      const question = questionArray.find(q => q.id === questionId);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found in file' });
      }

      // Check if question has answers array
      if (!Array.isArray(question.answers)) {
        return res.status(400).json({ error: 'Question has no answers to upvote' });
      }

      // Find the specific answer by answerId
      const answerIndex = question.answers.findIndex(a => a.answerid === answerId);
      
      if (answerIndex === -1) {
        return res.status(404).json({ error: 'Answer not found' });
      }

      // Increment upvotes
      question.answers[answerIndex].upvotes = (question.answers[answerIndex].upvotes || 0) + 1;

      // Save the updated file
      fs.writeFile(questionFilePath, JSON.stringify(questionArray, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error updating question file:', writeErr);
          return res.status(500).json({ error: 'Failed to update upvotes' });
        }
        
        console.log(`Answer ${answerId} in question ${questionId} upvoted. New count: ${question.answers[answerIndex].upvotes}`);
        res.json({
          message: 'Answer upvoted successfully',
          questionId,
          answerId,
          newUpvoteCount: question.answers[answerIndex].upvotes,
          answer: question.answers[answerIndex]
        });
      });

    } catch (parseErr) {
      console.error(`Error parsing question file ${questionFileName}:`, parseErr);
      return res.status(500).json({ error: 'Failed to parse question file' });
    }
  });
});

// PATCH API for general question/answer updates (extensible)
router.patch('/questions/:id', (req, res) => {
  console.log(`API request received to patch question ${req.params.id}`);
  const questionId = parseInt(req.params.id);
  const { operation, answerId, field, value } = req.body;
  
  if (!questionId || !operation) {
    return res.status(400).json({ error: 'Question ID and operation are required' });
  }

  const dataDir = path.join(__dirname, '../../data');
  const questionFileName = `question_${questionId}.json`;
  const questionFilePath = path.join(dataDir, questionFileName);
  
  // Check if the specific question file exists
  fs.readFile(questionFilePath, 'utf8', (readErr, data) => {
    if (readErr) {
      console.error(`Error reading question file ${questionFileName}:`, readErr);
      return res.status(404).json({ error: 'Question not found' });
    }

    try {
      const questions = JSON.parse(data);
      const questionArray = Array.isArray(questions) ? questions : [questions];
      
      // Find the question (should be the first/only one in the file)
      const question = questionArray.find(q => q.id === questionId);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found in file' });
      }

      let updateResult = {};
      
      switch (operation) {
        case 'upvote_answer':
          if (!answerId) {
            return res.status(400).json({ error: 'Answer ID required for upvote operation' });
          }
          if (!Array.isArray(question.answers)) {
            return res.status(400).json({ error: 'Question has no answers to upvote' });
          }
          
          const upvoteAnswerIndex = question.answers.findIndex(a => a.answerid === answerId);
          if (upvoteAnswerIndex === -1) {
            return res.status(404).json({ error: 'Answer not found' });
          }
          question.answers[upvoteAnswerIndex].upvotes = (question.answers[upvoteAnswerIndex].upvotes || 0) + 1;
          updateResult = {
            answerId,
            newUpvoteCount: question.answers[upvoteAnswerIndex].upvotes
          };
          break;
          
        case 'downvote_answer':
          if (!answerId) {
            return res.status(400).json({ error: 'Answer ID required for downvote operation' });
          }
          if (!Array.isArray(question.answers)) {
            return res.status(400).json({ error: 'Question has no answers to downvote' });
          }

          const downvoteAnswerIndex = question.answers.findIndex(a => a.answerid === answerId);
          if (downvoteAnswerIndex === -1) {
            return res.status(404).json({ error: 'Answer not found' });
          }

          question.answers[downvoteAnswerIndex].upvotes = Math.max(0, (question.answers[downvoteAnswerIndex].upvotes || 0) - 1);
          updateResult = {
            answerId,
            newUpvoteCount: question.answers[downvoteAnswerIndex].upvotes
          };
          break;
          
        case 'update_field':
          if (!field || value === undefined) {
            return res.status(400).json({ error: 'Field and value required for update operation' });
          }
          
          if (answerId) {
            // Update answer field
            if (!Array.isArray(question.answers)) {
              return res.status(400).json({ error: 'Question has no answers to update' });
            }
            
            const updateAnswerIndex = question.answers.findIndex(a => a.answerid === answerId);
            if (updateAnswerIndex === -1) {
              return res.status(404).json({ error: 'Answer not found' });
            }

            question.answers[updateAnswerIndex][field] = value;
            updateResult = { answerId, field, newValue: value };
          } else {
            // Update question field
            question[field] = value;
            updateResult = { field, newValue: value };
          }
          break;
          
        default:
          return res.status(400).json({ error: 'Invalid operation' });
      }
      
      // Save the updated file
      fs.writeFile(questionFilePath, JSON.stringify(questionArray, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error updating question file:', writeErr);
          return res.status(500).json({ error: 'Failed to update question' });
        }
        
        console.log(`Question ${questionId} updated with operation: ${operation}`);
        res.json({
          message: `Question updated successfully`,
          questionId,
          operation,
          ...updateResult
        });
      });

    } catch (parseErr) {
      console.error(`Error parsing question file ${questionFileName}:`, parseErr);
      return res.status(500).json({ error: 'Failed to parse question file' });
    }
  });
});

module.exports = router;