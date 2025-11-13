// react custom hook file

import { useCallback, useState } from "react";
import { Alert } from "react-native";

const API_URL = "http://react-native-wallet-api.cyrildavelegaspi.online/api";

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // useCallback is used for performance reasons, it will memoize the function
  const fetchTransactions = useCallback(async () => {
    console.log("🔄 Fetching transactions for user:", userId);

    try {
      const response = await fetch(`${API_URL}/transactions/user_id/${userId}`);
      const data = await response.json();
      console.log("✅ Transactions fetched:", data);

      setTransactions(data);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    console.log("🔄 Fetching summary for user:", userId);

    try {
      const response = await fetch(
        `${API_URL}/transactions/summary/user_id/${userId}`
      );
      const data = await response.json();
      console.log("✅ Summary fetched:", data);

      setSummary(data);
    } catch (error) {
      console.error("❌ Error fetching summary:", error);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    console.log("📦 Loading all data...");

    if (!userId) {
      console.warn("⚠️ No userId provided. Skipping data load.");
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all([fetchTransactions(), fetchSummary()]);
      console.log("✅ Data loaded successfully.");
    } catch (error) {
      console.error("❌ Error loading data:", error);
    } finally {
      setIsLoading(false);
      console.log("⏳ Loading state set to false.");
    }
  }, [fetchTransactions, fetchSummary, userId]);

  const deleteTransaction = async (id) => {
    console.log("🗑️ Deleting transaction:", id);

    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete transaction");

      console.log("✅ Transaction deleted. Reloading data...");
      await loadData();
      Alert.alert("Success", "Transaction deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting transaction:", error);
      Alert.alert("Error", error.message);
    }
  };

  return { transactions, summary, isLoading, loadData, deleteTransaction };
};
