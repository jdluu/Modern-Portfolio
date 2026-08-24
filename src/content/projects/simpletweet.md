---
title: "SimpleTweet"
slug: "simpletweet"
date: "2021-10"

summary: "A minimal Twitter client for Android with an infinite-scrolling timeline, a compose screen, and OAuth login."
role: "Developer"
technologies: ["Java", "Android"]
tools: ["Git", "GitHub", "Android Studio"]

cover: "../../assets/images/projects/simpletweet/cover_simpletweet.min.png"
final: "../../assets/images/projects/simpletweet/final_simpletweet.gif"

background: "A later project in CodePath's Android track, after the early apps like SimpleTodo and Flixster. I needed to connect to a real production API with real auth requirements. Twitter's platform was the target: log in, read a timeline, post tweets."
solution: "The app has OAuth login, an infinite-scrolling timeline, and a compose screen with a character counter. The timeline refreshes automatically so new posts show up without manual reloads."
process: "Auth came first since everything depends on token handling being correct. Then the timeline: fetching, displaying, and paginating smoothly. Tested against my own account by posting real tweets and scrolling the feed to check that pagination behaved."
impact: "A working client around a live social platform, and a real education in API tokens and request structure, things toy projects don't teach."
reflection: "Working with a real API's constraints and security rules was the valuable part. Replies and sharing would be next if I extended it."
links:
  live: ""
  source: "https://github.com/jdluu/SimpleTweet"
description: "An Android app for viewing a Twitter timeline and posting new tweets."
startDate: 2021-10-08
endDate: 2022-03-22
thumbnail: "../../assets/images/projects/simpletweet/thumbnail_simpletweet.min.png"
programming_languages:
  - "Java"
domains:
  - "Mobile"
---
