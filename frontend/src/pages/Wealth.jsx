import { useMemo } from "react";

import { api } from "../utils/api";
import { money } from "../utils/formatting";

export default function Wealth({
  accounts,
  setAccounts,
  wealthHistory,
  setWealthHistory,
}) {
  const {
    assets,
    liabilities,
    netWorth,
  } = useMemo(() => {
    const assets = accounts
      .filter(
        (account) =>
          account.type !== "liability",
      )
      .reduce(
        (sum, account) =>
          sum +
          Number(account.balance || 0),
        0,
      );

    const liabilities = accounts
      .filter(
        (account) =>
          account.type === "liability",
      )
      .reduce(
        (sum, account) =>
          sum +
          Math.abs(
            Number(account.balance || 0),
          ),
        0,
      );

    return {
      assets,
      liabilities,
      netWorth: assets - liabilities,
    };
  }, [accounts]);

  async function updateAccount(
    id,
    field,
    value,
  ) {
    try {
      const updated = await api(
        `/api/accounts/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            [field]: value,
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

  async function saveWealthSnapshot() {
    try {
      const snapshot = await api(
        "/api/wealth-history",
        {
          method: "POST",
          body: JSON.stringify({
            value: netWorth,
          }),
        },
      );

      setWealthHistory((current) => [
        snapshot,
        ...current,
      ]);
    } catch (error) {
      console.error(error);
    }
  }

  const assetAccounts = accounts.filter(
    (account) =>
      account.type !== "liability",
  );

  const liabilityAccounts =
    accounts.filter(
      (account) =>
        account.type === "liability",
    );

  return (
    <div className="page wealth-page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Financial Position
          </div>

          <h1>Wealth</h1>

          <p>
            Track your assets, liabilities,
            and overall net worth.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={saveWealthSnapshot}
        >
          Save Snapshot
        </button>
      </header>

      <section className="wealth-overview">
        <div className="wealth-overview-main">
          <div className="section-kicker">
            Net Worth
          </div>

          <div className="wealth-total">
            {money(netWorth)}
          </div>

          <p>
            Total assets minus total
            liabilities.
          </p>
        </div>

        <div className="wealth-stat-grid">
          <div className="wealth-stat">
            <span>Assets</span>
            <strong>
              {money(assets)}
            </strong>
          </div>

          <div className="wealth-stat">
            <span>Liabilities</span>
            <strong>
              {money(liabilities)}
            </strong>
          </div>
        </div>
      </section>

      <div className="wealth-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                What You Own
              </div>

              <h2>Assets</h2>
            </div>

            <strong>
              {money(assets)}
            </strong>
          </div>

          <div className="wealth-account-list">
            {assetAccounts.length === 0 ? (
              <div className="empty-state">
                No assets yet.
              </div>
            ) : (
              assetAccounts.map((account) => (
                <div
                  className="wealth-account"
                  key={account.id}
                >
                  <div className="wealth-account-info">
                    <strong>
                      {account.name}
                    </strong>

                    <span>
                      {account.type ||
                        "Asset"}
                    </span>
                  </div>

                  <div className="wealth-account-value">
                    {money(
                      account.balance,
                    )}
                  </div>

                  <input
                    className="wealth-account-input"
                    type="number"
                    step="0.01"
                    value={
                      account.balance ?? ""
                    }
                    onChange={(event) =>
                      updateAccount(
                        account.id,
                        "balance",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    aria-label={`${account.name} balance`}
                  />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                What You Owe
              </div>

              <h2>Liabilities</h2>
            </div>

            <strong>
              {money(liabilities)}
            </strong>
          </div>

          <div className="wealth-account-list">
            {liabilityAccounts.length === 0 ? (
              <div className="empty-state">
                No liabilities yet.
              </div>
            ) : (
              liabilityAccounts.map(
                (account) => (
                  <div
                    className="wealth-account"
                    key={account.id}
                  >
                    <div className="wealth-account-info">
                      <strong>
                        {account.name}
                      </strong>

                      <span>
                        Liability
                      </span>
                    </div>

                    <div className="wealth-account-value liability">
                      {money(
                        account.balance,
                      )}
                    </div>

                    <input
                      className="wealth-account-input"
                      type="number"
                      step="0.01"
                      value={
                        account.balance ?? ""
                      }
                      onChange={(event) =>
                        updateAccount(
                          account.id,
                          "balance",
                          Number(
                            event.target
                              .value,
                          ),
                        )
                      }
                      aria-label={`${account.name} balance`}
                    />
                  </div>
                ),
              )
            )}
          </div>
        </section>
      </div>

      <section className="panel wealth-history-panel">
        <div className="panel-header">
          <div>
            <div className="section-kicker">
              Progress
            </div>

            <h2>Wealth History</h2>
          </div>
        </div>

        <div className="wealth-history-list">
          {wealthHistory.length === 0 ? (
            <div className="empty-state">
              No snapshots recorded yet.
            </div>
          ) : (
            wealthHistory.map((snapshot) => (
              <div
                className="wealth-history-item"
                key={snapshot.id}
              >
                <div>
                  <strong>
                    {money(snapshot.value)}
                  </strong>

                  <span>
                    {snapshot.date ||
                      snapshot.created_at ||
                      ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}