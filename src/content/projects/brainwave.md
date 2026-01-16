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

cover: "../../assets/images/projects/brainwave/cover_brainwave.min.png"
final: "../../assets/images/projects/brainwave/final_brainwave.gif"

background: "BrainWave is an intelligent note-taking application built with Next.js, TypeScript, and AI integration. The goal was to create a personalized note-taking experience where users could retrieve information using natural language queries rather than traditional keyword search. I handled the full-stack development, focusing on integrating OpenAI, Pinecone, and the Vercel AI SDK to enable semantic search capabilities."

solution: "BrainWave integrates an AI chatbot using the Vercel AI SDK, ChatGPT, and Pinecone for vector-based semantic search. The application allows users to ask questions in natural language and receive context-aware answers sourced directly from their notes. I implemented vector embeddings for each note entry, enabling the system to understand query intent beyond keyword matching. The full-stack application uses Next.js with TypeScript, secure authentication via Clerk, and a MongoDB database managed through Prisma. Response streaming provides real-time feedback during AI interactions, improving user experience."

process: "I began by setting up the Next.js project structure with Shadcn UI components, then configured MongoDB, Prisma, and Clerk for database and authentication. I developed the core application layout and note management features, including creation, editing, and display functionality. Next, I integrated OpenAI and Pinecone to generate vector embeddings for notes and implemented the AI chat interface using the Vercel AI SDK. I followed an iterative development approach, testing each feature incrementally and refining the user interface based on usability feedback."

impact: "The AI chat feature enables users to retrieve information from their notes using conversational queries, which significantly improves information accessibility compared to traditional keyword search. By implementing response streaming, the application provides a smooth, real-time interaction experience that makes AI-powered note retrieval feel natural and responsive. This project successfully demonstrated the practical application of semantic search technologies and modern AI integration patterns in a user-focused application."

reflection: "This project highlighted the importance of architecture planning when coordinating multiple external services. I learned to balance feature complexity with code maintainability and identified opportunities to improve performance through better embedding management and response optimization. If I revisited this project, I would focus on enhancing error handling for API failures and implementing caching strategies for frequently accessed notes. Overall, this work improved my understanding of building practical, user-focused AI applications."

links:
  live: ""
  source: "https://github.com/jdluu/BrainWave"
description: "An intelligent note-taking web application with AI integration."
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
  - "AI/ML"
---
