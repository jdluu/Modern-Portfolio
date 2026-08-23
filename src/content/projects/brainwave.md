---
title: "BrainWave"
slug: "brainwave"
date: "2024-02"

summary: "A note-taking app that answers questions about your notes using local semantic search and an AI chat interface."
role: "Developer"
technologies:
  [
    "Next.js",
    "TypeScript",
    "TailwindCSS",
    "shadcn/ui",
    "Prisma",
    "SQLite (Turso/libSQL)",
    "HuggingFace Transformers",
    "Groq (GPT OSS-20B)",
    "Vercel AI SDK",
  ]
tools: ["GitHub", "Clerk v6", "Radix UI"]

cover: "../../assets/images/projects/brainwave/cover_brainwave.min.png"
final: "../../assets/images/projects/brainwave/final_brainwave.png"

background: "I kept losing things in my own notes. Keyword search only works if you remember the exact word you wrote, and six months later you never do. I wanted to see if I could just ask my notes a question and get an answer back."
solution: "Notes are embedded locally via HuggingFace Transformers (bge-small-en-v1.5, 384-dim) at save time and stored in SQLite with cosine similarity queries — no external embedding API needed. Queries match by meaning, not exact characters. The chat model runs on Groq's free tier (gpt-oss-20b), streamed through the Vercel AI SDK. Clerk handles authentication so notes stay private to their owner. Everything runs on SQLite via Prisma + Turso/libSQL."
process: "I built plain note CRUD first, then spent most of the project on the retrieval side: getting embeddings generated reliably on note create/update, and wiring the chat assistant to pull from the index before answering. The tricky parts were keeping the embedding pipeline in sync with the database and making retrieval failures obvious instead of silently returning wrong answers."
impact: "It works well enough that I stopped digging through old notes manually. It also taught me where semantic search breaks down. Short or ambiguous notes still return poor matches."
reflection: "The hard part wasn't any single service — it was keeping the database, the embedding pipeline, and the index in sync without the whole thing becoming fragile. The switch to local embeddings and SQLite removed two external API dependencies. If I rebuilt it today I'd look harder at search accuracy tuning and handling much larger note collections."
links:
  live: ""
  source: "https://github.com/jdluu/BrainWave"
description: "A note-taking app that uses a chat interface to help you find information in your notes."
startDate: 2024-02-01
endDate: 2024-03-31
thumbnail: "../../assets/images/projects/brainwave/thumbnail_brainwave.min.png"
programming_languages:
  - "TypeScript"
  - "Next.js"
  - "React"
  - "JavaScript"
domains:
  - "Web"
---
