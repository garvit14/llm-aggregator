# LLM Comparator

This is a very simple personal use LLM aggregator that helps in passing same prompts to multiple LLMs and then viewing their output in UI and then take a call which one is better.

Supported LLMs:

1. ChatGPT
2. Gemini
3. Claude
4. Llama

# How to run

## 1. Setup Postgres:

1. Install docker
2. Start potgres container using below command from _infra_ directory:
   ```
   docker compose up --build -d
   ```
   - On first run this command will automatically create schemas
   - Postgres data will be stored in _pg_data_ folder so data will not be lost even if container stops.

## 2. Start Backend

1. Use node 21
2. Get key for ChatGPT, Gemini and Claude and set them in the environment. (.env file in repository root can also be used)

   ```
   GEMINI_API_KEY=<your_key>
   CHATGPT_API_KEY=<your_key>
   CLAUDE_API_KEY=<your_key>
   ```

3. Run llama locally (ollama can be used to run llama locally)
4. `npm install`
5. `npm run execute`

## 3. Start Frontend

### For Development:

1. `npm install`
2. `npm start`

### For Usage:

1. `npm i -g server` - needs to be done only first time
2. `npm run build`
3. `serve -s build`

## Demo

https://github.com/user-attachments/assets/58b638c3-4009-41ff-a70a-a4ba91afdb23
