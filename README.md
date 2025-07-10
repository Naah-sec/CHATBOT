# llama3 Local Chatbot Demo (Built by GitHub Copilot Agent)

This project is a full-stack, privacy-first chatbot system that runs entirely on your machine. It features a modern React frontend and a Django REST Framework backend, powered by a local llama3 LLM via Ollama. The chatbot remembers your conversation context and provides a beautiful, responsive chat experience.

> **You might say what would i do with it i could just use that local llm via Open-webUI interface or ...,yes! you can totally do that,this project was made for practicing chatbot integration with some memory,streaming.. and This project was fully built and iteratively improved by the GitHub Copilot agent as a real-world test of its coding and reasoning abilities. All requirements were met, and the system works as intended.**

---

## Features

- **Local LLM**: Uses llama3 via Ollama, so your data never leaves your device.
- **Memory**: The bot remembers previous messages in the current chat session for contextual, coherent conversations.
- **Modern UI**: Responsive, stylish React frontend with Material-UI.
- **Streaming**: Bot responses appear in real time, like ChatGPT.
- **API-first**: Django REST Framework backend with clean endpoints.
- **Easy to run**: Simple setup for both backend and frontend.
- **Dockerized**: Run everything with a single command using Docker Compose.

---

## Requirements

- Python 3.8+
- Node.js 14+
- Docker & Docker Compose (for containerized setup)
- Ollama (with llama3 model pulled, if running locally)

---

## Setup & Running

### Option 1: Run Everything with Docker Compose (Recommended)

1. **Build and start all services (backend, frontend, Ollama) in containers:**
   ```bash
   docker-compose up --build
   ```
   - Backend: http://localhost:8000
   - Frontend: http://localhost:5173
   - Ollama API: http://localhost:11434

2. **Stop all services:**
   ```bash
   docker-compose down
   ```

---

### Option 2: Manual Local Setup (No Docker)

#### 1. Backend (Django + DRF)
```bash
cd chatbot_demo
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py runserver
```

#### 2. Frontend (React)
```bash
cd ../frontend
npm install
npm run dev
```

#### 3. Ollama (llama3 LLM)
```bash
ollama pull llama3
ollama serve
```

---

## API Usage

### Create a New Chat
```bash
curl -X POST http://localhost:8000/api/chats/
```

### Send a Message (with memory)
```bash
curl -X POST http://localhost:8000/api/chats/1/send_message/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

### Stream a Message (Server-Sent Events)
```bash
curl -X POST http://localhost:8000/api/chats/1/stream_message/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about yourself"}'
```

---

## Project Architecture

- **Frontend**: React + Material-UI, Axios, streaming chat UI
- **Backend**: Django REST Framework, SQLite (default), chat memory logic
- **LLM**: llama3 via Ollama HTTP API
- **Models**: `Chat` (session), `Message` (user/assistant, with timestamps)

---

## Testing

To run backend tests:
```bash
python manage.py test chat
```

---

## About This Project

This project was created entirely by the GitHub Copilot agent, following a detailed requirements list and iterative improvements. It demonstrates:
- Full-stack development (React, Django, REST, LLM integration)
- Real-time streaming and chat memory
- Clean, modern UI/UX
- Automated code generation and reasoning

**Result:** The Copilot agent successfully delivered a working, production-quality local chatbot system with all requested features.
