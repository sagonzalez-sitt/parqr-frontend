# Frontend - Sistema de Parqueadero

Aplicación web desarrollada con Next.js 14 para el sistema de gestión de parqueadero con códigos QR.

## Tecnologías

- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Lenguaje de programación
- **CSS Modules** - Sistema de estilos modular
- **Lucide React** - Iconos
- **HTML5 QRCode** - Escáner de códigos QR

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.local.example .env.local
```

3. Actualizar `NEXT_PUBLIC_API_URL` con la URL del backend

## Desarrollo

```bash
# Modo desarrollo
npm run dev

# Construir para producción
npm run build
npm run start
```

## Páginas

### / (Inicio)
Página principal con navegación a todas las funcionalidades y información de tarifas.

### /counter (Terminal de Entrada)
Interfaz optimizada para tablets que permite:
- Capturar placa del vehículo
- Seleccionar tipo de vehículo
- Generar código QR instantáneamente
- Descargar, imprimir o copiar el ticket

### /verify/[token] (Verificación de Ticket)
Página accesible vía QR que muestra:
- Información del vehículo
- Tiempo transcurrido en tiempo real
- Tarifa estimada/final
- Estado del ticket

### /exit (Terminal de Salida)
Terminal para procesar salidas con:
- Escáner de códigos QR usando cámara
- Entrada manual de códigos
- Cálculo automático de tarifas
- Resumen de la estadía

### /dashboard (Panel Administrativo)
Dashboard con estadísticas en tiempo real:
- Vehículos activos
- Estadísticas del día
- Distribución por tipo de vehículo
- Lista de tickets activos
- Ingresos y métricas

## Características

- **Responsive**: Optimizado para tablets y móviles
- **Sin autenticación**: Sistema stateless sin registro de usuarios
- **Tiempo real**: Actualización automática de información
- **Offline-ready**: Funciona sin conexión para verificación básica
- **Accesible**: Diseño inclusivo y fácil de usar

## Flujo de Usuario

1. **Entrada**: Operador registra vehículo → Sistema genera QR → Usuario guarda QR
2. **Verificación**: Usuario escanea QR → Ve información en tiempo real
3. **Salida**: Usuario escanea QR en terminal → Sistema calcula tarifa → Procesa salida

## Optimizaciones

- Caché de API calls
- Lazy loading de componentes
- Optimización de imágenes
- Minificación automática
- Tree shaking