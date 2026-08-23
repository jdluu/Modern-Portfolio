---
title: "Zooseeker"
slug: "zooseeker"
date: "2022-03"

summary: "San Diego Zoo trip planner: pick the exhibits you want, get the shortest walking route between them."
role: "Developer"
technologies: ["Java", "Android"]
tools:
  [
    "Git",
    "GitHub",
    "Android Studio",
    "JUnit",
    "Espresso",
    "Robolectric",
    "Zenhub",
    "Github Actions CI",
  ]

cover: "../../assets/images/projects/zooseeker/cover_zooseeker.min.png"
final: "../../assets/images/projects/zooseeker/final_zooseeker.gif"

background: "A team course project out of UCSD. Zoo visitors waste huge amounts of backtracking, and neither the official app nor a paper map plans routes. We set out to build something that plans your day: select exhibits, get an efficient path."
solution: "Pick the animals you want to see and the app computes the shortest route through all of them; adding an exhibit mid-plan recalculates automatically. I focused on pathfinding correctness and helped build the exhibit-selection interface."
process: "We scoped features as a team starting from basic navigation. I kept the code organized with standard patterns and wrote extensive tests — JUnit, Espresso, Robolectric — running on GitHub Actions CI on every change, coordinated through Zenhub. Interface decisions were driven by one question: is this readable while someone walks through the zoo holding their phone?"
impact: "A working route planner that meaningfully cuts down walking. Also the best team-development experience I'd had to date: real testing discipline, real CI, real coordination."
reflection: "Team projects succeed or fail on process more than code — this one had good process. Faster route calculation and richer exhibit details would be the next steps."
links:
  live: ""
  source: "https://github.com/jdluu/ZooSeeker"
description: "An Android app that finds the shortest path between exhibits at the San Diego Zoo."
startDate: 2022-03-17
endDate: 2022-05-31
thumbnail: "../../assets/images/projects/zooseeker/thumbnail_zooseeker.min.png"
programming_languages:
  - "Java"
domains:
  - "Mobile"
---
