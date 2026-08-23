---
title: "ShelfSync"
slug: "shelf-sync"
date: "2026-04"
draft: true

summary: "Syncs Calibre ebook libraries between devices over the local network, without cloud services or cables, keeping metadata intact."
role: "Developer"
technologies: ["Rust", "Tauri", "React", "Axum", "SQLite", "TypeScript", "mDNS"]
tools: ["Tokio", "Tantivy", "Tailwind CSS", "DaisyUI", "TanStack Query"]

cover: "../../assets/images/projects/shelf-sync/cover_shelf-sync.min.png"
final: "../../assets/images/projects/shelf-sync/final_shelf-sync.min.png"

background: "Getting a Calibre library from my desktop onto other devices always involved a cable or handing my books to some third-party cloud. Neither seemed necessary for devices sitting on the same network, so I built the tool I wanted."
solution: "Tauri + Rust desktop app. One device hosts the library over the local network; others connect to browse and sync. mDNS discovery means zero manual configuration, and parsing Calibre's metadata database directly means series and tags survive the trip."
process: "The bulk of the work was a reliable sync engine and treating Calibre's database with care: Axum for the local API, Rusqlite for metadata extraction. React + Tailwind frontend with a high-contrast mode tuned for e-ink screens, and clients cache metadata for offline browsing."
impact: "Updating books on my e-reader went from a cable ritual to automatic. Being Calibre-specific is the point: it preserves metadata that generic transfer tools drop."
reflection: "This was my proper introduction to Rust and Tauri: async task management, and bridging systems-level backend code with a web UI. It also confirmed my preference for local-first tools: they're faster, private, and there's no subscription."
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
