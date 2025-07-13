FROM ollama/ollama:0.7.0

ENV API_BASE_URL=http://127.0.0.1:11434/api
ENV MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b

RUN apt-get update && apt-get install -y \
  curl \
  bash \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && npm install -g pnpm \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY .env.docker package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN pnpm run build

# Override the default entrypoint
ENTRYPOINT ["/bin/sh", "-c"]

# Start Ollama service and pull the model, then run the app
CMD ["ollama serve & sleep 5 && ollama pull ${MODEL_NAME_AT_ENDPOINT} && pnpm run dev"]