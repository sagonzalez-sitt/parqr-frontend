'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Bike, User, Send } from 'lucide-react';
import { apiService, VehicleEntry } from '@/lib/api';
import { validatePlateNumber, getVehicleTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './page.module.css';

export default function OperatorPage() {
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE' | 'BICYCLE'>('CAR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastTicket, setLastTicket] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plateNumber.trim()) {
      setError('Por favor ingrese la placa del vehículo');
      return;
    }

    if (!validatePlateNumber(plateNumber)) {
      setError('Formato de placa inválido (3-10 caracteres, solo letras, números y guiones)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const entryData: VehicleEntry = {
        plateNumber: plateNumber.toUpperCase(),
        vehicleType,
      };

      const response = await apiService.createEntry(entryData);
      setLastTicket(response);
      setSuccess(`Ticket generado exitosamente para ${plateNumber.toUpperCase()}`);
      
      // Limpiar formulario
      setPlateNumber('');
      setVehicleType('CAR');
      
      // Simular que se muestra en pantalla del torniquete
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickEntry = (plate: string, type: 'CAR' | 'MOTORCYCLE' | 'BICYCLE') => {
    setPlateNumber(plate);
    setVehicleType(type);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.backSection}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            Volver al inicio
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.iconContainer}>
              <User className={styles.headerIcon} />
            </div>
            <h1 className={styles.title}>
              Panel del Operador
            </h1>
            <p className={styles.subtitle}>
              Registra la entrada de vehículos al parqueadero
            </p>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className={`${styles.alert} ${styles.errorAlert}`}>
              <p className={styles.alertTitle}>{error}</p>
            </div>
          )}

          {success && (
            <div className={`${styles.alert} ${styles.successAlert}`}>
              <p className={styles.alertTitle}>{success}</p>
              {lastTicket && (
                <div className={styles.alertDetails}>
                  Token: {lastTicket.ticket.qrToken} | 
                  Hora: {new Date(lastTicket.ticket.entryTimestamp).toLocaleTimeString('es-CO')}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Entrada de placa */}
            <div className={styles.inputGroup}>
              <label htmlFor="plateNumber">
                Placa del Vehículo
              </label>
              <input
                type="text"
                id="plateNumber"
                value={plateNumber}
                onChange={(e) => {
                  setPlateNumber(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Ej: ABC123, XYZ-456"
                className={styles.plateInput}
                maxLength={10}
                autoComplete="off"
                autoFocus
              />
            </div>

            {/* Botones de entrada rápida */}
            <div className={styles.quickButtons}>
              <button
                type="button"
                onClick={() => handleQuickEntry('ABC123', 'CAR')}
                className={styles.quickButton}
              >
                Demo: ABC123
              </button>
              <button
                type="button"
                onClick={() => handleQuickEntry('XYZ789', 'MOTORCYCLE')}
                className={styles.quickButton}
              >
                Demo: XYZ789
              </button>
              <button
                type="button"
                onClick={() => handleQuickEntry('BIC456', 'BICYCLE')}
                className={styles.quickButton}
              >
                Demo: BIC456
              </button>
            </div>

            {/* Selector de tipo de vehículo */}
            <div className={styles.vehicleTypeSection}>
              <label>Tipo de Vehículo</label>
              <div className={styles.vehicleTypeGrid}>
                {[
                  { type: 'CAR' as const, label: 'Carro', icon: Car, rate: '$2.00/hora' },
                  { type: 'MOTORCYCLE' as const, label: 'Moto', icon: Car, rate: '$1.00/hora' },
                  { type: 'BICYCLE' as const, label: 'Bicicleta', icon: Bike, rate: '$0.50/hora' },
                ].map(({ type, label, icon: Icon, rate }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVehicleType(type)}
                    className={`${styles.vehicleTypeButton} ${
                      vehicleType === type ? styles.vehicleTypeButtonActive : ''
                    }`}
                  >
                    <Icon className={styles.vehicleTypeIcon} />
                    <div className={styles.vehicleTypeLabel}>{label}</div>
                    <div className={styles.vehicleTypeRate}>{rate}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading || !plateNumber.trim()}
              className={styles.submitButton}
            >
              {loading ? (
                <div className={styles.loadingContent}>
                  <LoadingSpinner size="sm" />
                  Generando Ticket...
                </div>
              ) : (
                <>
                  <Send className={styles.submitIcon} />
                  Generar Ticket
                </>
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className={styles.instructions}>
            <h3 className={styles.instructionsTitle}>Instrucciones:</h3>
            <div className={styles.instructionsList}>
              <div>1. Observe la placa del vehículo que ingresa</div>
              <div>2. Ingrese la placa en el campo superior</div>
              <div>3. Seleccione el tipo de vehículo</div>
              <div>4. Presione &quot;Generar Ticket&quot;</div>
              <div>5. El QR se mostrará automáticamente en la pantalla del torniquete</div>
            </div>
          </div>

          {/* Simulación de pantalla del torniquete */}
          {lastTicket && (
            <div className={styles.simulation}>
              <div className={styles.simulationHeader}>
                <h4 className={styles.simulationTitle}>
                  📺 Simulación: Pantalla del Torniquete
                </h4>
                <div className={styles.simulationContent}>
                  <img 
                    src={lastTicket.qrCode} 
                    alt="QR en pantalla del torniquete" 
                    className={styles.simulationQR}
                  />
                  <div className={styles.simulationPlate}>{lastTicket.ticket.plateNumber}</div>
                  <div className={styles.simulationVehicleType}>
                    {getVehicleTypeLabel(lastTicket.ticket.vehicleType)}
                  </div>
                </div>
                <p className={styles.simulationNote}>
                  El conductor puede tomar foto o escanear este QR
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}