---
title: "ShelfSync"
slug: "shelf-sync"
date: "2026-04"
draft: true

summary: "A local network synchronization tool built to transfer Calibre ebook libraries and metadata between devices without relying on cloud services or cables."

role: "Developer"
technologies: ["Rust", "Tauri", "React", "Axum", "SQLite", "TypeScript", "mDNS"]
tools: ["Tokio", "Tantivy", "Tailwind CSS", "DaisyUI", "TanStack Query"]

cover: "../../assets/images/projects/shelf-sync/cover_shelf-sync.min.png"
final: "../../assets/images/projects/shelf-sync/final_shelf-sync.min.png"

background: "ShelfSync was developed to address the difficulty of transferring Calibre ebook libraries between devices. While Calibre is a powerful management tool, standard transfer methods often involve cables or third-party cloud services. The goal was to create a simpler, free alternative that preserves Calibre-specific metadata and file structures, ensuring the library remains consistent across different installations."

solution: "Built with Tauri and Rust, ShelfSync uses a local network to synchronize files between devices. Rust was selected for the backend to ensure efficient file processing and database interactions. The application implements a host-client model, where one device serves the library while others connect to browse and sync. Automated discovery via mDNS allows devices to find each other without manual configuration, while direct parsing of the Calibre metadata database ensures all series and tag information is preserved."

process: "Most of the work involved building a reliable sync process and handling the Calibre database structure safely. This required developing a local API with Axum and using Rusqlite to extract ebook metadata. The frontend was built with React and Tailwind CSS, featuring a high-contrast mode optimized for e-ink screens. Efforts were also directed at ensuring client devices could cache metadata locally for offline browsing."

impact: "The project provides a practical solution for ebook management by simplifying the library update process on mobile devices. It demonstrates the utility of cross-platform applications in coordinating data across a local network. By focusing on the Calibre ecosystem, the tool handles metadata more effectively than generic file transfer utilities, serving as an example of using systems languages to solve specific workflow challenges."

reflection: "Building ShelfSync served as an introduction to the Tauri ecosystem and the Rust programming language. The project provided experience in managing asynchronous tasks and bridging low-level backend logic with a web-based interface. It highlighted the performance and privacy advantages of local-first development compared to cloud-dependent alternatives."

links:
  live: ""
  source: "https://github.com/jdluu/ShelfSync"
description: "A multi-platform app for synchronizing Calibre libraries and metadata over local networks."
startDate: 2026-01-13
endDate: 2026-04-06
thumbnail: "../../assets/images/projects/shelf-sync/thumbnail_shelf-sync.min.png"
programming_languages:
  - "Rust"
  - "TypeScript"
  - "JavaScript"
domains:
  - "Web"
---
