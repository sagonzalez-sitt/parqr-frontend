// Configuración centralizada de la aplicación
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  app: {
    name: 'Sistema de Parqueadero',
    version: '1.0.0',
  },
  rates: {
    car: 200, // centavos por hora
    motorcycle: 100,
    bicycle: 50,
  },
  qr: {
    size: 300,
    margin: 2,
  },
} as const;

export type Config = typeof config;