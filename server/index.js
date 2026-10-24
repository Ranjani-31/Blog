
require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dns = require("dns");

const connectDb = require("./config/db");
const AppError = require("./utils/AppError");
const errorMiddleware = require("./middlewares/error.middleware");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8"]);

const app = express();

app.use(
  cors({
     origin: [
      "http://localhost:5173",
      "https://blog-omega-three-63.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Register application routes
app.use("/", require("./routes"));

// Handle unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Centralized error handler — must come last
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
