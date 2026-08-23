---
title: "Flixster"
slug: "flixster"
date: "2021-09"

summary: "The Android app I built to learn mobile development. Browse movies, view details, watch trailers."
role: "Developer"
technologies: ["Java", "Android SDK", "Android Async HTTP"]
tools: ["Android Studio", "Git", "GitHub", "Glide"]

cover: "../../assets/images/projects/flixster/cover_flixster.png"
final: "../../assets/images/projects/flixster/final_flixster.gif"

background: "This was my introduction to Android development, built as part of CodePath's Android course. The goal was simple: pull live data from a movie API and present it cleanly, while learning how network calls and screen navigation actually work on mobile."
solution: "A movie list with posters, titles, and descriptions; tap through to a detail screen; play trailers inline. Network requests run in the background so the list stays responsive while data loads."
process: "Set up the HTTP client and image loading first, modeled the movie data, wrote the parsing logic, then built the list and detail screens. I tested failure cases deliberately (what happens when the API is unreachable?) because that's the part tutorials skip."
impact: "It did exactly what I set out for: a working app that made the fundamentals of mobile development concrete instead of theoretical."
reflection: "First time handling remote data in an app and building a scrollable list that doesn't stutter. If I revisited it, offline favorites would be the obvious addition."
links:
  live: ""
  source: "https://github.com/jdluu/Flixster"
description: "An Android app that shows movie trailers and info from a movie database."
startDate: 2021-09-18
endDate: 2022-04-16
thumbnail: "../../assets/images/projects/flixster/thumbnail_flixster.min.png"
programming_languages:
  - "Java"
domains:
  - "Mobile"
---
