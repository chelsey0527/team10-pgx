import React from 'react';
import { ParkingCard } from '../components/ParkingCard';
import { RegCard } from '../components/RegCard';
import { InfoCard } from '../components/InfoCard';
import { MeetingCard } from '../components/MeetingCard';
import { setParkingRecommendation } from '../store/parkingSlice';
import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import { store } from '../store/store';
import { setUser, updateSpecialNeeds } from '../store/userSlice';
import axios from 'axios';

export const parseMessage = (text: string, dispatch: Dispatch<AnyAction>): React.JSX.Element[] => {
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

    // Parse meeting card
    if (line.includes('<MeetingCard')) {
      addCurrentText();
      
      // Collect all lines of the MeetingCard until we find the closing tag
      let cardContent = line;
      while (i + 1 < lines.length && !lines[i].includes('/>')) {
        i++;
        cardContent += ' ' + lines[i];
      }

      const eventNameMatch = cardContent.match(/EventName="([^"]*)"/) || ['', 'PGX Weekly Meeting'];
      const eventTimeMatch = cardContent.match(/EventTime="([^"]*)"/) || ['', '2025-01-27 02:00 PM'];
      const locationMatch = cardContent.match(/Location="([^"]*)"/) || ['', 'Building 3'];
      const eventHolder = cardContent.match(/EventHolder="([^"]*)"/) || ['', 'Alex M'];
      
      parts.push(
        <MeetingCard 
          key={index++} 
          EventName={eventNameMatch[1]} 
          EventTime={eventTimeMatch[1]} 
          Location={locationMatch[1]} 
          EventHolder={eventHolder[1]}
        />
      );
      
      continue;
    }

    if (line.includes('<RegCard')) {
      addCurrentText();
      
      // Collect all lines of the RegCard until we find the closing tag
      let cardContent = line;
      while (i + 1 < lines.length && !lines[i].includes('/>')) {
        i++;
        cardContent += ' ' + lines[i];
      }

      const carPlateMatch = cardContent.match(/carPlate="([^"]*)"/) || ['', '123carplate'];
      const userMatch = cardContent.match(/user="([^"]*)"/) || ['', 'John Doe'];
      const colorMatch = cardContent.match(/color="([^"]*)"/) || ['', 'Red'];
      const makeMatch = cardContent.match(/make="([^"]*)"/) || ['', 'Toyota'];
      const stateMatch = cardContent.match(/state="([^"]*)"/) || ['', 'California'];
      const dateMatch = cardContent.match(/date="([^"]*)"/) || ['', '2025-01-27 02:00 PM'];
      
      parts.push(
        <RegCard 
          key={index++} 
          CarPlate={carPlateMatch[1]}
          User={userMatch[1]}
          Color={colorMatch[1]}
          Make={makeMatch[1]}
          State={stateMatch[1]}
          Date={dateMatch[1]}
        />
      );
      
      continue;
    }
    
    // Parse parking card
    if (line.includes('<parking')) {
      addCurrentText();
      const parkingMatch = text.match(/<parking[^>]*location="([^"]*)"[^>]*level="([^"]*)"[^>]*zone="([^"]*)"[^>]*>/);
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

  if (text.includes('For the shortest walk to your destination')) {
    const currentState = store.getState();
    const userSpecialNeeds = currentState.user.user?.specialNeeds || {
      needsEV: false,
      needsAccessible: false,
      needsCloserToElevator: false
    };

    // Get building number from text
    const buildingMatch = text.match(/Building (\d+)/i);
    const buildingNumber = buildingMatch ? buildingMatch[1] : '';

    if (buildingNumber) {
      // Use setTimeout to break the synchronous update cycle
      setTimeout(() => {
        axios.post('/api/conversations/smart-response', {
          eventUserId: currentState.user.user?.id,
          message: text,
          specialNeeds: userSpecialNeeds
        })
        .then(response => {
          if (response.data) {
            dispatch(setParkingRecommendation(response.data));
          }
        })
        .catch(error => {
          console.error('Error getting parking recommendation:', error);
        });
      }, 0);
    }
  }

  return parts;
}; 