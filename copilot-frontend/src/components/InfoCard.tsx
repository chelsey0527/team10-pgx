import React from 'react';

interface InfoCardProps {
  title: string;
  content: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, content }) => (
  <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100 my-2">
    <h4 className="font-semibold text-blue-800 mb-1">{title}</h4>
    <p className="text-blue-600 whitespace-pre-line">{content}</p>
  </div>
); 