---
title: "ShelfSync"
slug: "shelf-sync"
date: "2026-04"
draft: false

summary: "Browses a self-hosted OPDS ebook catalog and keeps verified downloads available offline on desktop and Android."
role: "Rust & Tauri Developer"
technologies: ["Rust", "Tauri", "React", "TypeScript", "SQLite", "OPDS"]
tools: ["Tokio", "Tailwind CSS", "DaisyUI", "TanStack Query"]

cover: "../../assets/images/projects/shelf-sync/cover_shelf-sync.png"
final: "../../assets/images/projects/shelf-sync/final_shelf-sync.png"

background: "My ebooks live on a server at home. Getting one onto my laptop or phone still meant opening a browser, saving a file to a downloads folder, and hoping it arrived intact. I wanted a client that treated my own catalog as a catalog, with a real library state for every book."
solution: "ShelfSync connects to any OPDS server and browses the catalog with cover-forward cards. Downloads stream into a .part file, verify against the checksums the server publishes, and rename into place only once they match, so a dropped connection never leaves a half book behind. The offline library tracks each publication through complete, downloading, failed, unavailable, and superseded states. ShelfSync does not open books. It hands the verified file to a reader, which in my case is Leafline."
process: "Most of the work was assuming the remote catalog is unreliable. OPDS feeds are Atom XML, so I parse them with quick-xml and handle missing entries, awkward pagination, and servers that answer slowly. Downloads needed resumable job state that survives an app restart, which is why the SQLite schema tracks provider-scoped publications, acquisitions, file revisions, and download jobs. A book is never identified by its filename alone. The frontend is React with a virtualized grid and TanStack Query, and there are two themes, paper and lamplight. A Calibre compatibility layer still exists from earlier versions; new work goes through OPDS."
impact: "Books now reach my laptop and phone with the metadata they had on the server, without a third-party account. Downloads either verify or fail loudly, which is the part I care about most."
reflection: "This was my introduction to Rust and Tauri: async job management, and bridging a systems backend with a React frontend. The harder design question was what ShelfSync should not do. Keeping reading out of it and letting a dedicated reader own that kept both codebases simpler, and it made the file on disk the only thing the two apps share. Next I would work on reconciling the offline library against the server without ever deleting a file on its own."
links:
  live: ""
  source: "https://github.com/jdluu/ShelfSync"
description: "A Tauri app for browsing an OPDS ebook catalog and keeping verified downloads offline on desktop and Android."
startDate: 2026-01-13
endDate: 2026-04-06
thumbnail: "../../assets/images/projects/shelf-sync/thumbnail_shelf-sync.min.png"
categories:
  - "Desktop"
  - "Mobile"
---
