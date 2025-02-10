export interface MapMarker {
  id: string;
  x: number;
  y: number;
  type: 'entrance' | 'parking';
  tooltip: string;
}

export interface MapConfig {
  id: string;
  markers: MapMarker[];
} 