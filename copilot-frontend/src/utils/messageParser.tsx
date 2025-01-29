import React from 'react';
import { ParkingCard } from '../components/ParkingCard';
import { InfoCard } from '../components/InfoCard';

export const parseMessage = (text: string): React.JSX.Element[] => {
  const parts: React.JSX.Element[] = [];
  let currentText = '';
  let index = 0;

  const addCurrentText = () => {
    if (currentText) {
      parts.push(<p key={index++} className="mb-2">{currentText}</p>);
      currentText = '';
    }
  };

  const lines = text.split('\n');
  lines.forEach(line => {
    // Parse parking card
    if (line.includes('<parking')) {
      addCurrentText();
      const matches = line.match(/location="([^"]*)" level="([^"]*)" zone="([^"]*)"/);
      if (matches) {
        parts.push(
          <ParkingCard
            key={index++}
            location={matches[1]}
            level={matches[2]}
            zone={matches[3]}
          />
        );
      }
      return;
    }

    // Parse info card
    if (line.includes('<info')) {
      addCurrentText();
      const titleMatch = line.match(/title="([^"]*)"/);
      const contentMatch = line.match(/content="([^"]*)"/);
      if (titleMatch && contentMatch) {
        parts.push(
          <InfoCard
            key={index++}
            title={titleMatch[1]}
            content={contentMatch[1]}
          />
        );
      }
      return;
    }

    // Parse bold text
    if (line.startsWith('**') && line.endsWith('**')) {
      addCurrentText();
      const boldText = line.slice(2, -2);
      parts.push(
        <p key={index++} className="font-bold text-blue-600 mb-2">
          {boldText}
        </p>
      );
      return;
    }

    // Handle bullet points
    if (line.startsWith('- ')) {
      addCurrentText();
      parts.push(
        <p key={index++} className="mb-1 ml-4">
          • {line.slice(2)}
        </p>
      );
      return;
    }

    // Handle regular text
    if (line.trim()) {
      currentText += (currentText ? '\n' : '') + line;
    } else {
      addCurrentText();
    }
  });

  addCurrentText();
  return parts;
}; 