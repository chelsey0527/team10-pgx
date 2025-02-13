import { MapConfig } from '../types/map';
import mapDemoActual from '../assets/map-demo-actual.png';

export const mapConfigs: Record<string, MapConfig> = {
  'general-blue-b1': {
    id: 'general-blue-b1',
    markers: [
      {
        id: 'entrance-1',
        x: 58,
        y: 28,
        type: 'entrance',
        tooltip: 'Main Entrance'
      },
      {
        id: 'parking-1',
        x: 40,
        y: 44,
        type: 'parking',
        tooltip: 'Parking Area',
        image: mapDemoActual,
      }
    ]
  },
  'ev-orange-b1': {
    id: 'ev-orange-b1',
    markers: [
      {
        id: 'entrance-1',
        x: 100,
        y: 49,
        type: 'entrance',
        tooltip: 'West Entrance'
      },
      {
        id: 'parking-1',
        x: 65,
        y: 45,
        type: 'parking',
        tooltip: 'Parking Area',
        image: mapDemoActual,
      }
    ]
  }
}; 