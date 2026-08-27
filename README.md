# Linguistic Analysis API

A TypeScript Express API for managing users, projects, transcripts, and linguistic analysis workflows. It supports authentication, project creation, transcript uploads, and analyses used for child language research.

## Overview

This API is designed to allow a user to:

- register and log in securely
- create and manage projects
- upload transcript files
- assign transcripts to children in a project
- run linguistic analyses, including FREW, MLU, KWAL, and LEXRARE
- view results and other statistics

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL via `postgres` driver
- JWT authentication
- bcrypt password hashing
- Supabase Storage for transcript uploads
- Axios client for the external analysis service
- Jest + Supertest for tests

## Prerequisites

Before running the application, ensure you have:

- Node.js 18 or later
- npm
- PostgreSQL database
- Supabase project with storage enabled
- External linguistic analysis API running and available via a base URL

## Installation

1. Clone the repository
2. Install dependencies:

    `npm install`

3. Create a `.env` file in the runtime directory used by the app. This project loads environment variables from `__dirname + "/.env"`, so in development this is typically `src/.env`.

Example:

```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/linguistic_analysis
JWT_SECRET=your-super-secret-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
ANALYSIS_API_URL=http://localhost:8000
```

## Running the Application

Development mode:

    `npm run dev`

## Available Scripts

```bash
npm run dev     # run the server with nodemon and ts-node
npm run watch   # watch for TypeScript recompilation
npm test        # run Jest tests
```

## Authentication

Most routes are protected by JWT middleware and require an `Authorization` header:

```http
Authorization: Bearer <token>
```

The token is issued by the login endpoint and expires after 1 day.

## Example Requests

### Log in

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testaccount",
    "password": "dhskYIHG7T23"
  }'
```

### Create a project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bilingualism Analysis",
    "description": "Analysing English-French bilingual children.",
    "children": ["Stephen", "James"]
  }'
```

## Notes

- The server runs on port `3000` by default unless overridden with `PORT`.
- Transcript upload is done async via a task entry and returns a task location for progress tracking.
- Project and transcript access is enforced by the authenticated user ID, so users can only see their own data.
