const { z } = require('zod');

// Income validation schema
const incomeSchema = z.object({
  product: z.string()
    .min(2, { message: 'Product name must be at least 2 characters long' })
    .max(50, { message: 'Product name cannot exceed 50 characters' }),
  
  quantity: z.number()
    .positive({ message: 'Quantity must be a positive number' })
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
  
  ratePerUnit: z.number()
    .positive({ message: 'Rate per unit must be a positive number' })
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
  
  totalAmount: z.number()
    .positive({ message: 'Total amount must be a positive number' })
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
  
  date: z.string()
    .datetime({ message: 'Invalid date format' })
    .or(z.date())
    .transform(val => new Date(val)),
  
  note: z.string()
    .max(500, { message: 'Note cannot exceed 500 characters' })
    .optional()
    .nullable(),
    
  isManualTotal: z.boolean().optional().default(false)
});

// Schema for updating an income
const updateIncomeSchema = incomeSchema.partial();

module.exports = {
  incomeSchema,
  updateIncomeSchema
}; 