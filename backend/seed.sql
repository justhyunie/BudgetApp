INSERT INTO budgets (category, amount)
VALUES
    ('Housing', 1150.00),
    ('Food', 400.00),
    ('Transportation', 200.00),
    ('Utilities', 200.00),
    ('Entertainment', 150.00),
    ('Shopping', 200.00),
    ('Health', 100.00),
    ('Subscriptions', 100.00),
    ('Debt', 200.00),
    ('Other', 100.00)
ON CONFLICT (category) DO NOTHING;


INSERT INTO accounts (name, type, balance)
VALUES
    ('Checking', 'asset', 0.00),
    ('Savings', 'asset', 0.00),
    ('401(k)', 'asset', 0.00),
    ('Roth IRA', 'asset', 0.00),
    ('Student Loans', 'liability', 0.00)
ON CONFLICT (name) DO NOTHING;


INSERT INTO transactions (date, description, amount, category)
SELECT
    '2026-10-01',
    'Paycheck',
    4129.88,
    'Income'
WHERE NOT EXISTS (
    SELECT 1
    FROM transactions
    WHERE date = '2026-10-01'
      AND description = 'Paycheck'
      AND amount = 4129.88
);