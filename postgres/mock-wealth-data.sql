-- ============================================================
-- BudgetApp Historical Ledger Seed
-- Source: actual Josh ledger supplied by user
-- Period: January 2, 2026 through September 15, 2026
--
-- IMPORTANT:
-- Removes the previously seeded historical transactions before
-- October 2026, then replaces them with the actual ledger data.
--
-- October 2026 and later transactions are NOT touched.
-- ============================================================


-- ------------------------------------------------------------
-- Remove previous historical seed
-- ------------------------------------------------------------

DELETE FROM transactions
WHERE date < '2026-10-01';


-- ============================================================
-- JANUARY 2026
-- ============================================================

INSERT INTO transactions
    (date, description, amount, category, type)
VALUES
    ('2026-01-02', 'RENT', -1137.68, 'Housing', 'expense'),
    ('2026-01-05', 'DEBT PAYMENT', -2736.14, 'Debt', 'expense'),
    ('2026-01-07', 'PAYMENT', -80.10, 'Payment', 'expense'),
    ('2026-01-15', 'PAYCHECK', 1986.34, 'Income', 'income'),
    ('2026-01-20', 'WORK REHIMBURSTMENT', 126.55, 'Reimbursement', 'income'),
    ('2026-01-20', 'DEBT PAYMENT', -85.63, 'Debt', 'expense'),
    ('2026-01-20', 'PLANET FITNESS', -27.11, 'Fitness', 'expense'),
    ('2026-01-26', 'Zell Payback', -10.00, 'Transfers', 'expense'),
    ('2026-01-30', 'PAYCHECK', 1986.35, 'Income', 'income');


-- ============================================================
-- FEBRUARY 2026
-- ============================================================

INSERT INTO transactions
    (date, description, amount, category, type)
VALUES
    ('2026-02-02', 'RENT', -1143.57, 'Housing', 'expense'),
    ('2026-02-06', 'Zell Payback', -11.00, 'Transfers', 'expense'),
    ('2026-02-13', 'PAYCHECK', 1986.34, 'Income', 'income'),
    ('2026-02-17', 'GIFT', 1300.00, 'Gift', 'income'),
    ('2026-02-17', 'DEBT PAYMENT', -1864.87, 'Debt', 'expense'),
    ('2026-02-17', 'PLANET FITNESS', -27.11, 'Fitness', 'expense'),
    ('2026-02-26', 'Zell Payback', -35.00, 'Transfers', 'expense'),
    ('2026-02-27', 'PAYCHECK', 1986.34, 'Income', 'income');


-- ============================================================
-- MARCH 2026
-- ============================================================

INSERT INTO transactions
    (date, description, amount, category, type)
VALUES
    ('2026-03-03', 'RENT', -1150.92, 'Housing', 'expense'),
    ('2026-03-06', 'IRS  TAX RELEIF', 3.00, 'Other Income', 'income'),
    ('2026-03-13', 'PAYCHECK', 1986.34, 'Income', 'income'),
    ('2026-03-16', 'Zell Payback', -8.70, 'Transfers', 'expense'),
    ('2026-03-16', 'DEBT PAYMENT', -1639.08, 'Debt', 'expense'),
    ('2026-03-17', 'PLANET FITNESS', -27.11, 'Fitness', 'expense'),
    ('2026-03-18', 'WORK REHIMBURSTMENT', 461.75, 'Reimbursement', 'income'),
    ('2026-03-30', 'Zell Payback', -30.00, 'Transfers', 'expense'),
    ('2026-03-31', 'PAYCHECK', 2064.94, 'Income', 'income'),
    ('2026-03-31', 'DEBT PAYMENT', -1791.59, 'Debt', 'expense');


-- ============================================================
-- APRIL 2026
-- ============================================================

INSERT INTO transactions
    (date, description, amount, category, type)
