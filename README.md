# LLM Comparator

This is a very simple personal user LLM comparator that helps in passing same prompts to multiple LLMs and then viewing their output in UI and then take a call which one is better.

Supported LLMs:

1. ChatGPT
2. Gemini
3. Claude
4. Llama

## How to run

### 1. Setup Postgres:

1. Install docker
2. Start potgres container using below command from _infra_ directory:
   ```
   docker compose up --build -d
   ```
   - On first this command will automatically create schemas
   - Postgres data will be stored in _pg_data_ folder so data will not be lost even if container stops.

### 2. Start Backend

- Get key for ChatGPT, Gemini and Claude and set them in the environment
- Run llama locally (ollama can be used to run llama locally)
- `npm install`
- `npm run execute`

### 3. Start Frontend

- `npm install`
- `npm start`

<img width="1512" alt="image" src="https://github.com/user-attachments/assets/3645808e-400a-47d3-8dad-417de0d6f2db">
