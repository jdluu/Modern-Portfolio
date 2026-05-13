---
title: "TruthSeeker"
slug: "truthseeker"
date: "2024-12"

summary: "A tool that uses AI and web searches to help check if statements are likely true or false, providing detailed answers with sources."

role: "Developer"
technologies:
  ["Python", "Streamlit", "Pydantic", "DeepSeek API", "Brave Search API"]
tools: ["GitHub", "uv", "Rich", "httpx"]

cover: "../../assets/images/projects/truthseeker/cover_truthseeker.min.png"
final: "../../assets/images/projects/truthseeker/final_truthseeker.min.png"

background: "TruthSeeker was built to address the challenge of verifying the accuracy of information found online. The project aims to provide a reliable way to verify statements by combining real-time web searches with AI-powered analysis. The goal was to develop a tool that could quickly identify evidence to support or refute specific claims, reducing the difficulty of manual fact-checking."

solution: "The tool integrates a search engine API with an AI model to analyze live results. When a statement is submitted, the system performs a web search and uses the retrieved information to provide a verdict. Built with Streamlit for the web and featuring a terminal-based version, the system offers clear explanations and direct links to sources. It supports exporting history to various formats and uses structured data models to ensure information remains organized."

process: "Development focused on separating the search and analysis components to maintain a clean project structure. This involved building a search client with caching and retry logic, followed by implementing the AI's ability to request additional searches dynamically. Significant effort was spent on the web interface to ensure results were easy to read and that the overall user experience was intuitive."

impact: "The project offers a detailed method for checking facts by combining live data with AI analysis. It provides a more comprehensive look at a topic than a standard search engine and serves as a practical exploration of how modern tools can assist in information verification. The dual-interface approach makes the tool versatile for both interactive sessions and automated checks."

reflection: "Building TruthSeeker provided a lesson in combining multiple external APIs to solve a specific problem. It required handling real-time data flow and ensuring that the AI model could accurately interpret and summarize search results. Future development could focus on improving search performance and refining the criteria used to filter reliable sources."

links:
  live: "https://journeytotruth.streamlit.app"
  source: "https://github.com/jdluu/TruthSeeker"
description: "A tool for checking facts by using real-time web searches and AI analysis."
startDate: 2024-12-01
endDate: 2024-12-13
thumbnail: "../../assets/images/projects/truthseeker/thumbnail_truthseeker.min.png"
programming_languages:
  - "Python"
domains:
  - "Web"
  - "AI/ML"
---
