import express from "express";
import {
  getTransactionsByUserId,
  createTransaction,
  deleteTransaction,
  getSummary,
} from "../controllers/transactionsController.js";

const router = express.Router();

// Create a new transaction
router.post("/", createTransaction);

// Get a list of transactions created by the authenticated user
router.get("/user_id/:userId", getTransactionsByUserId);

// Delete a single transaction
router.delete("/:id", deleteTransaction);

// Get user transaction summary
router.get("/summary/user_id/:userId", getSummary);

export default router;
