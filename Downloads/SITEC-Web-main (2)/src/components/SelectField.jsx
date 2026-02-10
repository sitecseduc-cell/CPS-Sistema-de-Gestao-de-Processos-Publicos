import React from 'react';

// Cole o componente SelectField que estava no App.jsx
const SelectField = ({ id, label, value, onChange, disabled, required, children, name }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <select
      id={id}
      name={name || id}
      className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
    >
      {children}
    </select>
  </div>
);

export default SelectField;