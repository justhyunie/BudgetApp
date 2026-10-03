import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { money } from "../../utils/formatting";

import "../../css/WealthProjection.css";

function ChartTooltip({
  active,
  payload,
  label,
}) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  return (
    <div className="wealth-chart-tooltip">
      <strong>{label}</strong>

      {payload.map((item) => (
        <div
          className="wealth-chart-tooltip-row"
          key={item.dataKey}
        >
          <span>{item.name}</span>

          <strong>
            {money(item.value)}
          </strong>
        </div>
      ))}
    </div>
  );
}

export default function WealthProjection({
  projection,
  year,
  onYearChange,
}) {
  const {
    chartData = [],
    averageIncome = 0,
    averageExpenses = 0,
    expectedMonthlySavings = 0,
    currentNetWorth = 0,
    completedMonths = 0,
  } = projection || {};

  return (
    <section className="panel wealth-projection">
      <div className="panel-header">
        <div>
          <div className="section-kicker">
            Projection
          </div>

          <h2>Net Worth Outlook</h2>

          <p className="wealth-chart-description">
            Projected wealth uses your
            average monthly savings.
          </p>
        </div>

        <div className="wealth-year-nav">
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              onYearChange(year - 1)
            }
            aria-label="Previous year"
          >
            ←
          </button>

          <strong>{year}</strong>

          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              onYearChange(year + 1)
            }
            aria-label="Next year"
          >
            →
          </button>
        </div>
      </div>

      <div className="wealth-projection-stats">
        <div>
          <span>
            Avg. Monthly Income
          </span>

          <strong>
            {money(averageIncome)}
          </strong>
        </div>

        <div>
          <span>
            Avg. Monthly Expenses
          </span>

          <strong>
            {money(averageExpenses)}
          </strong>
        </div>

        <div>
          <span>
            Expected Monthly Savings
          </span>

          <strong
            className={
              expectedMonthlySavings >= 0
                ? "positive"
                : "negative"
            }
          >
            {money(
              expectedMonthlySavings,
            )}
          </strong>
        </div>
      </div>

      {completedMonths === 0 ? (
        <div className="empty-state">
          Add at least one completed
          month of transactions to
          generate a projection.
        </div>
      ) : (
        <>
          <div className="wealth-chart">
            <ResponsiveContainer
              width="100%"
              height={360}
            >
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--line)"
                />

                <XAxis
                  dataKey="label"
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 11,
                  }}
                  axisLine={{
                    stroke:
                      "var(--line-dark)",
                  }}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    money(value)
                  }
                />

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                {/* Projected wealth */}
                <Line
                  type="monotone"
                  dataKey="projectedWealth"
                  name="Projected Wealth"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  strokeDasharray="7 5"
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                />

                {/* Actual wealth */}
                <Line
                  type="monotone"
                  dataKey="actualWealth"
                  name="Actual Wealth"
                  stroke="var(--ink)"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="wealth-chart-legend">
            <span>
              <i className="legend-line projected" />
              Projected wealth
            </span>

            <span>
              <i className="legend-line actual" />
              Actual wealth
            </span>
          </div>

          <div className="wealth-actual-summary">
            <div>
              <span>Current Actual Wealth</span>
              <strong>
                {money(currentNetWorth)}
              </strong>
            </div>

            <div>
              <span>Expected Monthly Savings</span>
              <strong
                className={
                  expectedMonthlySavings >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {money(
                  expectedMonthlySavings,
                )}
              </strong>
            </div>
          </div>
        </>
      )}
    </section>
  );
}