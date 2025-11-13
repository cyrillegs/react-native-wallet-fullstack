import { sql } from "../config/db.js";

// Get All Transaction By User Id
export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const transactions =
      await sql`SELECT * FROM transactions WHERE user_id = ${userId}`;
    if (transactions.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.send(500).json({ message: "Internal server errorsss!" });
  }
}

// Create transactions
export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !amount || !category || user_id === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = await sql`
                INSERT INTO transactions(user_id, title, amount, category)
                VALUES (${user_id}, ${title}, ${amount}, ${category})
                RETURNING *
            `;

    console.log("Transaction created: ", transaction);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.error("Errro creating transaction: ", error);
    res.status(500).json({ message: "Internal server errorsss!" });
  }
}

// Delete transaction
export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId)) {
      return res.status(400).json({ message: "Invalid transaction ID!" });
    } else {
      const transaction =
        await sql`SELECT * FROM transactions WHERE id = ${id}`;
      if (transaction.length === 0) {
        return res
          .status(404)
          .json({ message: "Transaction not found to delete!" });
      } else {
        await sql`
            DELETE FROM transactions WHERE id = ${id};
        `;
        return res
          .status(200)
          .json({ message: "Transaction deleted successfully!" });
      }
    }
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.send(500).json({ message: "Internal server error!" });
  }
}

// Get user transaction summary
export async function getSummary(req, res) {
  try {
    const { userId } = req.params;
    const result = await sql`
        SELECT
            COALESCE(SUM(amount), 0) AS balance,
            COALESCE(SUM(CASE WHEN amount > 0 THEN amount END), 0) AS income,
            COALESCE(SUM(CASE WHEN amount < 0 THEN amount END), 0) AS debt
        FROM transactions
        WHERE user_id = ${userId};
    `;

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.send(500).json({ message: "Internal server errorsss!" });
  }
}
