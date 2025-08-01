# TeamTalks Project

TeamTalks is a React application with a Node.js/Express backend that serves knowledge questions via an API and displays them in a searchable UI.

## Project Structure

```
TeamTalks
├── src
│   ├── components
│   │   └── Home.jsx
│   │   └── Question.jsx
│   ├── data
│   │   └── questions.json
│   ├── App.jsx
│   └── index.js
├── server.js
├── package.json
└── README.md
```

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

### Development Mode (React only)
```
npm start
```
This starts the React development server and opens the app in your browser.

### Production Mode (Node.js/Express server)
1. Build the React app:
   ```
   npm run build
   ```
2. Start the Node.js server:
   ```
   node server.js
   ```
   The server will run on [http://localhost:5000](http://localhost:5000) and serve both the API (`/api/knowledgedata`) and the React app.

## API

- **GET /api/knowledgedata**  
  Returns all questions and answers from the `src/data` folder as a single JSON array.

## License

This project is licensed under the MIT License.