import BudgetRow from "./BudgetRow";

export default function BudgetList({
  budgets,
  setBudgets,
}) {
  if (budgets.length === 0) {
    return (
      <div className="empty-state">
        No budgets created yet.
      </div>
    );
  }

  function handleUpdated(updatedBudget) {
    setBudgets((current) =>
      current.map((budget) =>
        budget.id === updatedBudget.id
          ? updatedBudget
          : budget,
      ),
    );
  }

  function handleDeleted(id) {
    setBudgets((current) =>
      current.filter(
        (budget) => budget.id !== id,
      ),
    );
  }

  return (
    <div className="budget-list">
      {budgets.map((budget) => (
        <BudgetRow
          key={budget.id}
          budget={budget}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}