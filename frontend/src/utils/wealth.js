function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getTransactionType(transaction) {
  return String(transaction?.type || "expense")
    .trim()
    .toLowerCase();
}

function getTransactionAmount(transaction) {
  return Math.abs(
    toNumber(transaction?.amount),
  );
}

function getMonthKey(date) {
  const value = String(date || "");

  if (!/^\d{4}-\d{2}/.test(value)) {
    return null;
  }

  return value.substring(0, 7);
}

function formatMonth(monthKey) {
  const [year, month] = monthKey
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    1,
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
    },
  );
}

function addMonths(monthKey, amount) {
  const [year, month] = monthKey
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1 + amount,
    1,
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function getMonthsBetween(
  startMonth,
  endMonth,
) {
  const months = [];

  let current = startMonth;

  while (current <= endMonth) {
    months.push(current);

    current = addMonths(
      current,
      1,
    );
  }

  return months;
}

function getMonthDifference(
  startMonth,
  endMonth,
) {
  const [startYear, startMonthNumber] =
    startMonth.split("-").map(Number);

  const [endYear, endMonthNumber] =
    endMonth.split("-").map(Number);

  return (
    (endYear - startYear) * 12 +
    (endMonthNumber - startMonthNumber)
  );
}

export function calculateWealthProjection({
  transactions = [],
  wealthHistory = [],
  currentNetWorth = 0,
  year = new Date().getFullYear(),
}) {
  const currentMonth = getCurrentMonth();
  const currentYear =
    new Date().getFullYear();

  /*
   * Build monthly income and expense totals.
   */
  const monthlyTotals = {};

  transactions.forEach(
    (transaction) => {
      const month = getMonthKey(
        transaction.date,
      );

      if (!month) {
        return;
      }

      if (!monthlyTotals[month]) {
        monthlyTotals[month] = {
          income: 0,
          expenses: 0,
        };
      }

      const amount =
        getTransactionAmount(
          transaction,
        );

      const type =
        getTransactionType(
          transaction,
        );

      if (type === "income") {
        monthlyTotals[month].income +=
          amount;
      } else {
        monthlyTotals[month].expenses +=
          amount;
      }
    },
  );

  /*
   * Completed months are used for the
   * historical average.
   *
   * The current month is excluded because
   * it is still in progress.
   */
  const completedMonths =
    Object.keys(monthlyTotals)
      .filter(
        (month) =>
          month < currentMonth,
      )
      .sort();

  let averageIncome = 0;
  let averageExpenses = 0;

  if (
    completedMonths.length > 0
  ) {
    const totals =
      completedMonths.reduce(
        (result, month) => {
          result.income +=
            monthlyTotals[month]
              .income;

          result.expenses +=
            monthlyTotals[month]
              .expenses;

          return result;
        },
        {
          income: 0,
          expenses: 0,
        },
      );

    averageIncome =
      totals.income /
      completedMonths.length;

    averageExpenses =
      totals.expenses /
      completedMonths.length;
  }

  /*
   * Expected monthly savings:
   *
   * average income
   * -
   * average expenses
   */
  const expectedMonthlySavings =
    averageIncome -
    averageExpenses;

  /*
   * Wealth snapshots are real net-worth
   * anchors when available.
   */
  const actualSnapshots = {};

  wealthHistory.forEach(
    (snapshot) => {
      const date =
        snapshot.date ||
        snapshot.created_at;

      const month =
        getMonthKey(date);

      if (!month) {
        return;
      }

      actualSnapshots[month] =
        toNumber(snapshot.value);
    },
  );

  const months =
    getMonthsBetween(
      `${year}-01`,
      `${year}-12`,
    );

  /*
   * ------------------------------------------------
   * PROJECTED WEALTH
   * ------------------------------------------------
   *
   * Current actual net worth is the starting
   * point.
   *
   * Every month after the current month adds
   * the expected monthly savings.
   */
  function getProjectedWealth(month) {
    const monthsFromCurrent =
      getMonthDifference(
        currentMonth,
        month,
      );

    return (
      toNumber(currentNetWorth) +
      expectedMonthlySavings *
        monthsFromCurrent
    );
  }

  /*
   * ------------------------------------------------
   * ACTUAL WEALTH
   * ------------------------------------------------
   *
   * We use the current actual net worth as
   * the anchor and reconstruct historical
   * wealth using actual monthly savings.
   *
   * Example:
   *
   * Current wealth = $30,000
   * September savings = $1,800
   *
   * September actual wealth =
   * $30,000 - October savings
   * - September savings
   *
   * A real wealth snapshot overrides the
   * reconstructed value whenever one exists.
   */
  function getActualWealth(month) {
    /*
     * If we have an actual snapshot for
     * this month, use it directly.
     */
    if (
      actualSnapshots[month] !==
      undefined
    ) {
      return actualSnapshots[month];
    }

    /*
     * Current month is anchored directly
     * to the current account/net-worth total.
     */
    if (month === currentMonth) {
      return toNumber(currentNetWorth);
    }

    /*
     * Future months cannot be actual wealth
     * because they have not happened yet.
     */
    if (month > currentMonth) {
      return null;
    }

    /*
     * Walk forward from the historical month
     * toward the current month and subtract
     * actual savings to reconstruct the
     * historical wealth.
     *
     * We use completed months only.
     */
    let wealth =
      toNumber(currentNetWorth);

    let cursor =
      addMonths(month, 1);

    while (
      cursor <= currentMonth
    ) {
      const totals =
        monthlyTotals[cursor] || {
          income: 0,
          expenses: 0,
        };

      const actualSavings =
        totals.income -
        totals.expenses;

      wealth -= actualSavings;

      cursor = addMonths(
        cursor,
        1,
      );
    }

    return wealth;
  }

  const chartData =
    months.map((month) => {
      const monthly =
        monthlyTotals[month] || {
          income: 0,
          expenses: 0,
        };

      const isFuture =
        month > currentMonth;

      const isCurrentMonth =
        month === currentMonth;

      const actualSavings =
        monthly.income -
        monthly.expenses;

      return {
        month,

        label: formatMonth(month),

        /*
         * Projected wealth exists for every
         * month in the selected year.
         */
        projectedWealth:
          getProjectedWealth(month),

        /*
         * Actual wealth only exists through
         * the current month.
         */
        actualWealth:
          isFuture
            ? null
            : getActualWealth(month),

        /*
         * These remain available for the
         * tooltip / future UI.
         */
        actualIncome:
          monthly.income,

        actualExpenses:
          monthly.expenses,

        actualSavings,

        isCurrentMonth,
      };
    });

  return {
    chartData,

    averageIncome,

    averageExpenses,

    expectedMonthlySavings,

    completedMonths:
      completedMonths.length,

    currentNetWorth:
      toNumber(currentNetWorth),

    year,

    currentYear,

    currentMonth,
  };
}