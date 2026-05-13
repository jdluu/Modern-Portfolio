---
title: "Tune Twin"
slug: "tune-twin"
date: "2026-02"
draft: true

summary: "A music discovery tool built to find new songs within YouTube Music by deconstructing playlist vibes and applying AI patterns to song discovery."

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

background: "Tune Twin was built to improve music discovery within YouTube Music. Since standard recommendations can often feel repetitive, the goal was to deconstruct why certain playlists felt cohesive. By analyzing specific elements like tempo and overall energy, the project aimed to find Twin recommendations that align with a specific vibe. It served as a way to explore how AI patterns could be applied to personal music discovery."

solution: "The application uses a logic engine to analyze YouTube Music playlists via the youtubei.js library. This logic identifies algorithmic identities, such as the difference between a chill lofi vibe and a more energetic sound. The frontend was developed using Next.js and Material UI to provide a simple, effective interface for both light and dark modes. PWA support was included for mobile use, with search history stored locally to ensure privacy."

process: "Development began with building a core library for YouTube Music interaction, followed by the analysis logic for music vibes. A modular directory structure was used to maintain organization during experimentation. For data fetching, Next.js Server Actions were implemented along with basic caching to improve responsiveness. Unit tests were also included to verify that the core analysis logic performed as expected."

impact: "The project provides a more effective way to find new songs that match the mood of existing playlists. It demonstrates how AI concepts can solve simple discovery problems and resulted in a functional prototype for expanding a music library. Making the app a PWA ensured a consistent experience across both desktop and mobile devices."

reflection: "Building Tune Twin was a lesson in handling real-time data from an external platform and processing it efficiently. The project required careful thought regarding data fetching patterns to ensure a responsive user experience. It also provided a look into how to organize a project so it remains manageable as more features are added. Future expansion could involve integrating additional music platforms to broaden the discovery tool's scope."

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
