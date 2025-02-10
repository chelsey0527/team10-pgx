import { MapConfig } from '../types/map';

export const mapConfigs: Record<string, MapConfig> = {
  'general-blue-b1': {
    id: 'general-blue-b1',
    markers: [
      {
        id: 'entrance-1',
        x: 45, // percentage from left
        y: 65, // percentage from top
        type: 'entrance',
        tooltip: 'Main Entrance'
      },
      {
        id: 'parking-1',
        x: 55,
        y: 40,
        type: 'parking',
        tooltip: 'Recommended Parking Area'
      }
    ]
  },
  'ev-orange-b1': {
    id: 'ev-orange-b1',
    markers: [
      {
        id: 'entrance-1',
        x: 100,
        y: 50,
        type: 'entrance',
        tooltip: 'EV Section Entrance'
      },
      {
        id: 'parking-1',
        x: 50,
        y: 45,
        type: 'parking',
        tooltip: 'EV Charging Stations'
      }
    ]
  }
}; 