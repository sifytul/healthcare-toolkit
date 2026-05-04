# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Healthcare toolkit for managing patient records and antibiogram data to track antibiotic resistance patterns. The project is a full-stack application with a React frontend and Express backend.

## Common Commands

### Backend (server/)
```bash
cd server
yarn dev      # Start development server with nodemon (port 7000)
yarn build    # Start production server
```

### Frontend (client/)
```bash
cd client
yarn dev      # Start Vite dev server
yarn build    # Build for production
yarn preview  # Preview production build
```

## Architecture

### Backend (Express + MongoDB)
- **Port**: 7000 (default)
- **API Prefix**: `/api/v1`
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with HTTP-only cookies and Bearer token fallback

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **API Client**: Fetch API with JWT Bearer tokens
- **Auth State**: React Context (`AuthProvider`)

### Data Models
- **User**: Role-based (doctor, patient, diagnostic_center) with role-specific fields
- **Patient**: Demographics, visits, relationships, medications, allergies
- **Report**: Supports three types - antibiogram, radiology, lab_result

### Authentication Flow
1. User registers/login at `/api/v1/auth/register` or `/api/v1/auth/login`
2. Server returns JWT token (7-day expiry)
3. Client stores token in localStorage and sends Bearer token in Authorization header
4. Middleware (`verifyToken`, `authorize`) handles protected routes

### Key Middleware
- `verifyToken`: Validates JWT from cookie or Authorization header
- `authorize(roles...)`: Role-based access control
- `loadUser`: Populates full user object from database

## Current Implementation Status

Phase 1 and 2 are complete (backend models & auth, frontend auth integration). Phase 3+ work is in progress per IMPLEMENTATION_PLAN.md.

## Development Notes

- Patient dashboard uses nested routes: `/search-patient/patient-dashboard/:id/<section>`
- API URL for auth is hardcoded in authContext as `http://localhost:7000/api/v1/auth`
- Role-based route guards exist in `client/src/components/RouteGuard.tsx`
- Firebase is configured but currently unused (placeholder for future features)