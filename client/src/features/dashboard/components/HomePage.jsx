import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HomePage = () => {
  const { currentUser } = useAuth();

  // Sample data for dashboard
  const chartData = [
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 2000, expenses: 3800 },
    { name: 'Apr', income: 2780, expenses: 3908 },
    { name: 'May', income: 1890, expenses: 4800 },
    { name: 'Jun', income: 2390, expenses: 3800 },
  ];

  const summaryData = {
    totalIncome: 16060,
    totalExpenses: 18106,
    currentBalance: 16060 - 18106,
    recentTransactions: [
      { id: 1, type: 'expense', category: 'Seeds', amount: 300, date: '2023-06-10' },
      { id: 2, type: 'income', category: 'Crop Sales', amount: 1200, date: '2023-06-08' },
      { id: 3, type: 'expense', category: 'Equipment', amount: 550, date: '2023-06-05' },
      { id: 4, type: 'expense', category: 'Fertilizer', amount: 200, date: '2023-06-01' },
    ]
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome, {currentUser?.name || 'Farmer'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Income</h2>
          <p className={`text-2xl font-bold ${summaryData.totalIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${summaryData.totalIncome.toLocaleString()}
          </p>
          <Link to="/income" className="text-sm text-green-600 hover:underline">View Details</Link>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Expenses</h2>
          <p className="text-2xl font-bold text-red-600">
            ${summaryData.totalExpenses.toLocaleString()}
          </p>
          <Link to="/expenses" className="text-sm text-green-600 hover:underline">View Details</Link>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Current Balance</h2>
          <p className={`text-2xl font-bold ${summaryData.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${summaryData.currentBalance.toLocaleString()}
          </p>
          <div className="text-sm">
            {summaryData.currentBalance < 0 ? 
              <span className="text-red-600">Warning: Negative Balance</span> : 
              <span className="text-green-600">Healthy Balance</span>
            }
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Income vs Expenses (6 Month)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#4CAF50" />
              <Bar dataKey="expenses" name="Expenses" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <div className="flex space-x-2">
              <Link to="/expenses/add" className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">Add Expense</Link>
              <Link to="/income/add" className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">Add Income</Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summaryData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/expenses/add" className="p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">💸</span>
              <span className="font-medium">Add Expense</span>
            </Link>
            <Link to="/income/add" className="p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">💰</span>
              <span className="font-medium">Add Income</span>
            </Link>
            <Link to="/expenses" className="p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">📊</span>
              <span className="font-medium">View Expenses</span>
            </Link>
            <Link to="/income" className="p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 flex flex-col items-center justify-center">
              <span className="text-2xl mb-2">📈</span>
              <span className="font-medium">View Income</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 