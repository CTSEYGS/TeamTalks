const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');

console.log('🚀 Starting to update all questions with tags...');

fs.readdir(dataDir, (err, files) => {
  if (err) {
    console.error('❌ Error reading data directory:', err);
    return;
  }

  // Filter for question files
  const questionFiles = files.filter(f => f.match(/^question_\d+\.json$/));
  
  console.log(`📋 Found ${questionFiles.length} question files to update:`);
  questionFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');

  let processedFiles = 0;

  questionFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    
    fs.readFile(filePath, 'utf8', (readErr, data) => {
      if (readErr) {
        console.error(`❌ Error reading ${file}:`, readErr);
        processedFiles++;
        return;
      }

      try {
        const questions = JSON.parse(data);
        let updated = false;

        const updatedQuestions = questions.map(question => {
          if (!question.tags || !Array.isArray(question.tags)) {
            question.tags = ['initial'];
            updated = true;
          }
          return question;
        });

        if (updated) {
          fs.writeFile(filePath, JSON.stringify(updatedQuestions, null, 2), (writeErr) => {
            processedFiles++;
            
            if (writeErr) {
              console.error(`❌ Error updating ${file}:`, writeErr);
            } else {
              console.log(`✅ Updated ${file} with tags: ["initial"]`);
            }

            // Check if all files processed
            if (processedFiles === questionFiles.length) {
              console.log('\n🎉 All question files updated successfully!');
              console.log('📊 All questions now have tags attribute with default value: ["initial"]');
            }
          });
        } else {
          processedFiles++;
          console.log(`⚪ ${file} already has tags`);
          
          if (processedFiles === questionFiles.length) {
            console.log('\n🎉 All question files checked!');
          }
        }

      } catch (parseErr) {
        console.error(`❌ Error parsing ${file}:`, parseErr);
        processedFiles++;
      }
    });
  });

  if (questionFiles.length === 0) {
    console.log('❌ No question files found to update');
  }
});