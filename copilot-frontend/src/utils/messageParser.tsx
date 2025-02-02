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
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse parking card
    if (line.includes('<parking')) {
      addCurrentText();
      const parkingMatch = text.match(/<parking[^>]*location="([^"]*)"[^>]*level="([^"]*)"[^>]*zone="([^"]*)"[^>]*>/s);
      if (parkingMatch) {
        parts.push(
          <ParkingCard
            key={index++}
            location={parkingMatch[1]}
            level={parkingMatch[2]}
            zone={parkingMatch[3]}
            className="mb-10"
          />
        );
        // Skip to closing tag
        while (i < lines.length && !lines[i].includes('/>')) {
          i++;
        }
      }
      continue;
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
      continue;
    }

    // Parse bold text
    if (line.includes('**')) {
      addCurrentText();
      const boldText = line.replace(/\*\*(.*?)\*\*/g, '$1');
      parts.push(
        <p key={index++} className="font-bold text-[#e58a2f] mb-2">
          {boldText}
        </p>
      );
      continue;
    }

    // Handle bullet points
    if (line.startsWith('- ')) {
      addCurrentText();
      parts.push(
        <p key={index++} className="mb-1 ml-4">
          • {line.slice(2)}
        </p>
      );
      continue;
    }

    // Handle regular text
    if (line.trim()) {
      currentText += (currentText ? '\n' : '') + line;
    } else {
      addCurrentText();
    }
  }

  addCurrentText();
  return parts;
}; 