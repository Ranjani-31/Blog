const posts = [
  {
    id: "1",
    title: "How I Built a Real-Time Chat Application",
    excerpt:
      "Exploring WebSockets, message delivery, and conversation models.",
    date: "2026-10-10",
    readTime: "8 min read",
    slug: "building-real-time-chat",
    content: `
## Introduction

I wanted to understand how real-time messaging works
and how to structure a chat application.

## The architecture

The application has three main parts:

- React frontend
- Node.js and Express backend
- MongoDB database

Socket.IO handles real-time communication between
connected clients and the server.

## Connecting to the server

Here is a simple example of connecting a client.

\`\`\`javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});
\`\`\`

## What I learned

I learned that real-time communication and message
persistence are separate responsibilities.

A socket can deliver a message instantly, while the
database provides durable storage for later retrieval.

## Conclusion

Building this project helped me understand how
frontend state, backend events, and database
persistence work together.
`,
  },
];

export default posts;