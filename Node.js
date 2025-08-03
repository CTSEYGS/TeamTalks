const { OpenAI } = require('openai');
const { PineconeClient } = require('@pinecone-database/pinecone');
const fs = require('fs');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pinecone = new PineconeClient();
await pinecone.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT, // e.g., 'us-west1-gcp'
});
const index = pinecone.Index('teamtalks-questions'); // Your Pinecone index name

async function embedText(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

// Example: Embed all questions and answers
async function embedQuestions() {
  const questions = JSON.parse(fs.readFileSync('src/data/questions.json'));
  const vectors = [];
  for (const q of questions) {
    const questionVec = await embedText(q.title);
    const answerVec = await embedText(q.answer || "");
    // Store both question and answer vectors as separate entries, or combine as needed
    vectors.push({
      id: `q_${q.id}`,
      values: questionVec,
      metadata: { type: 'question', title: q.title, ...q }
    });
    vectors.push({
      id: `a_${q.id}`,
      values: answerVec,
      metadata: { type: 'answer', answer: q.answer, ...q }
    });
  }
  // Upsert all vectors to Pinecone
  await index.upsert({ vectors });
  console.log('Vectors upserted to Pinecone');
}

embedQuestions();