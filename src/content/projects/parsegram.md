---
title: "Parsegram"
slug: "parsegram"
date: "2021-10"

summary: "A photo-sharing Android application, similar to Instagram, built using Java and the Parse backend platform. It allows users to sign up, log in, capture and post photos with captions, and view a feed of posts."

role: "Android Developer"
technologies: ["Java", "Android", "Parse"]
tools: ["Android Studio", "Git", "GitHub"]

cover: "../../assets/images/projects/parsegram/cover_parsegram.png"
final: "../../assets/images/projects/parsegram/final_parsegram.gif"

background: "Parsegram is a photo-sharing Android application built with Java and the Parse backend platform. The project was designed to practice fundamental mobile development concepts including user authentication, backend integration, and media handling. I handled the Android development, focusing on implementing Instagram-like functionality with user accounts, photo posting, and a social feed."

solution: "Parsegram implements user authentication through Parse's backend service, allowing users to sign up, log in, and maintain session state. The application enables users to capture photos using the device camera or select images from the gallery, then post them with captions to a shared timeline. I built an infinite-scrolling feed using RecyclerView that displays all user posts, with pull-to-refresh functionality for updating content. The app leverages Parse as a Backend-as-a-Service platform to handle user management, data storage, and API endpoints without custom server development."

process: "I started by setting up the Android project and integrating Parse SDK dependencies for backend connectivity. I implemented user authentication flows for registration and login, handling session management and error cases. I developed the photo capture functionality using Android's implicit intents to access the camera and gallery. I created the post creation screen with image preview and caption input, then built the main feed activity with RecyclerView for efficient list rendering. I added pull-to-refresh and infinite scrolling features to enhance the user experience."

impact: "The application successfully delivers a functional photo-sharing platform with complete user authentication and posting capabilities, demonstrating practical mobile development skills. By integrating Parse as a Backend-as-a-Service platform, the project handled all server-side operations without requiring custom backend development, which streamlined the development process. The final product demonstrates practical implementation of core social media features including user accounts, media uploads, and dynamic content feeds, providing a solid foundation for understanding modern mobile app architecture."

reflection: "This project provided hands-on experience connecting Android applications to cloud backend services. I learned to work with Parse's API structure and handle asynchronous operations for network requests. Working with RecyclerView improved my understanding of efficient list rendering in Android. If I were to enhance this project, I would implement better error handling for network failures and add image compression to optimize upload performance and storage usage."

links:
  live: ""
  source: "https://github.com/jdluu/Parsegram"
description: "An photo sharing android app similar to Instagram."
startDate: 2021-10-22
endDate: 2021-10-27
thumbnail: "../../assets/images/projects/parsegram/thumbnail_parsegram.min.png"
programming_languages:
  - "Java"
domains:
  - "Mobile"
---
