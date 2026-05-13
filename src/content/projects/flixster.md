---
title: "Flixster"
slug: "flixster"
date: "2021-09"

summary: "An Android app for browsing movies currently playing in theaters using data from a movie database. Users can see details and watch trailers."

role: "Developer"
technologies: ["Java", "Android SDK", "Android Async HTTP"]
tools: ["Android Studio", "Git", "GitHub", "Glide"]

cover: "../../assets/images/projects/flixster/cover_flixster.png"
final: "../../assets/images/projects/flixster/final_flixster.gif"

background: "Flixster was a way for me to learn how to build Android applications. I wanted to create something that could pull live data from a movie database and show it in a simple, easy to use list. I focused on learning how to talk to a remote API and how to navigate between different screens in a mobile app."

solution: "The app gets a list of movies and shows them with their posters, titles, and descriptions. I set it up so that you can tap on any movie to see more details about it. I also included a way to watch movie trailers directly in the app. It uses background requests to get the movie data so the app stays responsive while it is loading information."

process: "I started by setting up the project and adding the tools I needed for network requests and image loading. I created a data model for the movies and wrote logic to parse the information coming from the API. I spent time building a list that can handle many items efficiently and then added a second screen for the movie details. I tested the app to make sure it handled errors correctly if the movie data could not be reached."

impact: "The app successfully pulls and displays movie data in a clean interface. It provides a simple way to browse through new releases and watch trailers without having to leave the application. It served its purpose as a functional prototype that helped me understand the basics of mobile development."

reflection: "Building this gave me my first look at how to handle data in a mobile app. I learned how to structure my code to handle information from an external source and how to build a list that scrolls smoothly. If I were to work on this again, I would add a way to save favorite movies so I could find them later even without an internet connection."

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