VALUES
    ('2026-04-01', 'RENT', -1156.55, 'Housing', 'expense'),
    ('2026-04-15', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-04-17', 'Zell Payback', -31.26, 'Transfers', 'expense'),
    ('2026-04-17', 'PLANET FITNESS', -27.11, 'Fitness', 'expense'),
    ('2026-04-30', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-04-30', 'WORK REHIMBURSTMENT', 298.46, 'Reimbursement', 'income');


-- ============================================================
-- MAY 2026
-- ============================================================

INSERT INTO transactions
    (date, description, amount, category, type)
VALUES
    ('2026-05-04', 'Zell Payback', -10.00, 'Transfers', 'expense'),
    ('2026-05-04', 'Zell Payback', -21.00, 'Transfers', 'expense'),
    ('2026-05-04', 'RENT', -958.22, 'Housing', 'expense'),
    ('2026-05-06', 'DEBT PAYMENT', -1899.89, 'Debt', 'expense'),
    ('2026-05-14', 'Cash Redemption', 258.98, 'Other Income', 'income'),
    ('2026-05-15', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-05-15', 'Zell Payback', -50.00, 'Transfers', 'expense'),
    ('2026-05-15', 'INVESTMENT TRANSFER', -300.00, 'Investment Transfer', 'expense'),
    ('2026-05-15', 'Zell Payback', -21.00, 'Transfers', 'expense'),
    ('2026-05-18', 'PLANET FITNESS', -27.11, 'Fitness', 'expense'),
    ('2026-05-18', 'DEBT PAYMENT', -29.77, 'Debt', 'expense'),
    ('2026-05-26', 'Zell Payback', -20.00, 'Transfers', 'expense'),
    ('2026-05-29', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-05-29', 'DEBT PAYMENT', -1904.82, 'Debt', 'expense');


-- ============================================================
-- JUNE 2026
-- ============================================================

INSERT INTO transactions
    (date, description, amount, category, type)
VALUES
    ('2026-06-01', 'RENT', -1157.07, 'Housing', 'expense'),
    ('2026-06-08', 'Zell Payback', -20.00, 'Transfers', 'expense'),
    ('2026-06-08', 'Zell Payback', -40.00, 'Transfers', 'expense'),
    ('2026-06-11', 'WORK REHIMBURSTMENT', 377.54, 'Reimbursement', 'income'),
    ('2026-06-15', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-06-15', 'INVESTMENT TRANSFER', -300.00, 'Investment Transfer', 'expense'),
    ('2026-06-16', 'DEBT PAYMENT', -96.21, 'Debt', 'expense'),
    ('2026-06-17', 'PLANET FITNESS', -27.11, 'Fitness', 'expense'),
    ('2026-06-18', 'Zell Payback', -45.00, 'Transfers', 'expense'),
    ('2026-06-22', 'Zell Payback', -9.00, 'Transfers', 'expense'),
    ('2026-06-29', 'DEBT PAYMENT', -2227.65, 'Debt', 'expense'),
    ('2026-06-30', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-06-30', 'WORK REHIMBURSTMENT', 406.18, 'Reimbursement', 'income');


-- ============================================================
-- JULY 2026
-- ============================================================

INSERT INTO transactions
    (date, description, amount, category, type)
VALUES
    ('2026-07-06', 'RENT', -1151.17, 'Housing', 'expense'),
    ('2026-07-15', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-07-15', 'INVESTMENT TRANSFER', -300.00, 'Investment Transfer', 'expense'),
    ('2026-07-17', 'PLANET FITNESS', -27.11, 'Fitness', 'expense'),
    ('2026-07-31', 'PAYCHECK', 2064.94, 'Income', 'income');


-- ============================================================
-- AUGUST 2026
-- ============================================================

INSERT INTO transactions
    (date, description, amount, category, type)
VALUES
    ('2026-08-03', 'DEBT PAYMENT', -2765.23, 'Debt', 'expense'),
    ('2026-08-03', 'RENT', -1152.57, 'Housing', 'expense'),
    ('2026-08-06', 'Zell Payback', -11.00, 'Transfers', 'expense'),
    ('2026-08-14', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-08-17', 'PLANET FITNESS', -27.11, 'Fitness', 'expense'),
    ('2026-08-17', 'INVESTMENT TRANSFER', -300.00, 'Investment Transfer', 'expense'),
    ('2026-08-17', 'DEBT PAYMENT', -71.76, 'Debt', 'expense'),
    ('2026-08-18', 'Zell Payback', -100.00, 'Transfers', 'expense'),
    ('2026-08-26', 'Zell Payback', -35.00, 'Transfers', 'expense'),
    ('2026-08-31', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-08-31', 'Zell Payback', -50.00, 'Transfers', 'expense');


-- ============================================================
-- SEPTEMBER 2026
-- ============================================================

INSERT INTO transactions
    (date, description, amount, category, type)
VALUES
    ('2026-09-01', 'Zell Payback', 50.00, 'Transfers', 'income'),
    ('2026-09-01', 'PAYMENT RECREATION', -63.99, 'Payment', 'expense'),
    ('2026-09-03', 'RENT', -1151.06, 'Housing', 'expense'),
    ('2026-09-14', 'Zell Payback', -36.00, 'Transfers', 'expense'),
    ('2026-09-15', 'PAYCHECK', 2064.93, 'Income', 'income'),
    ('2026-09-15', 'INVESTMENT TRANSFER', -300.00, 'Investment Transfer', 'expense'),
    ('2026-09-15', 'DEBT PAYMENT', -1186.87, 'Debt', 'expense');


-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT
    TO_CHAR(date, 'YYYY-MM') AS month,
    type,
    ROUND(SUM(amount), 2) AS total
FROM transactions
WHERE date < '2026-10-01'
GROUP BY month, type
ORDER BY month, type;