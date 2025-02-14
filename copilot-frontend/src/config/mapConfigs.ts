import { MapConfig } from '../types/map';
import mapDemoActual from '../assets/map-demo-actual.png';

export const mapConfigs: Record<string, MapConfig> = {
  'general-blue-b110': {
    id: 'general-blue-b110',
    markers: [
      {
        id: 'entrance-1',
        x: 58,
        y: 28,
        type: 'entrance',
        tooltip: '156th Entrance'
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
  'general-blue-b132': {
    id: 'general-blue-b132',
    markers: [
      {
        id: 'entrance-1',
        x: 58,
        y: 28,
        type: 'entrance',
        tooltip: '156th Entrance'
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
        x: 58,
        y: 26,
        type: 'entrance',
        tooltip: '159th Entrance'
      },
      {
        id: 'parking-1',
        x: 140,
        y: 52,
        type: 'parking',
        tooltip: 'Parking Area',
        image: mapDemoActual,
      }
    ]
  }
}; 