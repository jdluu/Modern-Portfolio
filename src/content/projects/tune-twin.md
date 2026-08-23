---
title: "Tune Twin"
slug: "tune-twin"
date: "2026-02"
draft: true

summary: "Finds new songs that match a YouTube Music playlist's vibe by analyzing tempo and energy — not just 'more like this'."
role: "Developer"
technologies:
  [
    "Next.js",
    "TypeScript",
    "Material UI",
    "Bun",
    "YouTubei.js",
    "Vitest",
    "React Testing Library",
    "Vercel",
  ]
tools:
  [
    "GitHub Actions",
    "Feature-Sliced Design",
    "Server Actions",
    "unstable_cache",
  ]

cover: "../../assets/images/projects/tune-twin/cover_tune-twin.min.png"
final: "../../assets/images/projects/tune-twin/final_tune-twin.min.png"

background: "YouTube Music recommendations loop the same artists back at me. I wanted something that explains why a playlist feels cohesive (tempo, energy, mood) and finds songs matching that recipe instead of just adjacent artists."
solution: "Next.js app that reads playlists through youtubei.js and analyzes their characteristics to generate 'twin' recommendations. The frontend uses Material UI with light and dark modes, the app installs as a PWA, and search history stays on-device."
process: "Built the YouTube Music core library first, then the vibe-analysis engine on top. Feature-sliced directory structure kept experimentation from turning into spaghetti. Server Actions plus caching handle data fetching, and unit tests cover the analysis logic, since that's the part most likely to break quietly."
impact: "It surfaces songs I wouldn't have found through the native recommendation loop, filtered by whatever mood I'm in. As a PWA it behaves consistently on desktop and phone."
reflection: "Real-time data from an unofficial platform API teaches humility. Caching strategy matters as much as the analysis itself. Adding other music platforms would multiply its usefulness."
links:
  live: "https://tune-twin-plum.vercel.app/"
  source: "https://github.com/jdluu/Tune-Twin"
description: "A music discovery application that generates algorithmic recommendations from YouTube Music playlists."
startDate: 2026-01-15
endDate: 2026-02-10
thumbnail: "../../assets/images/projects/tune-twin/thumbnail_tune-twin.min.png"
programming_languages:
  - "TypeScript"
  - "CSS"
  - "JavaScript"
domains:
  - "Web"
---
