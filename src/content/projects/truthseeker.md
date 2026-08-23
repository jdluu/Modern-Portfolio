---
title: "TruthSeeker"
slug: "truthseeker"
date: "2024-12"

summary: "A fact-checking assistant. Give it a claim; it searches the web and returns an AI verdict with linked sources."
role: "Developer"
technologies:
  ["Python", "Streamlit", "Pydantic", "DeepSeek API", "Brave Search API"]
tools: ["GitHub", "uv", "Rich", "httpx"]

cover: "../../assets/images/projects/truthseeker/cover_truthseeker.min.png"
final: "../../assets/images/projects/truthseeker/final_truthseeker.min.png"

background: "Manually checking claims online means opening ten tabs and reconciling them yourself. I wanted to automate the tedious part: search for evidence, have a model assess it against the claim, and show the sources so I can disagree with the verdict."
solution: "Streamlit web app plus a terminal version. Submitting a statement triggers a Brave Search lookup, and a DeepSeek model reasons over the results to produce a verdict with explanations and direct source links. Search history exports to multiple formats, and Pydantic models keep responses structured."
process: "I kept search and analysis as separate components so I could test each cleanly. The search client has caching and retry logic; the AI can request follow-up searches when initial results aren't sufficient. Most iteration went into result presentation."
impact: "Gives a more grounded answer than a plain search engine because it shows its evidence. The two interfaces make it useful both interactively and in scripts."
reflection: "Coordinating external APIs around a model's judgment was the interesting problem, especially letting the model decide when it needs more searches. Filtering source reliability better would be the next investment."
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
