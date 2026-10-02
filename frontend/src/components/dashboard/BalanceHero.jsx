import { money } from "../../utils/formatting";

export default function BalanceHero({
  income = 0,
  expenses = 0,
  net = 0,
}) {
  const netClass = net >= 0 ? "positive" : "negative";

  return (
    <section className="balance-hero">
      <div>
        <div className="eyebrow">
          Net Position
        </div>

        <div className={`hero-number ${netClass}`}>
          {money(net)}
        </div>

        <p className="hero-caption">
          Income minus expenses
        </p>
      </div>

      <div className="hero-side">
        <div>
          <span>Income</span>
          <strong className="positive">
            {money(income)}
          </strong>
        </div>

        <div>
          <span>Expenses</span>
          <strong className="negative">
            {money(expenses)}
          </strong>
        </div>
      </div>
    </section>
  );
}