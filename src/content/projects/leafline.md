---
title: "Leafline"
slug: "leafline"
date: "2026-09"
draft: false

summary: "A local-first EPUB reader for Android. Books, reading progress, and annotations stay on the device, with no account and no telemetry."
role: "Local-First Android Developer"
technologies: ["Kotlin", "Jetpack Compose", "Room", "Readium", "Android"]
tools: ["Android Studio", "JUnit", "Espresso", "GitHub Actions"]

cover: "../../assets/images/projects/leafline/cover_leafline.png"
final: "../../assets/images/projects/leafline/final_leafline.png"

background: "Most reading apps treat a personal library as a reason to collect data. Leafline takes the opposite approach: books stay on the device and reading progress is stored locally."
solution: "Leafline imports EPUB files into a local library, extracts metadata and covers, and provides a focused reading view. Room-backed reading sessions track progress, bookmarks, and annotations. It can also browse an OPDS catalog and download into the same library, so books can arrive from a server of your own without going through a desktop. Reading progress lives on the device; pushing it between devices through KOReader-style records is the next piece of work."
process: "The project was built around testable local library and reader flows, with no remote service in the picture. Import reconciliation, cover caching, reading state, annotations, and RTL/CJK rendering each have dedicated tests. Instrumented tests exercise the main library and reader journeys on Android."
impact: "The result is a private reading workflow that works without an account, network connection, or telemetry pipeline. The codebase also provides a foundation for reliable local library management, so EPUB files are treated as worth keeping."
reflection: "The difficult part was preserving reading state while files move, change, or are imported again. Keeping identity and progress logic separate from the UI made those cases easier to reason about. Future work would focus on richer library organization and broader sync interoperability."
links:
  live: ""
  source: "https://github.com/jdluu/Leafline"
description: "A private, local-first EPUB reader for Android. Books and reading data stay on the device."
startDate: 2026-05-01
endDate: 2026-09-01
thumbnail: "../../assets/images/projects/leafline/thumbnail_leafline.min.png"
programming_languages:
  - "Kotlin"
domains:
  - "Mobile"
---
