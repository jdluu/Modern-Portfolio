---
title: "BrainWave"
slug: "brainwave"
date: "2024-02"

summary: "An intelligent note-taking app with AI integration, built with OpenAI, Pinecone, and Next.js to provide users with an AI chat assistant that can retrieve information from their notes."

role: "Full Stack Developer"
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

cover: "https://cdn.cosmicjs.com/e33cfbf0-e1bc-11ee-b074-b5c8fe3ef189-homeBW.png"
final: "https://cdn.cosmicjs.com/1d2d69f0-e1c0-11ee-b074-b5c8fe3ef189-finalBW.gif"

problem: "Many note-taking tools make it difficult to find information once notes start to pile up. Traditional keyword search often fails to capture context or intent, forcing users to remember exact wording. The idea behind BrainWave was to create a smarter way to recall information, allowing users to ask natural questions and receive relevant answers drawn from their own notes."

solution: "BrainWave allows users to interact with their notes through natural language instead of keyword search. They'll receive intelligent, context-aware answers sourced directly from their own notes. The system creates vector embeddings for each note, enabling semantic search that understands the meaning behind queries rather than just matching keywords. I built the entire full-stack application using Next.js with TypeScript, implementing secure user authentication with Clerk and a robust database schema with Prisma and MongoDB."

process: "I started by defining how users would create, store, and search notes, then designed a streamlined interface to make those actions feel effortless. After setting up authentication and database management, I built the note creation and display features, then integrated AI-driven search to link natural language queries with stored content. Throughout development, I iterated frequently, testing each new feature to refine both performance and usability."

impact: "The AI chat functionality makes it easier for users to find and recall information from their notes using conversational queries. Implementing response streaming through the Vercel AI SDK provided a more fluid, real-time interaction. Working on this project deepened my understanding of semantic search systems and modern AI integration patterns."

reflection: "This project highlighted the value of clear architecture planning and the challenges of coordinating multiple external services. I learned to balance feature complexity with maintainability and identified ways to improve performance through better embedding management and response optimization. Overall, BrainWave strengthened my skills in building practical, user-focused AI applications."

links:
  live: ""
  source: "https://github.com/jdluu/BrainWave"
---
