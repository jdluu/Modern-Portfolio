---
title: "TruthSeeker"
slug: "truthseeker"
date: "2024-12"

summary: "An AI-powered fact-checking application that verifies statements in real-time using web searches and advanced language models, providing both a Streamlit web interface and CLI for fact-checking."

role: "Full Stack Developer"
technologies:
  ["Python", "Streamlit", "Pydantic", "DeepSeek API", "Brave Search API"]
tools: ["GitHub", "uv", "Rich", "httpx"]

cover: "../../assets/images/projects/truthseeker/cover_truthseeker.min.png"
final: "../../assets/images/projects/truthseeker/final_truthseeker.min.png"

background: "TruthSeeker is an AI-powered fact-checking application built with Python and Streamlit. The project addresses the challenge of verifying information accuracy in an era of widespread misinformation. I developed this tool to help users quickly verify statements by combining real-time web searches with advanced language model analysis. I handled the full-stack development, focusing on integrating search APIs, LLM processing, and creating both web and CLI interfaces."

solution: "TruthSeeker uses Brave Search API for real-time web searches and DeepSeek API for intelligent analysis of search results. The application performs live web searches when users submit statements, then uses function calling to allow the language model to dynamically request additional searches as needed. I implemented a clean architecture with domain models using Pydantic for type safety and validation. The system provides structured verdicts with explanations, context, and references. I built both a Streamlit web interface with a unified dark theme and a CLI interface with rich terminal formatting for automation and testing. The application includes HTML sanitization to reduce XSS risks and supports exporting fact-check history to JSON, PDF, or TXT formats."

process: "I began by designing the clean architecture structure, separating domain models, application services, infrastructure components, and interface adapters. I implemented the BraveSearchClient with retry logic, backoff strategies, and TTL caching for efficient API usage. I integrated the DeepSeek API with function calling capabilities to enable dynamic web search requests during analysis. I developed the Streamlit UI with a modern dark theme and intuitive user experience, then built the CLI interface using Rich for formatted terminal output. I implemented input sanitization, export functionality, and streaming support for real-time feedback. Throughout development, I focused on type safety using Pydantic models and configured CI linting and type-checking."

impact: "TruthSeeker successfully provides users with an accessible tool for fact-checking statements through both web and CLI interfaces, making information verification more convenient and reliable. By combining real-time web searches with AI-powered analysis, the application delivers structured, evidence-based verdicts that help users make informed decisions. The clean architecture and type-safe implementation demonstrate modern Python development practices, while the dual interface approach (web and CLI) makes the tool versatile for both interactive use and automation scenarios."

reflection: "This project improved my understanding of clean architecture principles and the importance of separating concerns in application design. I learned to effectively integrate multiple external APIs while maintaining code maintainability and type safety. Working with function calling in LLM APIs expanded my knowledge of dynamic AI interactions. The project highlighted the value of building multiple interfaces (web and CLI) to serve different use cases. If I continued this work, I would focus on enhancing the caching strategy, implementing more sophisticated search result ranking, and adding support for batch fact-checking operations."

links:
  live: "https://journeytotruth.streamlit.app"
  source: "https://github.com/jdluu/TruthSeeker"
description: "An AI-powered fact-checking application that verifies statements using real-time web searches and language models."
startDate: 2024-12-01
endDate: 2024-12-13
thumbnail: "../../assets/images/projects/truthseeker/thumbnail_truthseeker.min.png"
programming_languages:
  - "Python"
domains:
  - "Web"
  - "AI/ML"
---
