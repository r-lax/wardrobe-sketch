# Wardrobe Sketch – CS348 Project
This project is a full-stack web application developed for CS348.
Users can create, edit, delete, and filter fashion sketches stored in a MongoDB database.

## Tech Stack
- Frontend: React
- Backend: Node.js, Express
- Database: MongoDB (Mongoose ODM)

## Features
- Create, edit, and delete sketches
- Dynamic filtering by category, color, and style
- Indexes to optimize report queries
- MongoDB transactions for atomic operations
- Protection against injection attacks via Mongoose query parameterization

## Project Structure
- /client – React frontend
- /server – Express + MongoDB backend

## Running Locally

### Backend
```bash
cd server
npm install
npm start
