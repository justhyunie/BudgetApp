
import { money } from "../../utils/formatting";

export default function SummaryCards({
  income = 0,
  expenses = 0,
  net = 0,
}) {
  return (
    <section className="summary-grid">
      <div className="summary-card">
        <span className="summary-label">
          Income
        </span>

        <strong className="summary-value">
          {money(income)}
        </strong>
      </div>

      <div className="summary-card">
        <span className="summary-label">
          Expenses
        </span>

        <strong className="summary-value">
          {money(expenses)}
        </strong>
      </div>

      <div className="summary-card">
        <span className="summary-label">
          Net
        </span>

        <strong className="summary-value">
          {money(net)}
        </strong>
      </div>
    </section>
  );
}
