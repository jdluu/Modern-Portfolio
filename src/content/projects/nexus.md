---
title: "Nexus"
slug: "nexus"
date: "2026-03"
draft: true

summary: "A terminal dashboard and launcher built to organize and run TUI applications without needing to remember their specific commands or directory paths."

role: "Developer"
technologies:
  ["Python", "Textual", "TOML", "Infisical", "uv", "PyPI", "GitHub Actions"]
tools: ["Tokyo Night", "Command Palette", "Fuzzy Search"]

cover: "../../assets/images/projects/nexus/cover_nexus.min.png"
final: "../../assets/images/projects/nexus/final_nexus.min.png"

background: "Nexus was created to organize a growing collection of terminal-based tools. While common utilities are easy to remember, many specialized applications have unique names or require specific directory paths that are difficult to recall when not used daily. The project provides a central hub for TUI and CLI applications, functioning as a dedicated launcher for a terminal-based environment."

solution: "Built with Python and the Textual framework, Nexus is a cross-platform dashboard that uses a TOML configuration file to define tools and launch commands. Key features include fuzzy search and a command palette for rapid tool discovery. The application handles tool orchestration through a suspension mechanism, allowing it to yield control to a launched tool and resume seamlessly upon exit. A project browser was also integrated to help navigate file contexts quickly."

process: "Most of the effort was focused on creating a responsive interface and ensuring reliable tool orchestration across platforms. Implementing the terminal suspension logic was critical to avoid display issues when launching TUIs from within the dashboard. The uv package manager was used to maintain environment consistency, and the project was eventually deployed to PyPI as nexus-tui. GitHub Actions were also configured to automate the publishing process."

impact: "The project improved terminal workflows by eliminating the need to manually look up commands or navigate through folders for specific utilities. It also provided a learning experience in building and distributing front-facing software. Deploying to PyPI as a standalone package demonstrated the full lifecycle of a tool, from initial utility to a distributed package available for others to install."

reflection: "Building Nexus showed how simple organizational tools can significantly improve daily workflows. The project provided practice with the Python TUI ecosystem and the nuances of cross-platform terminal behavior. Future goals include adding more integrations for secret management or remote execution, while the current version remains an essential part of a terminal setup."

links:
  live: "https://pypi.org/project/nexus-tui/"
  source: "https://github.com/jdluu/Nexus"
description: "A cross-platform TUI dashboard for seamless tool orchestration and launching."
startDate: 2026-01-21
endDate: 2026-03-12
thumbnail: "../../assets/images/projects/nexus/thumbnail_nexus.min.png"
programming_languages:
  - "Python"
domains:
  - "Web"
---
