export type AircraftStatus = "active" | "inactive" | "maintenance";

export interface CreateAircraftDTO {
  providerId: string;
  aircraftType: string;
  aircraftName: string;
  manufacturer: string;
  buildYear: number;
  seatCapacity: number;
  flyingRangeKm: number;
  engineCount: number;
  lavatoryCount: number;
  baseStationId: string;
  currentLocationId: string;
  availableFrom: Date; 
  status: AircraftStatus;
}

export interface UpdateAircraftDTO {
  aircraftName?: string;
  buildYear?: number;
  seatCapacity?: number;
  flyingRangeKm?: number;
  engineCount?: number;
  lavatoryCount?: number;
  baseStationId?: string;
  currentLocationId?: string;
  availableFrom?: Date;
  status?: AircraftStatus;
}

export interface UpdateAircraftStatusDTO {
  aircraftId: string;
  status: AircraftStatus;
}

export interface UpdateAircraftLocationDTO {
  aircraftId: string;
  currentLocationId: string;
}

export interface AircraftDetailsDTO {
  id: string;
  providerId: string;
  aircraftType: string;
  aircraftName: string;
  manufacturer: string;
  buildYear: number;
  seatCapacity: number;
  flyingRangeKm: number;
  engineCount: number;
  lavatoryCount: number;
  availableFrom: Date; 
  baseStationId: string;
  currentLocationId: string;
  status: AircraftStatus;
  createdAt: string; 
  updatedAt: string; 
  baseStation?: {
    id: string;
    name: string;
    city: string;  
    country: string; 
  };
  currentLocation?: {
    id: string;
    name: string;
    city: string;   
    country: string; 
  };
}