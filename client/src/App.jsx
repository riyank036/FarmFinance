import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './features/auth/context/AuthContext';
import ThemeProvider from './context/ThemeContext';
import LanguageProvider from './context/LanguageContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import AdminLayout from './shared/components/layout/AdminLayout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';

// Main Pages
import HomePage from './pages/HomePage';
import AddExpensePage from './pages/AddExpensePage';
import AddIncomePage from './pages/AddIncomePage';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import ProfilePage from './pages/ProfilePage';
import MonthlyFinancialPage from './pages/MonthlyFinancialPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Components
import UserManagement from './features/admin/components/UserManagement';
import TransactionManagement from './features/admin/components/TransactionManagement';
import MonthlyFinancialData from './features/admin/components/MonthlyFinancialData';
import AdminProfile from './features/admin/components/AdminProfile';
import FeedbackManagement from './features/admin/components/FeedbackManagement';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <Router>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/add-expense" element={<AddExpensePage />} />
                  <Route path="/add-income" element={<AddIncomePage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/income" element={<IncomePage />} />
                  <Route path="/monthly-financial" element={<MonthlyFinancialPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                  
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout><UserManagement /></AdminLayout>} />
                  <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
                  <Route path="/admin/transactions" element={<AdminLayout><TransactionManagement /></AdminLayout>} />
                  <Route path="/admin/monthly" element={<AdminLayout><MonthlyFinancialData /></AdminLayout>} />
                  <Route path="/admin/feedback" element={<AdminLayout><FeedbackManagement /></AdminLayout>} />
                  <Route path="/admin/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
                </Route>

                {/* 404 Page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
