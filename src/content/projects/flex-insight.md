---
title: "FlexInsight"
slug: "flex-insight"
date: "2026-03"
draft: true

summary: "An offline workout coach for the Pixel 9 that uses local AI and the Hevy API to provide private, free training insights."

role: "Developer"
technologies:
  [
    "Kotlin",
    "Jetpack Compose",
    "Gemini Nano",
    "AICore",
    "Hevy API",
    "SQLite",
    "Retrofit",
  ]
tools: ["Android Studio", "Material 3", "Local AI"]

cover: "../../assets/images/projects/flex-insight/cover_flex-insight.min.png"
final: "../../assets/images/projects/flex-insight/final_flex-insight.min.png"

background: "FlexInsight was created to explore how local AI could function as a fitness coach using data from the Hevy app. Since health and fitness data is highly personal, the goal was to build a tool that could provide feedback and analysis without sending sensitive information to a cloud service. Using a Pixel 9 with Gemini Nano made it possible to keep this workflow private, offline, and entirely on-device."

solution: "The application pulls workout history from the Hevy API and processes it locally via Android's AICore. By integrating Gemini Nano, the app analyzes volume and consistency to provide suggestions on weight adjustments or recovery needs. The interface was built with Jetpack Compose to ensure data is easy to read and accessible during active gym sessions."

process: "Development focused on building a reliable bridge between the Hevy API and the local AI processing layer. This involved creating a sync process to store data in a local database, ensuring the app remained functional in environments without network reception. Significant effort was spent testing prompts for the local model to ensure the generated coaching advice was relevant and fast enough for real-time use."

impact: "The project resulted in a functional prototype that serves as a private alternative to cloud-based fitness analytics. It demonstrates that on-device AI is capable of handling personalized data analysis for specific use cases like fitness tracking. The tool remains a practical solution for tracking training progress while maintaining complete data sovereignty."

reflection: "Building FlexInsight provided insights into the capabilities and limitations of smaller, local AI models. The project showed that with correctly structured data, on-device hardware can solve complex problems without relying on massive cloud infrastructure. Future interests include exploring how to give local models more power through tool-calling or MCP servers, potentially allowing for exercise research within a private workflow."

links:
  live: ""
  source: "https://github.com/jdluu/FlexInsight"
description: "A private, offline-first Android fitness companion leveraging on-device AI for personalized coaching."
startDate: 2025-12-14
endDate: 2026-03-07
thumbnail: "../../assets/images/projects/flex-insight/thumbnail_flex-insight.min.png"
programming_languages:
  - "Kotlin"
domains:
  - "Mobile"
---
