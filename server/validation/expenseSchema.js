const { z } = require('zod');

// Expense validation schema
const expenseSchema = z.object({
  category: z.string()
    .min(2, { message: 'Category must be at least 2 characters long' })
    .max(50, { message: 'Category cannot exceed 50 characters' }),
  
  amount: z.number()
    .positive({ message: 'Amount must be a positive number' })
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
  
  date: z.string()
    .datetime({ message: 'Invalid date format' })
    .or(z.date())
    .transform(val => new Date(val)),
  
  note: z.string()
    .max(500, { message: 'Note cannot exceed 500 characters' })
    .optional()
    .nullable()
});

// Schema for updating an expense
const updateExpenseSchema = expenseSchema.partial();

module.exports = {
  expenseSchema,
  updateExpenseSchema
}; 