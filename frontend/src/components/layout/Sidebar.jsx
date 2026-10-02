const ITEMS = [
  ["dashboard", "Dashboard", "⌂"],
  ["transactions", "Transactions", "↔"],
  ["budgets", "Budgets", "◫"],
  ["wealth", "Wealth", "◆"],
  ["settings", "Settings", "⚙"],
];

export default function Sidebar({
  activePage,
  setActivePage,
  lock,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">B</div>

        <div>
          <strong>Budget App</strong>

          <span className="sidebar-label">
            Personal Finance
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {ITEMS.map(([page, label, icon]) => (
          <button
            key={page}
            className={`nav-item ${
              activePage === page ? "active" : ""
            }`}
            onClick={() => setActivePage(page)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-lock">
        <button
          className="lock-button"
          onClick={lock}
        >
          🔒 Lock
        </button>
      </div>
    </aside>
  );
}