---
title: "Bughound"
slug: "bughound"
date: "2025-01-15"

summary: "A bug tracker built for CECS 544 — reports, assignments, attachments, and lifecycle tracking without the bloat."
role: "Developer"
technologies: ["React", "TypeScript", "Bun", "Hono"]
tools: ["GitHub", "GitHub Actions", "Docker", "Supabase"]

cover: "../../assets/images/projects/bughound/cover_bughound.min.png"
final: "../../assets/images/projects/bughound/final_bughound.min.png"

background: "This was a semester project for my software testing course (CECS 544). We needed a bug tracker that didn't drown you in features: report a defect, assign it, attach evidence, track it to resolution. I owned both the interface and the server logic."
solution: "React frontend talking to a backend running on Bun. Editable tables for managing programs and employees, login, and file attachments on bug reports so fix context lives in one place. Every report moves through a defined status flow from submission to resolution."
process: "I designed the relational schema first — employees, programs, functional areas, and how they map onto reports. Frontend and backend stayed separate, with migrations keeping the schema stable as features landed. A lot of time went into form ergonomics and making uploads actually work end-to-end."
impact: "It covers the full bug lifecycle in an interface a team could actually use, and CI kept the code consistent through the whole semester."
reflection: "This was my first serious time with Bun as a runtime, and it sold me on fast tooling. The lesson that stuck: get your data types consistent early or you'll pay for it later. With more time I'd add notifications and better filtering."
links:
  live: ""
  source: "https://github.com/CECS-544-Spring-2025/bughound"
description: "A tool for tracking software bugs with support for file attachments and reporting."
startDate: 2025-01-15
endDate: 2025-05-31
thumbnail: "../../assets/images/projects/bughound/thumbnail_bughound.min.png"
programming_languages:
  - "TypeScript"
  - "React"
  - "JavaScript"
domains:
  - "Web"
---
