---
title: "Parsegram"
slug: "parsegram"
date: "2021-10"

summary: "A photo-sharing Android app built in a week to learn accounts, camera capture, and feed design."
role: "Developer"
technologies: ["Java", "Android", "Parse"]
tools: ["Android Studio", "Git", "GitHub"]

cover: "../../assets/images/projects/parsegram/cover_parsegram.png"
final: "../../assets/images/projects/parsegram/final_parsegram.gif"

background: "The final project of CodePath's Android course. I was curious how social apps work under the hood, so I built a minimal Instagram-style clone: sign up, take a photo, caption it, post to a shared feed."
solution: "Parse handles accounts and image storage. The feed shows recent posts with pull-to-refresh, photos come straight from the device camera with captions added before posting."
process: "Backend connection and auth screens first, then camera capture and preview, which took longer than expected to get right. Tested by creating several accounts and posting different images to make sure the feed held up."
impact: "Built in about a week (Oct 22–27, 2021). Not fancy, but it covered the whole loop: account creation through posting to viewing, and demystified how mobile apps talk to servers."
reflection: "Main practical lesson: move work off the main thread or uploads freeze your UI. With more time I'd add reactions and client-side image compression, because raw photos upload painfully slowly."
links:
  live: ""
  source: "https://github.com/jdluu/Parsegram"
description: "A photo sharing app for Android that allows users to post pictures and view a feed."
startDate: 2021-10-22
endDate: 2021-10-27
thumbnail: "../../assets/images/projects/parsegram/thumbnail_parsegram.min.png"
programming_languages:
  - "Java"
domains:
  - "Mobile"
---
