---
title: "Flixster"
slug: "flixster"
date: "2021-09"

summary: "A movie browsing application for Android that displays a list of movies currently playing in theaters using data from The Movie Database (TMDb) API. Users can view movie details and watch trailers."

role: "Android Developer"
technologies: ["Java", "Android SDK", "Android Async HTTP"]
tools: ["Android Studio", "Git", "GitHub", "Glide"]

cover: "../../assets/images/projects/flixster/cover_flixster.png"
final: "../../assets/images/projects/flixster/final_flixster.gif"

background: "Flixster is a movie browsing Android application built with Java and the Android SDK. The project was designed to practice core mobile development skills, specifically working with REST APIs and displaying dynamic data in a user-friendly interface. I handled the Android development, focusing on integrating The Movie Database API and implementing a master-detail navigation pattern."

solution: "Flixster fetches currently playing movies from The Movie Database API and displays them in a scrollable list with poster images, titles, and brief descriptions. The application implements a master-detail interface where users can browse the movie list and tap items to view detailed information. I integrated the YouTube Android Player API to embed movie trailers directly within the detail screen. The app uses asynchronous HTTP requests to fetch data without blocking the UI thread, and implements custom data models to parse JSON responses into structured objects."

process: "I started by setting up the Android project structure and configuring dependencies for network requests and image loading. I created a custom Movie data model class and implemented JSON parsing logic to convert API responses into Java objects. I built a RecyclerView adapter to efficiently display the movie list, then developed a separate activity for movie details with an embedded YouTube player. Throughout development, I tested network request handling and ensured proper error management for failed API calls."

impact: "The application successfully integrates The Movie Database API to fetch and display dynamic movie data, demonstrating practical REST API integration skills. The master-detail user interface provides seamless navigation between the movie list and detailed views, creating an intuitive browsing experience. By embedding the YouTube player directly within the app, users can watch movie trailers without leaving the application, which enhances engagement and user satisfaction."

reflection: "This project provided practical experience with asynchronous network programming in Android and JSON data parsing. I learned to structure data models effectively and gained familiarity with RecyclerView for efficient list rendering. Working with the YouTube API introduced me to integrating third-party media players. If I were to improve this project, I would add caching mechanisms to reduce API calls and implement pull-to-refresh functionality for better user experience."

links:
  live: ""
  source: "https://github.com/jdluu/Flixster"
description: "An android app that displays the newest movie trailers and their reviews."
startDate: 2021-09-18
endDate: 2022-04-16
thumbnail: "../../assets/images/projects/flixster/thumbnail_flixster.min.png"
programming_languages:
  - "Java"
domains:
  - "Mobile"
---
