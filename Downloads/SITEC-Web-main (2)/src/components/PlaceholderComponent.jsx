import React from 'react';

// Cole o PlaceholderComponent que estava no App.jsx
const PlaceholderComponent = ({ title }) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
    <p className="text-gray-500 dark:text-gray-400 mt-4">Esta funcionalidade está em desenvolvimento e será disponibilizada em breve.</p>
  </div>
);

export default PlaceholderComponent;