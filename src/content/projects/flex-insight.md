---
title: "FlexInsight"
slug: "flex-insight"
date: "2026-03"
draft: true

summary: "An offline workout coach for Android that analyzes Hevy data locally with Gemini Nano — nothing leaves the phone."
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

background: "My training data lives in Hevy, and I didn't want to hand it to another cloud service just to get basic coaching feedback. Fitness data is personal. A Pixel 9 with Gemini Nano meant I could build analysis that runs entirely on-device."
solution: "The app syncs workout history from the Hevy API into local SQLite, then runs analysis through Android's AICore. Gemini Nano looks at volume and consistency trends and suggests weight adjustments or recovery days. Jetpack Compose UI designed to be readable mid-set at the gym."
process: "The real work was the bridge between the Hevy sync layer and local inference — including keeping the app fully usable with no signal in a gym basement. I went through many prompt iterations against the local model to get advice that was actually relevant and fast enough to feel live."
impact: "A working prototype that does what cloud fitness apps charge for, privately and offline. It's also proof to myself that small on-device models are good enough for narrow, well-structured problems."
reflection: "Biggest takeaway: local models are capable but constrained — prompt design matters far more than with frontier models, and structured input data matters more than either. Next I'd like to experiment with tool-calling or MCP servers to give the model research ability without breaking privacy."
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
