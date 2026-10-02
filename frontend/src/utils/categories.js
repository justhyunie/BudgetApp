export const DEFAULT_CATEGORIES = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Subscriptions",
  "Debt",
  "Other",
];

export const CATEGORY_ICONS = {
  Housing: "🏠",
  Food: "🍴",
  Transportation: "🚗",
  Utilities: "💡",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Health: "❤️",
  Subscriptions: "📱",
  Debt: "💳",
  Other: "📦",
  Income: "💰",
};

export function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function getCategoriesFromBudgets(budgets) {
  const categories = normalizeArray(budgets)
    .map((budget) => budget.category)
    .filter(Boolean);

  return [...new Set([...DEFAULT_CATEGORIES, ...categories])];
}

export function categoryIcon(category) {
  return CATEGORY_ICONS[category] || "📦";
}