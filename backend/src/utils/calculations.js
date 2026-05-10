export const calculateExpenseTotals = ({
  quantity = 1,
  unitCost,
  taxPercent = 0,
  discount = 0,
}) => {
  const safeQuantity = Number(quantity || 1);
  const safeUnitCost = Number(unitCost || 0);
  const safeTaxPercent = Number(taxPercent || 0);
  const safeDiscount = Number(discount || 0);
  const totalCost = safeQuantity * safeUnitCost;
  const taxAmount = totalCost * (safeTaxPercent / 100);
  const grandTotal = totalCost + taxAmount - safeDiscount;

  return {
    quantity: safeQuantity,
    unitCost: safeUnitCost,
    taxPercent: safeTaxPercent,
    discount: safeDiscount,
    totalCost,
    grandTotal,
  };
};

export const summarizeExpenses = (expenses) => {
  return expenses.reduce(
    (summary, expense) => {
      const category = expense.category;
      const amount = Number(expense.grandTotal || 0);

      summary.totalSpent += amount;
      summary[expense.isPaid ? "paidTotal" : "unpaidTotal"] += amount;
      summary.categoryTotals[category] =
        (summary.categoryTotals[category] || 0) + amount;

      return summary;
    },
    {
      totalSpent: 0,
      paidTotal: 0,
      unpaidTotal: 0,
      categoryTotals: {},
    }
  );
};
