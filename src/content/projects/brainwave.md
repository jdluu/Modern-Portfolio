---
title: "BrainWave"
slug: "brainwave"
date: "2024-02"

summary: "A note-taking app where you ask questions about your notes in plain language instead of guessing keywords."
role: "Developer"
technologies:
  [
    "Next.js",
    "Typescript",
    "TailwindCSS",
    "Prisma",
    "MongoDB",
    "Vercel AI",
    "ChatGPT API",
    "Pinecone",
  ]
tools: ["GitHub", "Clerk", "Shadcn UI"]

cover: "../../assets/images/projects/brainwave/cover_brainwave.min.png"
final: "../../assets/images/projects/brainwave/final_brainwave.gif"

background: "I kept losing things in my own notes. Keyword search only works if you remember the exact word you wrote, and six months later you never do. I wanted to see if I could just ask my notes a question and get an answer back."
solution: "It looks like a chat window. Underneath, notes are embedded into a Pinecone index at save time, so queries match by meaning rather than exact characters. Next.js on the frontend, Clerk for auth so notes stay private to their owner, Prisma and MongoDB for storage."
process: "I built plain note CRUD first, then spent most of the project on the retrieval side: getting embeddings generated reliably on note create/update, and wiring the chat assistant to pull from the index before answering. The trickiest part was making retrieval failures obvious instead of silently returning wrong answers."
impact: "It works well enough that I stopped digging through old notes manually. It also taught me where semantic search breaks down — short or ambiguous notes still return poor matches."
reflection: "The hard part wasn't any single service, it was keeping the database, the embedding pipeline, and the index in sync without the whole thing becoming fragile. If I rebuilt it today I'd look harder at search accuracy tuning and handling much larger note collections."
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
