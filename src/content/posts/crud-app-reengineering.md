---
title: "Reengineering a CRUD Application: Authentication, Soft Delete, and Audit Trails"
date: "2025-11-15"
description: "Retrofitting an inherited Node.js customer management app for CECS 547 with sessions, soft deletes, version history, and audit logging."
tags:
  ["Software Engineering", "Node.js", "Express", "SQLite", "CSULB", "CECS 547"]
draft: false
links:
  - label: "Source code"
    url: "https://github.com/jdluu/crud-nodejs-mysql"
  - label: "CECS 547: Software Maintenance, Reengineering and Reuse"
    url: "https://csulb.catalog.acalog.com/preview_course_nopop.php?catoid=12&coid=109096"
---

For CECS 547 (Software Maintenance, Reengineering and Reuse), the assignment was to improve someone else's software instead of writing a project from scratch. I forked a small Node.js customer management app and worked on it over 38 commits.

Inheriting code shifts the problem. You spend less time designing data models from zero and much more time figuring out where new behavior belongs in an existing setup.

## What the application does

The original app handles basic customer records (create, read, update, delete) using Express, SQLite, and server-rendered EJS templates. I kept that core intact and layered four features on top.

## Authentication

The original stored the admin password in plain text. I added a users table, login and logout endpoints, bcrypt password hashing, and session management through express-session. A single middleware check protects all customer routes so controllers do not have to repeat authentication checks.

## Soft delete and restore

Deleting a customer now sets a `deleted_at` timestamp. Rows with timestamps stay out of the primary customer list and move to an archive screen where users can restore them if a deletion was a mistake.

## Version history

Every update writes the previous field values into a `customer_versions` table along with a version number, the editor's username, and a timestamp. Anyone viewing a customer record can inspect past edits to see what changed and who made the edit.

## Activity logging

A small logger captures logins, logouts, creates, updates, deletes, and restores, recording the acting user, IP address, and user agent. The log has its own view.

## Testing and setup

I wrote an end-to-end test suite in Puppeteer that launches the server, exercises login, runs through the CRUD operations, tests soft delete and recovery, and shuts down cleanly. I also added a database setup utility so SQLite creates its own tables on first launch instead of needing manual setup scripts.

The class work included change request and maintenance documentation, which I wrote during the term and removed from the repository afterward.

## What I took from it

Most of the work was reading: tracking down where the SQLite connection opened, how routes mapped to controllers, and how errors surfaced. The changes that went in smoothly were the ones that matched conventions already in place. Version history, activity logging, and DB bootstrapping fit best as helper utilities that the controllers invoke directly.

The repo linked at the top has setup steps, endpoint lists, and the schema layout in its README.
