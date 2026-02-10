import React from 'react';

// Cole o componente InputField que estava no App.jsx
const InputField = ({ id, label, type, value, onChange, disabled, required, placeholder, name }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input
      id={id}
      name={name || id} // Garante que o 'name' seja passado para o onChange
      type={type}
      className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400"
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
    />
  </div>
);

export default InputField;