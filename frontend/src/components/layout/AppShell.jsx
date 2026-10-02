import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({
  activePage,
  setActivePage,
  lock,
  appError,
  retry,
  children,
}) {
  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        lock={lock}
      />

      <main className="main">
        {appError && (
          <div className="error-banner">
            {appError}

            <button
              className="text-button"
              onClick={retry}
            >
              Retry
            </button>
          </div>
        )}

        {children}

        <MobileNav
          activePage={activePage}
          setActivePage={setActivePage}
        />
      </main>
    </div>
  );
}