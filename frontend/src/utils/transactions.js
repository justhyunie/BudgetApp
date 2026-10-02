export function getTransactionType(transaction) {
  return String(transaction?.type || "expense").toLowerCase();
}

export function isIncome(transaction) {
  return getTransactionType(transaction) === "income";
}

export function isExpense(transaction) {
  return getTransactionType(transaction) === "expense";
}

export function transactionAmount(transaction) {
  return Math.abs(Number(transaction?.amount) || 0);
}

export function signedTransactionAmount(transaction) {
  const amount = transactionAmount(transaction);

  return isIncome(transaction)
    ? amount
    : -amount;
}