---
title: "Web Analytics Dashboard"
slug: "web-analytics-dashboard"
date: "2023-05"

summary: "Self-hosted web analytics: page views and session times on a private dashboard I control end to end."
role: "Developer"
technologies: ["JS", "Node.js", "Express.js", "MySQL", "ZingChart", "ZingGrid"]
tools: ["DigitalOcean", "GitHub", "MySQL Workbench", "Postman"]

cover: "../../assets/images/projects/web_analytics_dashboard/cover_web_analytics_dashboard.min.png"
final: "../../assets/images/projects/web_analytics_dashboard/final_web_analytics_dashboard.min.png"

background: "I wanted to know which of my pages people actually visit and how long they stay — but existing analytics tools gave me more than I needed while taking my data elsewhere. So I built my own tracker."
solution: "Node/Express collection endpoint writing to MySQL, and a private dashboard rendering traffic in ZingChart tables and charts. Login-gated so the analytics are mine alone."
process: "Deciding what was worth tracking came first — page views, session duration, and little else. Then schema design for event data, the collection code, and the dashboard. Verified end-to-end by browsing my sites and watching numbers land correctly."
impact: "Replaced guessing with real numbers for my own projects, and was a solid full-stack exercise: instrumentation, storage, and visualization all touching the same data."
reflection: "Designing a schema for append-heavy event tracking was new to me, and worth the effort. Handling higher volume and per-event drill-down charts would come next."
links:
  live: ""
  source: "https://jluu.dev/contact/"
description: "A web app with a private dashboard to track and see how people are using a website."
startDate: 2023-05-01
endDate: 2023-06-14
thumbnail: "../../assets/images/projects/web_analytics_dashboard/thumbnail_web_analytics_dashboard.min.png"
programming_languages:
  - "JavaScript"
domains:
  - "Web"
---
