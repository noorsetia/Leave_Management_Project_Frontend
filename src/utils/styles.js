// Common CSS class utilities for consistent styling

export const buttonStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-all duration-200",
  success: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg",
  danger: "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg",
};

export const inputStyles = {
  field: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200",
};

export const cardStyles = {
  base: "bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl",
};

export const badgeStyles = {
  base: "inline-block px-3 py-1 rounded-full text-sm font-semibold",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};
