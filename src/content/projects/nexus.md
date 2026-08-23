---
title: "Nexus"
slug: "nexus"
date: "2026-03"
draft: true

summary: "A terminal dashboard that launches TUI apps so I stop forgetting their commands. Published to PyPI as nexus-tui."
role: "Developer"
technologies:
  ["Python", "Textual", "TOML", "Infisical", "uv", "PyPI", "GitHub Actions"]
tools: ["Tokyo Night", "Command Palette", "Fuzzy Search"]

cover: "../../assets/images/projects/nexus/cover_nexus.min.png"
final: "../../assets/images/projects/nexus/final_nexus.min.png"

background: "My terminal setup accumulated tools I use weekly, not daily, and every time I'd forget the command or which directory they lived in. I wanted one place to find and launch them all."
solution: "A cross-platform dashboard written in Python with Textual. Tools are defined in a TOML config, and fuzzy search plus a command palette find them fast. Launching suspends the dashboard cleanly and restores it when the tool exits. There's also a project browser for jumping between file contexts."
process: "Most effort went into terminal suspension. Launching a full-screen TUI from inside another TUI wrecks the display if you get it wrong, and cross-platform behavior differs in annoying ways. Managed the environment with uv, published to PyPI as nexus-tui, and automated releases with GitHub Actions."
impact: "I stopped looking up commands. Shipping it to PyPI was also my first time taking a personal utility through the full distribution lifecycle: versioning, packaging, publishing."
reflection: "Small organizational tools punch way above their weight day to day. Learned a lot about the Python TUI ecosystem and the edge cases of cross-platform terminal behavior. Eventually I'd like secret-management or remote-execution integrations."
links:
  live: "https://pypi.org/project/nexus-tui/"
  source: "https://github.com/jdluu/Nexus"
description: "A terminal dashboard that finds and launches TUI tools so you stop forgetting commands."
startDate: 2026-01-21
endDate: 2026-03-12
thumbnail: "../../assets/images/projects/nexus/thumbnail_nexus.min.png"
programming_languages:
  - "Python"
domains:
  - "Web"
---
