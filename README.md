# My Modern Web Portfolio

Welcome to my Modern Web Portfolio, built using Astro. This project showcases my skills and projects in a performance-optimized and visually appealing manner.

## Design Philosophy

I chose Astro for its content-focused, islands architecture, which enhances performance and usability. This portfolio emphasizes clean design and efficient loading, using HTML, CSS, and JavaScript.

This portfolio was built off of the content from my original portfolio here: <https://github.com/jdluu/portfolio>

## 🚀 Project Structure

Inside my Astro project, you'll see the following folders and files:

```
├── public/
│   ├── fonts/
│   │   ├── Lato/
│   │   ├── Montserrat/
│   │   ├── Open_Sans/
│   │   └── Pacifico/
│   ├── favicons/
│   │   ├── favicon.ico
│   │   ├── ms-tile-150x150.png
│   │   └── ms-tile-310x310.png
│   ├── icons/
│   │   ├── email.svg
│   │   ├── github.svg
│   │   ├── hamburger.svg
│   │   ├── home.svg
│   │   └── linkedin.svg
│   ├── styles/
│   │   ├── global.css
│   │   └── reset.css
│   └── Jeffrey_Luu_Resume.pdf
├── src/
│   ├── components/
│   │   ├── AboutContent.astro
│   │   ├── ContactForm.astro
│   │   ├── ExperienceCard.astro
│   │   ├── ExperienceCardGrid.astro
│   │   ├── ExperienceContent.astro
│   │   ├── Footer.astro
│   │   ├── IntroContent.astro
│   │   ├── Navbar.astro
│   │   ├── ProjectCard.astro
│   │   └── ProjectCardGrid.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   └── cosmic.ts
│   ├── scripts/
│   │   └── theme.ts
│   ├── env.d.ts
│   └── pages/
│       ├── experiences/
│       │   └── [slug].astro
│       ├── posts/
│       │   └── [slug].astro
│       ├── projects/
│       │   └── [slug].astro
│       ├── about.astro
│       ├── blog.astro
│       ├── contact.astro
│       ├── index.astro
│       ├── robots.txt.ts
│       └── work.astro
├── _headers
├── .env
├── .gitignore
├── astro.config.mjs
├── package-lock.json
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## Deployment

This project is continuously deployed on Netlify, ensuring that the latest updates are always live. You can view the deployment status and access the live site using the link below:

[![Netlify Status](https://api.netlify.com/api/v1/badges/640139f3-99cf-4263-8334-f33ac202e7fd/deploy-status)](https://app.netlify.com/projects/jdluucs/deploys)

## Repomix Command

```bash
repomix --ignore "dist/**,.astro/**,node_modules/**,npm-debug.log*,yarn-debug.log*,yarn-error.log*,pnpm-debug.log*,.env,.env.production,.DS_Store,.vscode/**,.idea/**"
```
