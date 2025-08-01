# TeamTalks Project

TeamTalks is a React application with a Node.js/Express backend that serves knowledge questions via an API and displays them in a searchable UI. Users can search for existing questions and add new questions through a user-friendly interface.

## Project Structure

```
TeamTalks
├── src
│   ├── components
│   │   ├── Home.jsx
│   │   ├── Question.jsx
│   │   ├── AddQuestion.jsx
│   │   ├── Navbar.jsx
│   │   ├── Home.css
│   │   ├── Navbar.css
│   │   └── AddQuestion.css
│   ├── data
│   │   ├── questions.json
│   │   └── question_2.json
│   ├── assets
│   │   └── book.png
│   ├── App.jsx
│   └── index.js
├── build/                    # Production build files
├── server.js
├── package.json
└── README.md
```

## Features

- 🔍 **Search Questions**: Search through existing knowledge base questions
- ➕ **Add Questions**: Create new questions and answers through a form interface
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Auto-redirect**: Automatically redirects to home page after adding questions
- 🚀 **Live Development**: Hot reloading during development

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd TeamTalks
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Development Mode
For the best development experience with hot reloading:

1. Start the Express server (Terminal 1):
   ```
   node server.js
   ```
   Server runs on [http://localhost:3001](http://localhost:3001)

2. Start the React development server (Terminal 2):
   ```
   npm start
   ```
   React app runs on [http://localhost:3000](http://localhost:3000)

The React dev server is configured to proxy API requests to the Express server.

### Production Mode
1. Build the React app:
   ```
   npm run build
   ```
2. Start the Node.js server:
   ```
   node server.js
   ```
   The server runs on [http://localhost:3001](http://localhost:3001) and serves both the API and the React app.

## API Endpoints

### GET /api/knowledgedata
Returns all questions and answers from the `src/data` folder as a single JSON array.

**Response:**
```json
[
  {
    "id": 1,
    "title": "What is Canvas?",
    "answer": "Canvas is a web application that allows EY auditors to manage and document their audit work in a structured and efficient manner."
  },
  ...
]
```

### POST /api/questions
Adds a new question to the knowledge base. The question is saved to `question_2.json`.

**Request Body:**
```json
{
  "title": "Your question here",
  "answer": "Your answer here"
}
```

**Response:**
```json
{
  "id": 12,
  "title": "Your question here",
  "answer": "Your answer here"
}
```

**Features:**
- Auto-generates unique IDs for new questions
- Validates that both title and answer are provided
- Returns the created question with its assigned ID

## Usage

1. **Searching Questions**: Use the search bar on the home page to find existing questions
2. **Adding Questions**: Click "Add Question" in the navigation bar to create new questions
3. **Viewing Questions**: Click on any search result to view the full question and answer

## Development

The application uses:
- **React 18** for the frontend
- **Express.js** for the backend API
- **React Router** for navigation
- **File-based storage** for questions (JSON files)

## License

This project is licensed under the MIT License.