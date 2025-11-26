---
title: "Flixster"
slug: "flixster"
date: "2021-09"

summary: "A movie browsing application for Android that displays a list of movies currently playing in theaters using data from The Movie Database (TMDb) API. Users can view movie details and watch trailers."

role: "Android Developer"
technologies: ["Java", "Android SDK", "Android Async HTTP"]
tools: ["Android Studio", "Git", "GitHub", "Glide"]

cover: "https://raw.githubusercontent.com/jdluu/Flixster/master/walkthrough.gif"
final: "https://raw.githubusercontent.com/jdluu/Flixster/master/walkthrough.gif"

problem: "A core skill for mobile developers is fetching data from a remote server, parsing the response, and displaying it in a user-friendly way. This project tackles the need for a practical exercise in working with REST APIs and presenting complex data in a mobile UI."

solution: "Flixster is an app that fetches a list of currently playing movies from The Movie Database API. It parses the JSON data and displays the movies in a scrollable list, showing their poster, title, and a brief overview. Tapping on a movie reveals a detailed view with more information and an embedded YouTube player for the trailer."

process: "Set up the project and made an asynchronous GET request to The Movie Database API to retrieve movie data. Created a custom 'Movie' data model and parsed the incoming JSON response into a list of these objects. Built a RecyclerView to display the movie list and a detail screen with an embedded YouTube player for trailers."

impact: "Integrated a third-party REST API to fetch and display dynamic data from the web. Constructed a master-detail user interface, allowing users to browse a list and tap to view specific item details. Implemented an embedded video player using the YouTube Android Player API to play movie trailers."

reflection: "Learned to handle asynchronous network requests to keep the application's UI responsive while fetching data. Practiced parsing complex JSON data and mapping it to custom Java objects for use within the app. Gained familiarity with using third-party libraries like Glide to efficiently load and cache images from a URL."

links:
  live: ""
  source: "https://github.com/jdluu/Flixster"
---
