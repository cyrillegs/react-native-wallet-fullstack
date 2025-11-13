import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import transactionRoutes from "./routes/transactionsRoutes.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();

// cron job
if (process.env.NODE_ENV === "production") {
  job.start();
}

// middleware
app.use(rateLimiter);
app.use(express.json());

// api routes
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5001;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

console.log("my port: ", PORT);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  });
});
