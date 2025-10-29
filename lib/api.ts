import { config } from './config';

const API_URL = config.api.baseUrl;

export interface VehicleEntry {
  plateNumber: string;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'BICYCLE';
}

export interface TicketResponse {
  ticket: {
    id: string;
    qrToken: string;
    plateNumber: string;
    vehicleType: string;
    entryTimestamp: string;
    exitTimestamp?: string;
    calculatedFee?: number;
    status: string;
  };
  qrCode?: string;
  verifyUrl?: string;
  timeElapsed?: number;
  estimatedFee?: number;
  totalMinutes?: number;
  totalHours?: number;
}

export interface ParkingStatus {
  activeVehicles: number;
  vehicleTypeCounts: Record<string, number>;
  activeTickets: Array<{
    id: string;
    plateNumber: string;
    vehicleType: string;
    entryTimestamp: string;
    timeElapsed: number;
  }>;
  todayStats: {
    totalEntries: number;
    totalRevenue: number;
  };
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createEntry(data: VehicleEntry): Promise<TicketResponse> {
    return this.request<TicketResponse>('/parking/entry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTicket(qrToken: string): Promise<TicketResponse> {
    return this.request<TicketResponse>(`/parking/ticket/${qrToken}`);
  }

  async processExit(qrToken: string): Promise<TicketResponse> {
    return this.request<TicketResponse>('/parking/exit', {
      method: 'POST',
      body: JSON.stringify({ qrToken }),
    });
  }

  async getParkingStatus(): Promise<ParkingStatus> {
    return this.request<ParkingStatus>('/parking/status');
  }

  async getAllTickets(): Promise<TicketResponse[]> {
    return this.request<TicketResponse[]>('/parking/tickets');
  }

  async getTicketById(id: string): Promise<TicketResponse> {
    return this.request<TicketResponse>(`/parking/tickets/${id}`);
  }

  // NUEVOS MÉTODOS PARA SISTEMA HÍBRIDO
  async confirmDigitalDelivery(token: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/parking/confirm-digital/${token}`, {
      method: 'POST',
    });
  }

  async markAsPrinted(token: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/parking/mark-printed/${token}`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();