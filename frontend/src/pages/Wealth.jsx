import {
  useMemo,
  useState,
} from "react";

import { api } from "../utils/api";
import { money } from "../utils/formatting";

import {
  calculateWealthProjection,
} from "../utils/wealth";

import WealthAccounts from "../components/wealth/WealthAccounts";
import WealthProjection from "../components/wealth/WealthProjection";

export default function Wealth({
  accounts,
  setAccounts,
  wealthHistory,
  setWealthHistory,
  transactions,
}) {
  const currentYear =
    new Date().getFullYear();

  const [
    projectionYear,
    setProjectionYear,
  ] = useState(currentYear);

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
          Math.abs(
            Number(account.balance) || 0,
          ),
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
            Number(account.balance) || 0,
          ),
        0,
      );

    return {
      assets,
      liabilities,
      netWorth:
        assets - liabilities,
    };
  }, [accounts]);

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

  const projection = useMemo(
    () =>
      calculateWealthProjection({
        transactions,
        wealthHistory,
        currentNetWorth: netWorth,
        year: projectionYear,
      }),
    [
      transactions,
      wealthHistory,
      netWorth,
      projectionYear,
    ],
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

      <WealthAccounts
        accounts={accounts}
        setAccounts={setAccounts}
      />

      <WealthProjection
        projection={projection}
        year={projectionYear}
        onYearChange={setProjectionYear}
      />

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