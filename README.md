# FarmFinance

A comprehensive solution for agricultural financial management designed for Indian farmers.

![FarmFinance Banner](https://via.placeholder.com/800x400?text=FarmFinance)

## Overview

FarmFinance is a full-stack MERN application that empowers farmers to track expenses, monitor income, visualize financial data, and make informed business decisions. Built with responsiveness and ease-of-use in mind, it caters specifically to the Indian agricultural context.

## Features

- **Secure Authentication**: JWT-based login/registration system
- **Financial Tracking**: Comprehensive expense and income management
- **Data Visualization**: Interactive charts for financial insights
- **Theme Options**: Toggle between light and dark modes
- **Responsive Design**: Works seamlessly on all devices
- **Multilingual**: Available in English, Hindi, and Gujarati
- **User Profiles**: Customizable personal and farm details
- **Admin Dashboard**: Complete oversight of system operations

## Technology Stack

### Frontend
- React with Vite
- TailwindCSS
- React Router
- Recharts
- Context API
- i18next
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt
- Zod

## Installation

### Prerequisites
- Node.js v14+
- MongoDB
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FarmFinance.git
   cd FarmFinance
   ```

2. **Set up environment variables**
   
   For server (.env in server directory):
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_secret_key
   JWT_EXPIRY=7d
   NODE_ENV=development
   ```

   For client (.env in client directory):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Install dependencies and start**
   ```bash
   # Server setup
   cd server
   npm install
   npm run dev

   # Client setup (in another terminal)
   cd client
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Documentation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login a user |
| `/api/expenses` | GET | Get all expenses |
| `/api/expenses` | POST | Add new expense |
| `/api/income` | GET | Get all income entries |
| `/api/income` | POST | Add new income |
| `/api/dashboard/summary` | GET | Get financial summary |

[Full API Documentation](https://github.com/yourusername/FarmFinance/wiki/API-Documentation)

## Key Functionalities

### Financial Dashboard
Monitor income, expenses, and profit with visualizations that provide insights for better decision-making.

### Expense Management
Categorize expenses with India-specific categories relevant to agricultural operations.

### Income Tracking
Record produce sales with automatic calculations based on quantity and rate.

### Multilingual Support
Use the application in English, Hindi, or Gujarati with proper localization.

### Mobile Experience
Optimized for farmers on the go with a responsive, touch-friendly interface.

## Recent Updates

### June 2024
- Admin Dashboard with user management
- Performance optimizations
- Progressive Web App support for offline functionality

### January 2024
- Advanced reporting with export options
- Security enhancements including two-factor authentication
- Year-over-year comparison tools

## Development Roadmap

- Weather integration for crop planning
- SMS notifications for rural users
- Agricultural marketplace integration
- Machine learning for yield prediction

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- React Icons
- Recharts
- TailwindCSS
- i18next
- The farming community for valuable feedback 