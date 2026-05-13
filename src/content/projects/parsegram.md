---
title: "Parsegram"
slug: "parsegram"
date: "2021-10"

summary: "A photo-sharing Android app inspired by social media platforms, built to learn about user accounts, photo uploads, and feed management."

role: "Developer"
technologies: ["Java", "Android", "Parse"]
tools: ["Android Studio", "Git", "GitHub"]

cover: "../../assets/images/projects/parsegram/cover_parsegram.png"
final: "../../assets/images/projects/parsegram/final_parsegram.gif"

background: "I built Parsegram to learn the basics of building a social app. I wanted to see if I could create something that allows users to sign up, take photos with their camera, and share them with others in a common feed. It was a chance to practice working with a backend service and handling media on a mobile device."

solution: "The app uses a backend service to manage user accounts and store the photos that people post. I built a simple feed where you can scroll through all the recent posts and added a pull to refresh feature to check for new content. I used the device camera to let users take pictures directly within the app and then add captions before posting them to the shared timeline."

process: "I started by setting up the connection to the backend and building the login and sign up screens. Then I focused on the photo capture logic, making sure the app could access the camera and display a preview of the image. I spent a lot of time on the main feed to make sure it loaded posts efficiently and showed the captions correctly. I tested the app by creating multiple accounts and posting different types of images to see how the feed handled them."

impact: "The project resulted in a functional photo sharing app that handles the entire process from account creation to posting and viewing content. It served as a good way to understand how mobile apps communicate with servers to store and retrieve data. It provided a solid foundation for my understanding of how social features are built in a mobile environment."

reflection: "Building this was a useful lesson in how to connect an app to a cloud service. I learned how to handle background tasks so that uploading a photo does not freeze the interface. If I were to work on this more, I would add a way to like or comment on photos and find a way to compress the images so they upload faster."

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
