---
title: "BrainWave"
slug: "brainwave"
date: "2024-02"

summary: "A note-taking app with a chat interface to find information in notes using AI and a specialized search index."

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

background: "BrainWave was built to explore a more natural way to retrieve information from personal notes. Since traditional keyword search requires remembering exact phrasing, the project aimed to create a note-taking experience where users could ask questions in plain language. The goal was to develop a tool that understands the context of written content rather than just performing character matching."

solution: "The application uses a chat interface that connects to a specialized search index. When notes are created, the system generates a digital representation of the content, allowing it to be searched by meaning. Built with Next.js and secure authentication, the app ensures that personal notes remain private. The chat interface provides real-time feedback, creating a conversational experience for finding specific information."

process: "Development began with implementing core note management features such as entry creation and editing. Most of the work involved integrating the note database with an AI-powered search tool. This required developing a method to accurately transform text into searchable data and building a reliable retrieval system for the chat assistant. The interface was iteratively tested to ensure the chat felt responsive and effective during information retrieval."

impact: "The project simplifies the process of retrieving information from large collections of notes. By allowing conversational queries, it reduces the time spent manually searching through old files. It serves as an exploration of how semantic search and AI patterns can improve the accessibility of personal data."

reflection: "Building BrainWave provided a lesson in coordinating multiple web services within a single application. The project required handling the data flow between a primary database and a search index without introducing unnecessary complexity. Future improvements could focus on increasing search accuracy and optimizing the system for even larger datasets."

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
