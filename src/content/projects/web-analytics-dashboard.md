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

background: "Started as a project for CSE 135 (Online Database Analytics Applications) at UCSD. I was curious which of my pages people actually visit and how long they stay. Existing analytics tools gave me more than I needed while taking my data elsewhere. So I built my own tracker."
solution: "A Node/Express endpoint collects visit data into MySQL, and a private dashboard renders traffic in ZingChart charts and tables. Login-gated so the analytics are mine alone."
process: "Deciding what was worth tracking came first: page views, session duration, and little else. Then schema design for event data, the collection code, and the dashboard. Verified end-to-end by browsing my sites and watching numbers land correctly."
impact: "It replaced guessing with real numbers for my own projects. It was also a solid full-stack exercise, since instrumentation, storage, and visualization all touch the same data."
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
