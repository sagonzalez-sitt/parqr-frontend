'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Bike, QrCode, Camera, Smartphone } from 'lucide-react';
import { apiService, VehicleEntry } from '@/lib/api';
import { validatePlateNumber, getVehicleTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import QRDisplay from '@/components/QRDisplay';
import { QRScanner } from '@/lib/qr-scanner';
import styles from './page.module.css';

export default function UserPage() {
  const [step, setStep] = useState<'welcome' | 'entry' | 'scan' | 'ticket' | 'exit'>('welcome');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE' | 'BICYCLE'>('CAR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [manualToken, setManualToken] = useState('');

  const handleCreateEntry = async () => {
    if (!plateNumber.trim()) {
      setError('Por favor ingrese la placa del vehículo');
      return;
    }

    if (!validatePlateNumber(plateNumber)) {
      setError('Formato de placa inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const entryData: VehicleEntry = {
        plateNumber: plateNumber.toUpperCase(),
        vehicleType,
      };

      const response = await apiService.createEntry(entryData);
      setTicket(response);
      setStep('ticket');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    setStep('scan');
    setScannerActive(true);
  };

  const processExit = async (token: string) => {
    if (!token.trim()) {
      setError('Código QR inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.processExit(token.trim());
      setTicket(response);
      setStep('exit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la salida');
    } finally {
      setLoading(false);
    }
  };

  const handleManualExit = () => {
    processExit(manualToken);
  };

  const resetFlow = () => {
    setStep('welcome');
    setPlateNumber('');
    setVehicleType('CAR');
    setTicket(null);
    setError('');
    setManualToken('');
    setScannerActive(false);
  };

  // Vista de bienvenida
  if (step === 'welcome') {
    return (
      <div className={`${styles.container} ${styles.containerWelcome}`}>
        <div className={styles.content}>
          <div>
            <Link href="/" className={styles.backButton}>
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>
          </div>

          <div className={styles.card}>
            <div className={`${styles.iconContainer} ${styles.iconPrimary}`}>
              <Smartphone size={32} />
            </div>
            
            <h1 className={styles.title}>
              Vista de Usuario
            </h1>
            <p className={styles.subtitle}>
              Simula la experiencia del usuario desde su teléfono móvil
            </p>

            <div className={styles.buttonList}>
              <button
                onClick={() => setStep('entry')}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                <Car size={20} />
                Registrar Entrada
              </button>

              <button
                onClick={handleScanQR}
                className={`${styles.button} ${styles.buttonWarning}`}
              >
                <QrCode size={20} />
                Procesar Salida
              </button>
            </div>

            <div className={styles.infoBox}>
              <p className={styles.infoText}>
                <strong>💡 Simulación:</strong> Esta vista simula cómo un usuario interactuaría con el sistema desde su teléfono móvil, sin necesidad de descargar una aplicación.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de registro de entrada
  if (step === 'entry') {
    return (
      <div className={`${styles.container} ${styles.containerEntry}`}>
        <div className={styles.content}>
          <div>
            <button
              onClick={() => setStep('welcome')}
              className={`${styles.backButton} ${styles.backButtonSuccess}`}
            >
              <ArrowLeft size={16} />
              Volver
            </button>
          </div>

          <div className={styles.card}>
            <div>
              <div className={`${styles.iconContainer} ${styles.iconSuccess}`}>
                <Car size={32} />
              </div>
              <h2 className={styles.title}>
                Registrar Entrada
              </h2>
              <p className={styles.subtitle}>
                Ingresa los datos de tu vehículo
              </p>
            </div>

            {error && (
              <div className={styles.errorBox}>
                <p className={styles.errorText}>{error}</p>
              </div>
            )}

            <div className={styles.formGroup}>
              <div>
                <label className={styles.label}>
                  Placa del Vehículo
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => {
                    setPlateNumber(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="Ej: ABC123"
                  className={styles.input}
                  maxLength={10}
                />
              </div>

              <div>
                <label className={styles.label}>
                  Tipo de Vehículo
                </label>
                <div className={styles.vehicleOptions}>
                  {[
                    { type: 'CAR' as const, label: 'Carro', icon: Car },
                    { type: 'MOTORCYCLE' as const, label: 'Moto', icon: Car },
                    { type: 'BICYCLE' as const, label: 'Bicicleta', icon: Bike },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVehicleType(type)}
                      className={`${styles.vehicleOption} ${
                        vehicleType === type ? styles.vehicleOptionSelected : ''
                      }`}
                    >
                      <Icon size={20} />
                      <span className={styles.vehicleOptionLabel}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateEntry}
                disabled={loading || !plateNumber.trim()}
                className={`${styles.button} ${styles.buttonSuccess} ${
                  loading || !plateNumber.trim() ? styles.buttonDisabled : ''
                }`}
              >
                {loading ? (
                  <div className={styles.loadingContainer}>
                    <LoadingSpinner size="sm" />
                    Generando Ticket...
                  </div>
                ) : (
                  'Generar Ticket'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista del ticket generado
  if (step === 'ticket') {
    return (
      <div className={`${styles.container} ${styles.containerTicket}`}>
        <div className={styles.content}>
          <div>
            <h2 className={`${styles.title} ${styles.titleSuccess}`}>
              ¡Ticket Generado!
            </h2>
            <p className={styles.subtitle}>
              Guarda este código QR para salir del parqueadero
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.qrContainer}>
              <img 
                src={ticket.qrCode} 
                alt="Código QR del ticket" 
                className={styles.qrImage}
              />
              
              <div className={styles.ticketInfo}>
                <div><strong>Placa:</strong> {ticket.ticket.plateNumber}</div>
                <div><strong>Tipo:</strong> {getVehicleTypeLabel(ticket.ticket.vehicleType)}</div>
                <div><strong>Hora:</strong> {new Date().toLocaleString('es-CO')}</div>
              </div>
            </div>

            <div className={styles.buttonList}>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = ticket.qrCode;
                  link.download = `ticket-${ticket.ticket.plateNumber}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className={`${styles.button} ${styles.buttonPrimary} ${styles.downloadButton}`}
              >
                Descargar QR
              </button>

              <button
                onClick={resetFlow}
                className={`${styles.button} ${styles.backToWelcome}`}
              >
                Nuevo Ticket
              </button>
            </div>

            <div className={styles.infoBox}>
              <p className={styles.infoText}>
                <strong>Instrucciones:</strong><br/>
                1. Guarda este QR en tu teléfono<br/>
                2. Al salir, escanéalo o muéstralo al operador<br/>
                3. También puedes acceder desde: {ticket.verifyUrl}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de escaneo para salida
  if (step === 'scan') {
    return (
      <div className={`${styles.container} ${styles.containerScan}`}>
        <div className={styles.content}>
          <div className={styles.backSection}>
            <button
              onClick={() => setStep('welcome')}
              className={`${styles.backButton} ${styles.backButtonWarning}`}
            >
              <ArrowLeft className={styles.backIcon} />
              Volver
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={`${styles.iconContainer} ${styles.iconWarning}`}>
                <QrCode className={styles.icon} />
              </div>
              <h2 className={styles.title}>
                Procesar Salida
              </h2>
              <p className={styles.subtitle}>
                Escanea tu código QR o ingrésalo manualmente
              </p>
            </div>

            {error && (
              <div className={styles.errorBox}>
                <p className={styles.errorText}>{error}</p>
              </div>
            )}

            <div className={styles.formGroup}>
              {!scannerActive ? (
                <button
                  onClick={() => setScannerActive(true)}
                  disabled={loading}
                  className={`${styles.button} ${styles.buttonPrimary} ${styles.scanButton}`}
                >
                  <Camera className={styles.buttonIcon} />
                  Activar Cámara
                </button>
              ) : (
                <div>
                  <div id="qr-scanner" className={styles.scannerContainer}></div>
                  <button
                    onClick={() => setScannerActive(false)}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                  >
                    Detener Escáner
                  </button>
                </div>
              )}

              <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <div className={styles.dividerText}>
                  <span>O</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => {
                    setManualToken(e.target.value);
                    setError('');
                  }}
                  placeholder="Código del ticket"
                  className={styles.input}
                />
                
                <button
                  onClick={handleManualExit}
                  disabled={loading || !manualToken.trim()}
                  className={`${styles.button} ${styles.buttonWarning} ${loading || !manualToken.trim() ? styles.buttonDisabled : ''}`}
                >
                  {loading ? (
                    <div className={styles.loadingContainer}>
                      <LoadingSpinner size="sm" />
                      Procesando...
                    </div>
                  ) : (
                    'Procesar Salida'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de salida procesada
  if (step === 'exit') {
    return (
      <div className={`${styles.container} ${styles.containerExit}`}>
        <div className={styles.content}>
          <div className={styles.card}>
            <div className={`${styles.iconContainer} ${styles.iconSuccess}`}>
              <QrCode className={styles.icon} />
            </div>
            
            <h2 className={`${styles.title} ${styles.titleSuccess}`}>
              ¡Salida Procesada!
            </h2>
            <p className={styles.subtitle}>
              Gracias por usar nuestro parqueadero
            </p>

            <div className={styles.ticketSummary}>
              <div className={styles.ticketGrid}>
                <div className={styles.ticketField}>
                  <div className={styles.ticketLabel}>Placa</div>
                  <div className={styles.ticketValue}>{ticket.ticket.plateNumber}</div>
                </div>
                <div className={styles.ticketField}>
                  <div className={styles.ticketLabel}>Tipo</div>
                  <div className={styles.ticketValueSecondary}>
                    {getVehicleTypeLabel(ticket.ticket.vehicleType)}
                  </div>
                </div>
              </div>

              <div className={styles.ticketDetails}>
                <div className={styles.ticketRow}>
                  <span className={styles.ticketRowLabel}>Tiempo total:</span>
                  <span className={styles.ticketRowValue}>{ticket.totalMinutes} minutos</span>
                </div>
                <div className={`${styles.ticketRow} ${styles.ticketRowTotal}`}>
                  <span className={styles.ticketRowLabelBold}>Total a pagar:</span>
                  <span className={styles.ticketRowValueTotal}>
                    ${(ticket.ticket.calculatedFee / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={resetFlow}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Nueva Operación
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}