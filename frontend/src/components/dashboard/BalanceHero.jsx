export default function BalanceHero({
  net,
  income,
  expenses,
}) {
  return (
    <section className="balance-hero">
      <div>
        <span className="section-kicker">
          Monthly Balance
        </span>

        <strong>
          {net >= 0 ? "+" : "-"}$
          {Math.abs(net).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </strong>

        <p>
          {income.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}{" "}
          income ·{" "}
          {expenses.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}{" "}
          expenses
        </p>
      </div>
    </section>
  );
}