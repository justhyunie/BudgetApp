import PageHeader from "../components/ui/PageHeader";
import BudgetList from "../components/budget/BudgetList";
import AddBudgetForm from "../components/budget/AddBudgetForm";

export default function Budget({
  budgets,
  setBudgets,
  openBudgetModal,
}) {
  function addBudget(budget) {
    setBudgets((current) => [
      ...current,
      budget,
    ]);
  }

  return (
    <div className="page budget-page">
      <PageHeader
        kicker="Planning"
        title="Budgets"
        description="Set monthly spending limits and keep your spending on track."
        action={
          <button
            className="primary-button"
            type="button"
            onClick={openBudgetModal}
          >
            + Add Budget
          </button>
        }
      />

      <div className="budget-page-grid">
        <section className="panel budget-editor">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                Monthly Plan
              </div>

              <h2>Budget Categories</h2>

              <p>
                Update your monthly limits directly.
              </p>
            </div>
          </div>

          <BudgetList
            budgets={budgets}
            setBudgets={setBudgets}
          />
        </section>

        <section className="panel add-budget-panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                Planning
              </div>

              <h2>Quick Add</h2>

              <p>
                Create a new monthly budget.
              </p>
            </div>
          </div>

          <AddBudgetForm onAdded={addBudget} />
        </section>
      </div>
    </div>
  );
}