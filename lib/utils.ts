import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}min`;
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(dateObj);
}

export function getVehicleTypeLabel(type: string): string {
  const labels = {
    CAR: 'Carro',
    MOTORCYCLE: 'Moto',
    BICYCLE: 'Bicicleta',
  };
  
  return labels[type as keyof typeof labels] || type;
}

export function validatePlateNumber(plate: string): boolean {
  // Validación básica para placas colombianas
  const plateRegex = /^[A-Z0-9-]{3,10}$/;
  return plateRegex.test(plate.toUpperCase());
}