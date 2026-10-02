import { money } from "../../utils/formatting";

export default function SummaryCards({
  income,
  expenses,
  budget,
}) {
  const cards = [
    {
      label: "Income",
      value: money(income),
      className: "amount-positive",
    },
    {
      label: "Expenses",
      value: money(expenses),
      className: "amount-negative",
    },
    {
      label: "Budget",
      value: money(budget),
      className: "",
    },
  ];

  return (
    <section className="summary-grid">
      {cards.map((card) => (
        <div className="summary-card" key={card.label}>
          <span>{card.label}</span>
          <strong className={card.className}>
            {card.value}
          </strong>
        </div>
      ))}
    </section>
  );
}