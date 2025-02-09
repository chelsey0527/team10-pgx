import React from 'react';

interface ActionButtonsProps {
  onActionClick: (message: string) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onActionClick }) => {
  const actions = [
    { label: "Yes", message: "Yes" },
    { label: "No", message: "No" },
    { label: "Get Help", message: "I need help" }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onActionClick(action.message)}
          className="px-4 py-2 text-sm  text-gray-700 rounded-full border border-gray-700 transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}; 