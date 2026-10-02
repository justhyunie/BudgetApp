import { useMemo } from "react";
import { api } from "../utils/api";
import { money, shortMoney } from "../utils/formatting";

export default function Wealth({
  accounts,
  setAccounts,
  wealthHistory,
  setWealthHistory,
}) {
  const assets = useMemo(
    () =>
      accounts
        .filter(
          (account) =>
            account.type !== "liability" &&
            account.type !== "debt",
        )
        .reduce(
          (total, account) =>
            total + Number(account.balance || 0),
          0,
        ),
    [accounts],
  );

  const liabilities = useMemo(
    () =>
      accounts
        .filter(
          (account) =>
            account.type === "liability" ||
            account.type === "debt",
        )
        .reduce(
          (total, account) =>
            total + Number(account.balance || 0),
          0,
        ),
    [accounts],
  );

  const netWorth = assets - liabilities;

  async function updateAccount(id, balance) {
    try {
      const updated = await api(
        `/api/accounts/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            balance: Number(balance),
          }),
        },
      );

      setAccounts((current) =>
        current.map((account) =>
          account.id === id
            ? updated
            : account,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function saveSnapshot() {
    try {
      const snapshot = await api(
        "/api/wealth-history",
        {
          method: "POST",
          body: JSON.stringify({
            net_worth: netWorth,
            assets,
            liabilities,
          }),
        },
      );

      setWealthHistory((current) => [
        ...current,
        snapshot,
      ]);
    } catch (error) {
      console.error(error);
    }
  }

  const assetAccounts = accounts.filter(
    (account) =>
      account.type !== "liability" &&
      account.type !== "debt",
  );

  const liabilityAccounts =
    accounts.filter(
      (account) =>
        account.type === "liability" ||
        account.type === "debt",
    );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Long-Term Finances
          </div>

          <h1>Wealth</h1>

          <p>
            Track your assets, liabilities, and
            overall net worth.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={saveSnapshot}
        >
          Save Snapshot
        </button>
      </header>

      <section className="wealth-hero">
        <div>
          <span>Net Worth</span>

          <strong>{money(netWorth)}</strong>

          <small>
            {money(assets)} in assets ·{" "}
            {money(liabilities)} in liabilities
          </small>
        </div>

        <div className="wealth-breakdown">
          <div>
            <span>Assets</span>
            <strong>
              {shortMoney(assets)}
            </strong>
          </div>

          <div>
            <span>Liabilities</span>
            <strong>
              {shortMoney(liabilities)}
            </strong>
          </div>
        </div>
      </section>

      <section className="equity-bar">
        <div
          className="equity-bar-assets"
          style={{
            width:
              assets + liabilities > 0
                ? `${Math.min(
                    100,
                    (assets /
                      (assets +
                        liabilities)) *
                      100,
                  )}%`
                : "0%",
          }}
        />
      </section>

      <div className="wealth-account-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Assets</h2>

              <p>
                Accounts that contribute to your
                net worth.
              </p>
            </div>
          </div>

          {assetAccounts.length === 0 ? (
            <div className="empty-state">
              No asset accounts found.
            </div>
          ) : (
            <div className="wealth-account-list">
              {assetAccounts.map(
                (account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    onSave={updateAccount}
                  />
                ),
              )}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Liabilities</h2>

              <p>
                Debts and other amounts owed.
              </p>
            </div>
          </div>

          {liabilityAccounts.length === 0 ? (
            <div className="empty-state">
              No liabilities found.
            </div>
          ) : (
            <div className="wealth-account-list">
              {liabilityAccounts.map(
                (account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    liability
                    onSave={updateAccount}
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Wealth History</h2>

            <p>
              Track how your net worth changes over
              time.
            </p>
          </div>
        </div>

        {wealthHistory.length === 0 ? (
          <div className="empty-state">
            No wealth snapshots yet.
          </div>
        ) : (
          <div className="wealth-history-list">
            {[...wealthHistory]
              .reverse()
              .map((snapshot, index) => (
                <div
                  className="wealth-history-row"
                  key={
                    snapshot.id ??
                    `${snapshot.date}-${index}`
                  }
                >
                  <div>
                    <strong>
                      {snapshot.date
                        ? new Date(
                            snapshot.date,
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "Snapshot"}
                    </strong>
                  </div>

                  <strong>
                    {money(
                      snapshot.net_worth ??
                        snapshot.netWorth ??
                        0,
                    )}
                  </strong>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AccountRow({
  account,
  liability = false,
  onSave,
}) {
  return (
    <div className="wealth-account-row">
      <div className="wealth-account-info">
        <strong>
          {account.name ||
            account.account_name ||
            "Account"}
        </strong>

        <span>
          {account.institution ||
            account.type ||
            ""}
        </span>
      </div>

      <input
        className="wealth-account-input"
        type="number"
        step="0.01"
        defaultValue={account.balance || 0}
        onBlur={(event) =>
          onSave(
            account.id,
            event.target.value,
          )
        }
      />

      <strong
        className={
          liability
            ? "amount-negative"
            : "amount-positive"
        }
      >
        {money(account.balance)}
      </strong>
    </div>
  );
}