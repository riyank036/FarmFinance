# FarmFinance Admin Scripts

This directory contains utility scripts for administration of the FarmFinance application.

## Creating or Promoting Admin Users

To create a new admin user or promote an existing user to admin role, use the `createAdmin.js` script.

### Create a new admin user

```bash
node createAdmin.js create admin@example.com StrongPassword123!
```

This will:
1. Create a new user with the provided email and password
2. Set the role to 'admin'
3. Mark the account as active and email verified

### Promote an existing user to admin

```bash
node createAdmin.js promote existing@example.com
```

This will:
1. Find the user with the specified email
2. Update their role to 'admin'

## Environment Setup

Make sure you have a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret
```

## Admin API Endpoints

Once you have admin access, you can use the following API endpoints:

### Users
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get a specific user
- `PUT /api/admin/users/:id` - Update a user
- `DELETE /api/admin/users/:id` - Delete a user

### Finances
- `GET /api/admin/expenses` - Get all expenses
- `DELETE /api/admin/expenses/:id` - Delete an expense
- `GET /api/admin/income` - Get all income
- `DELETE /api/admin/income/:id` - Delete an income record

### System
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/settings` - Get all system settings
- `PUT /api/admin/settings` - Update system settings 