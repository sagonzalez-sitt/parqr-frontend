'use client';

import { useState, useEffect, useCallback } from 'react';
import { Camera, Printer, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '@/lib/api';
import { getVehicleTypeLabel } from '@/lib/utils';
import styles from './page.module.css';

// Función para generar ticket demo
const generateDemoTicket = () => ({
  qrCode: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="white"/>
      <rect x="50" y="50" width="200" height="200" fill="black"/>
      <rect x="75" y="75" width="150" height="150" fill="white"/>
      <rect x="100" y="100" width="100" height="100" fill="black"/>
      <rect x="125" y="125" width="50" height="50" fill="white"/>
      <text x="150" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="black">DEMO QR</text>
    </svg>
  `),
  ticket: {
    qrToken: `demo-${Date.now()}`,
    plateNumber: ['ABC123', 'XYZ789', 'DEF456'][Math.floor(Math.random() * 3)],
    vehicleType: ['CAR', 'MOTORCYCLE', 'BICYCLE'][Math.floor(Math.random() * 3)],
    entryTimestamp: new Date().toISOString(),
  }
});

export default function EntryDisplayPage() {
  const [currentTicket, setCurrentTicket] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);
  const [status, setStatus] = useState<'waiting' | 'displaying' | 'confirmed' | 'printed'>('waiting');
  const [loading, setLoading] = useState(false);

  const simulateNewTicket = () => {
    const demoTicket = generateDemoTicket();
    setCurrentTicket(demoTicket);
    setStatus('displaying');
    setCountdown(10); // 10 segundos para decidir
  };

  const resetDisplay = useCallback(() => {
    setCurrentTicket(null);
    setStatus('waiting');
    setCountdown(0);
  }, []);

  const simulateNewTicketWithRealData = useCallback(async () => {
    try {
      // Crear un ticket real usando el API
      const plateNumbers = ['ABC123', 'XYZ789', 'DEF456', 'GHI789', 'JKL012'];
      const vehicleTypes = ['CAR', 'MOTORCYCLE', 'BICYCLE'] as const;
      
      const randomPlate = plateNumbers[Math.floor(Math.random() * plateNumbers.length)];
      const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      
      const realTicket = await apiService.createEntry({
        plateNumber: randomPlate,
        vehicleType: randomType,
      });
      
      setCurrentTicket(realTicket);
      setStatus('displaying');
      setCountdown(10);
      
    } catch (error) {
      console.error('Error creando ticket real:', error);
      // Fallback a ticket demo si falla
      simulateNewTicket();
    }
  }, []);

  const handleTookPhoto = async () => {
    if (!currentTicket) {
      alert('No hay ticket activo');
      return;
    }
    
    // Si es un ticket demo (empieza con 'demo-'), solo simular
    if (currentTicket.ticket.qrToken.startsWith('demo-')) {
      console.log('Ticket demo detectado, simulando confirmación');
      setStatus('confirmed');
      setTimeout(() => {
        resetDisplay();
      }, 3000);
      return;
    }
    
    console.log('Confirmando foto para token:', currentTicket.ticket.qrToken);
    setLoading(true);
    
    try {
      const result = await apiService.confirmDigitalDelivery(currentTicket.ticket.qrToken);
      console.log('Resultado confirmación:', result);
      setStatus('confirmed');
      setTimeout(() => {
        resetDisplay();
      }, 3000);
    } catch (error) {
      console.error('Error confirmando foto:', error);
      alert(`Error al confirmar la foto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintNow = async () => {
    if (!currentTicket) {
      alert('No hay ticket activo');
      return;
    }
    
    // Si es un ticket demo (empieza con 'demo-'), solo simular
    if (currentTicket.ticket.qrToken.startsWith('demo-')) {
      console.log('Ticket demo detectado, simulando impresión');
      setStatus('printed');
      setTimeout(() => {
        resetDisplay();
      }, 3000);
      return;
    }
    
    console.log('Marcando como impreso para token:', currentTicket.ticket.qrToken);
    setLoading(true);
    
    try {
      const result = await apiService.markAsPrinted(currentTicket.ticket.qrToken);
      console.log('Resultado impresión:', result);
      setStatus('printed');
      setTimeout(() => {
        resetDisplay();
      }, 3000);
    } catch (error) {
      console.error('Error marcando como impreso:', error);
      alert(`Error al marcar como impreso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoPrint = useCallback(async () => {
    if (!currentTicket) return;
    
    // Si es un ticket demo, solo simular
    if (currentTicket.ticket.qrToken.startsWith('demo-')) {
      console.log('Ticket demo detectado, simulando auto-impresión');
      setStatus('printed');
      setTimeout(() => {
        resetDisplay();
      }, 3000);
      return;
    }
    
    try {
      await apiService.markAsPrinted(currentTicket.ticket.qrToken);
      setStatus('printed');
      setTimeout(() => {
        resetDisplay();
      }, 3000);
    } catch (error) {
      console.error('Error en auto-impresión:', error);
    }
  }, [currentTicket, resetDisplay]);

  // Simular llegada de nuevo ticket cada 30 segundos para demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'waiting') {
        simulateNewTicketWithRealData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status, simulateNewTicketWithRealData]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0 && status === 'displaying') {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && status === 'displaying') {
      // Auto-imprimir cuando llega a 0
      handleAutoPrint();
    }

    return () => clearTimeout(timer);
  }, [countdown, status, handleAutoPrint]);

  // Vista de espera
  if (status === 'waiting') {
    return (
      <div className={styles.waitingContainer}>
        <div className={styles.waitingContent}>
          <div className={styles.waitingIcon}>
            <Clock className={styles.waitingIconSvg} />
          </div>
          <h1 className={styles.waitingTitle}>Esperando Vehículo...</h1>
          <p className={styles.waitingSubtitle}>
            La pantalla se activará cuando llegue un nuevo vehículo
          </p>
          <div className={styles.simulateButtons}>
            <button
              onClick={simulateNewTicketWithRealData}
              className={`${styles.simulateButton} ${styles.simulateButtonPrimary}`}
            >
              🎭 Simular Nuevo Vehículo (Real)
            </button>
            <button
              onClick={simulateNewTicket}
              className={`${styles.simulateButton} ${styles.simulateButtonSecondary}`}
            >
              🎪 Simular con Datos Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de confirmación
  if (status === 'confirmed') {
    return (
      <div className={styles.confirmedContainer}>
        <div className={styles.confirmedContent}>
          <CheckCircle className={styles.confirmedIcon} />
          <h1 className={styles.confirmedTitle}>¡PERFECTO!</h1>
          <p className={styles.confirmedSubtitle}>Foto tomada correctamente</p>
          <p className={styles.confirmedMessage}>
            Puede continuar al parqueadero
          </p>
        </div>
      </div>
    );
  }

  // Vista de impresión
  if (status === 'printed') {
    return (
      <div className={styles.printedContainer}>
        <div className={styles.printedContent}>
          <Printer className={styles.printedIcon} />
          <h1 className={styles.printedTitle}>IMPRIMIENDO...</h1>
          <p className={styles.printedSubtitle}>Retire su ticket de la bandeja</p>
          <p className={styles.printedMessage}>
            Conserve el ticket hasta su salida
          </p>
        </div>
      </div>
    );
  }

  // Vista principal - Mostrando QR
  return (
    <div className={styles.displayContainer}>
      <div className={styles.displayContent}>
        {/* Header con countdown */}
        <div className={styles.displayHeader}>
          <div className={styles.headerRow}>
            <h1 className={styles.displayTitle}>TOME SU TICKET</h1>
            <div className={styles.countdown}>
              {countdown}s
            </div>
          </div>
          <p className={styles.vehicleInfo}>
            Placa: <span className="highlight">{currentTicket?.ticket.plateNumber}</span> | 
            Tipo: <span className="highlight">{getVehicleTypeLabel(currentTicket?.ticket.vehicleType)}</span>
          </p>
        </div>

        {/* QR Code gigante */}
        <div className={styles.qrContainer}>
          <img 
            src={currentTicket?.qrCode} 
            alt="Código QR del ticket" 
            className={styles.qrImage}
          />
        </div>

        {/* Instrucciones */}
        <div className={styles.instructions}>
          <p className={styles.instructionsTitle}>OPCIONES:</p>
          <div className={styles.optionsGrid}>
            <div className={styles.optionCard}>
              <Camera className={styles.optionIcon} />
              <p className={styles.optionTitle}>1. TOME UNA FOTO</p>
              <p className={styles.optionDescription}>Con su celular</p>
            </div>
            <div className={styles.optionCard}>
              <Printer className={styles.optionIcon} />
              <p className={styles.optionTitle}>2. ESPERE LA IMPRESIÓN</p>
              <p className={styles.optionDescription}>Automática en {countdown}s</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className={styles.actionButtons}>
          <button
            onClick={handleTookPhoto}
            disabled={loading}
            className={`${styles.actionButton} ${styles.photoButton}`}
          >
            <CheckCircle className={styles.actionIcon} />
            YA TOMÉ LA FOTO
          </button>

          <button
            onClick={handlePrintNow}
            disabled={loading}
            className={`${styles.actionButton} ${styles.printButton}`}
          >
            <Printer className={styles.actionIcon} />
            IMPRIMIR AHORA
          </button>
        </div>

        {/* Información adicional */}
        <div className={styles.additionalInfo}>
          <p>⏰ Si no selecciona una opción, se imprimirá automáticamente</p>
          <p>📱 Puede escanear el QR para descargarlo como imagen</p>
        </div>
      </div>
    </div>
  );
}