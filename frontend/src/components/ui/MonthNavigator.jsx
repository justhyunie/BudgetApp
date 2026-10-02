import { formatMonth } from "../../utils/formatting";

export default function MonthNavigator({
  value,
  onChange,
}) {
  function changeMonth(offset) {
    const date = new Date(`${value}-01T00:00:00`);

    date.setMonth(date.getMonth() + offset);

    onChange(
      `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`,
    );
  }

  return (
    <div className="month-nav">
      <button
        className="month-nav-button"
        onClick={() => changeMonth(-1)}
        type="button"
        aria-label="Previous month"
      >
        ‹
      </button>

      <strong>{formatMonth(value)}</strong>

      <button
        className="month-nav-button"
        onClick={() => changeMonth(1)}
        type="button"
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}