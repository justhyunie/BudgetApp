const ITEMS = [
  ["dashboard", "Home", "⌂"],
  ["transactions", "Transactions", "↔"],
  ["budgets", "Budgets", "◫"],
  ["wealth", "Wealth", "◆"],
];

export default function MobileNav({
  activePage,
  setActivePage,
}) {
  return (
    <nav className="mobile-nav">
      {ITEMS.map(([page, label, icon]) => (
        <button
          key={page}
          className={`mobile-nav-item ${
            activePage === page ? "active" : ""
          }`}
          onClick={() => setActivePage(page)}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}