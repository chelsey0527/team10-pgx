import React from 'react';

interface ActionButtonsProps {
  onActionClick: (message: string) => void;
  agentMessage?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onActionClick, agentMessage }) => {
  if (!agentMessage) return null;

  let actions: { label: string; message: string }[] = [];

  if (agentMessage.includes("I have found your scheduled meeting") || agentMessage.includes("Here's your summarized special needs")) {
    actions = [
      { label: "Yes", message: "Yes" },
      { label: "No", message: "No" },
    ];
  } else if (agentMessage.includes("Your vehicle is successfully registered")) {
    actions = [
      { label: "Modify", message: "Modify" },
      { label: "Recommend Best Parking Area", message: "Recommend Best Parking Area" },
    ];
  } else if (agentMessage.includes("Do you have any special needs")) {
    actions = [
      { label: "EV charging station", message: "ev charging station" },
      { label: "Accessible", message: "accessible" },
      { label: "No", message: "No needs" },
    ];
  }

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onActionClick(action.message)}
          className="px-4 py-2 text-sm text-gray-700 rounded-full border border-gray-700 transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}; 