# FarmFinance

FarmFinance is a comprehensive financial management application designed specifically for farm operations. It helps farmers track income, expenses, and monitor overall financial health of their agricultural business.

## Features

- **User Authentication**: Secure login and registration system
- **Dashboard**: Visual overview of financial status with charts and statistics
- **Expense Tracking**: Log and categorize farm expenses
- **Income Management**: Record various income sources
- **Monthly Reports**: Generate detailed monthly financial reports
- **Administrative Panel**: For system administrators 
- **User Profiles**: Personalize your account and settings
- **Multi-language Support**: Interface available in multiple languages

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Recharts (for data visualization)
- React Router (for navigation)
- i18next (for internationalization)
- Axios (for API requests)

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for authentication
- Bcrypt for password hashing
- Zod for validation

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/riyank036/FarmFinance.git
cd FarmFinance
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=your_jwt_expiry
```

4. Install client dependencies
```bash
cd ../client
npm install
```

5. Start the development servers

For backend:
```bash
cd ../server
npm run dev
```

For frontend:
```bash
cd ../client
npm run dev
```

The application will be available at `http://localhost:5173` and the API at `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Income
- `GET /api/income` - Get all income records
- `POST /api/income` - Create a new income record
- `PUT /api/income/:id` - Update an income record
- `DELETE /api/income/:id` - Delete an income record

### Dashboard
- `GET /api/dashboard/summary` - Get financial summary
- `GET /api/dashboard/stats` - Get detailed statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React.js](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) 