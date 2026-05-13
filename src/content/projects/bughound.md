---
title: "Bughound"
slug: "bughound"
date: "2025-01-15"

summary: "A bug tracking tool built to help teams track and resolve software issues with a focus on simple data management and file attachments."
role: "Developer"
technologies: ["React", "TypeScript", "Bun", "Hono"]
tools: ["GitHub", "GitHub Actions", "Docker", "Supabase"]

cover: "../../assets/images/projects/bughound/cover_bughound.min.png"
final: "../../assets/images/projects/bughound/final_bughound.min.png"

background: "Bughound was built for a class project to address the need for a straightforward bug management tool. The goal was to create a system where team members could report, assign, and track the progress of software defects without a lot of unnecessary complexity. I handled the development of both the interface and the server logic, focusing on creating a reliable way to manage relational data like employees and bug reports."

solution: "I built the application with a React interface that talks to a backend server running on Bun. The interface uses interactive tables to make it easy to manage lists of programs and employees. I implemented a secure login system and a way to attach files to bug reports so that all the necessary information for a fix is in one place. The system tracks bugs from the moment they are reported until they are officially resolved."

process: "I began by designing a database to handle the relationships between different parts of the system like employees and functional areas. I set up the frontend and backend as separate parts and used database migrations to keep the data structure consistent as I added new features. A lot of the effort went into making sure the forms for reporting and updating bugs were easy to use and that any files uploaded were stored and retrieved correctly."

impact: "The tool provides a complete way to manage software issues with a simple, focused interface. It handles the full lifecycle of a bug report and makes it easy to see who is working on what. By using an automated update process, I was able to make sure the code stayed consistent throughout the development of the project."

reflection: "Building this project gave me a lot of practice with the Bun runtime and how to manage data across a full application. I learned about the importance of keeping data types consistent to prevent errors before they happen. It was also an interesting look into how to handle file uploads in a web app. If I were to keep working on this, I would add a notification system and more ways to filter and search through the bug reports."

links:
  live: ""
  source: "https://github.com/CECS-544-Spring-2025/bughound"
description: "A tool for tracking software bugs with support for file attachments and reporting."
startDate: 2025-01-15
endDate: 2025-05-31
thumbnail: "../../assets/images/projects/bughound/thumbnail_bughound.min.png"
programming_languages:
  - "TypeScript"
  - "React"
  - "JavaScript"
domains:
  - "Web"
---
