const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// GET API to return all JSON files from src/data
router.get('/knowledgedata', (req, res) => {
  console.log('API request received for knowledge data');
  const dataDir = path.join(__dirname, '../../data');
  
  fs.readdir(dataDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read data folder' });

    const jsonFiles = files.filter(f => f.endsWith('.json'));
    let allQuestions = [];

    jsonFiles.forEach(file => {
      const filePath = path.join(dataDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        // If the file is an array, concat; if it's an object with a questions array, use that
        if (Array.isArray(data)) {
          allQuestions = allQuestions.concat(data);
        } else if (Array.isArray(data.questions)) {
          allQuestions = allQuestions.concat(data.questions);
        }
      } catch (e) {
        console.error(`Error parsing ${file}:`, e);
      }
    });

    res.json(allQuestions);
  });
});

// Add this to src/server/routes/knowledgeRoutes.js

// GET API to return top contributors with their upvotes
router.get('/contributors/top', (req, res) => {
  console.log('API request received for top contributors');
  const dataDir = path.join(__dirname, '../../data');
  
  fs.readdir(dataDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read data folder' });

    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const contributorStats = {};

    let processedFiles = 0;
    
    if (jsonFiles.length === 0) {
      return res.json([]);
    }

    jsonFiles.forEach(file => {
      const filePath = path.join(dataDir, file);
      fs.readFile(filePath, 'utf8', (readErr, content) => {
        processedFiles++;
        
        if (!readErr && content) {
          try {
            const data = JSON.parse(content);
            const questions = Array.isArray(data) ? data : [data];
            
            questions.forEach(question => {
              if (Array.isArray(question.answers)) {
                question.answers.forEach(answer => {
                  const user = answer.user || 'Anonymous';
                  const upvotes = answer.upvotes || 0;
                  
                  if (!contributorStats[user]) {
                    contributorStats[user] = {
                      name: user,
                      totalUpvotes: 0,
                      answerCount: 0,
                      questions: []
                    };
                  }
                  
                  contributorStats[user].totalUpvotes += upvotes;
                  contributorStats[user].answerCount += 1;
                  
                  // Track which questions they answered
                  if (!contributorStats[user].questions.includes(question.id)) {
                    contributorStats[user].questions.push(question.id);
                  }
                });
              }
            });
          } catch (e) {
            console.error(`Error parsing ${file}:`, e);
          }
        }
        
        // When all files are processed, return results
        if (processedFiles === jsonFiles.length) {
          // Convert to array and sort by total upvotes
          const topContributors = Object.values(contributorStats)
            .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
            .slice(0, 10) // Top 10 contributors
            .map(contributor => ({
              name: contributor.name,
              totalUpvotes: contributor.totalUpvotes,
              answerCount: contributor.answerCount,
              questionsAnswered: contributor.questions.length
            }));
          
          res.json(topContributors);
        }
      });
    });
  });
});
module.exports = router;