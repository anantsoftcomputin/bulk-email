import React from 'react';

export const Card = ({ 
  children, 
  title, 
  subtitle,
  action,
  className = '',
  padding = true,
  hover = false,
  gradient = false,
  ...props 
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-100 shadow-sm
        ${hover ? 'hover:shadow-lg transition-all duration-300 cursor-pointer' : 'transition-shadow duration-200'}
        ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card;
