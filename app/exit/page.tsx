'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { QRScanner } from '@/lib/qr-scanner';
import { apiService, TicketResponse } from '@/lib/api';
import { formatCurrency, formatTime, formatDateTime, getVehicleTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './page.module.css';

export default function ExitPage() {
  const [scannerActive, setScannerActive] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exitResult, setExitResult] = useState<TicketResponse | null>(null);
  const scannerRef = useRef<QRScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const startScanner = () => {
    if (typeof window === 'undefined') return;
    setScannerActive(true);
    setError('');
    
    const scanner = new QRScanner(
      'qr-scanner',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      {
        onSuccess: (decodedText) => {
          // Extraer token de la URL
          const urlMatch = decodedText.match(/\/verify\/([^\/\?]+)/);
          const token = urlMatch ? urlMatch[1] : decodedText;
          
          scanner.stop();
          setScannerActive(false);
          processExit(token);
        },
        onError: (error) => {
          // Ignorar errores de escaneo continuo
          console.log('Scanner error:', error);
        }
      }
    );

    scanner.start();
    scannerRef.current = scanner;
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  const processExit = async (token: string) => {
    if (!token.trim()) {
      setError('Por favor ingrese o escanee un código QR válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.processExit(token.trim());
      setExitResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la salida');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processExit(manualToken);
  };

  const handleNewExit = () => {
    setExitResult(null);
    setManualToken('');
    setError('');
  };

  if (exitResult) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.content}>
          <div className={styles.backSection}>
            <Link href="/" className={`${styles.backLink} ${styles.successBackLink}`}>
              <ArrowLeft className={styles.backIcon} />
              Volver al inicio
            </Link>
          </div>

          <div className={styles.card}>
            <div className={styles.successHeader}>
              <div className={styles.successIconLarge}>
                <CheckCircle className={styles.successIconSvg} />
              </div>
              <h1 className={styles.successTitle}>
                ¡Salida Procesada!
              </h1>
              <p className={styles.subtitle}>
                El vehículo ha salido exitosamente del parqueadero
              </p>
            </div>

            {/* Resumen del ticket */}
            <div className={styles.ticketSummary}>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>Placa</div>
                  <div className={styles.summaryValue}>{exitResult.ticket.plateNumber}</div>
                </div>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>Tipo</div>
                  <div className={styles.summaryValueLarge}>
                    {getVehicleTypeLabel(exitResult.ticket.vehicleType)}
                  </div>
                </div>
              </div>

              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryRowLabel}>Entrada:</span>
                  <span className={styles.summaryRowValue}>{formatDateTime(exitResult.ticket.entryTimestamp)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryRowLabel}>Salida:</span>
                  <span className={styles.summaryRowValue}>{formatDateTime(exitResult.ticket.exitTimestamp!)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryRowLabel}>Tiempo total:</span>
                  <span className={styles.summaryRowValue}>{formatTime(exitResult.totalMinutes || 0)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
                  <span className={styles.summaryRowLabel}>Total a pagar:</span>
                  <span className={styles.summaryRowValue}>
                    {formatCurrency(exitResult.ticket.calculatedFee || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.centerSection}>
              <button
                onClick={handleNewExit}
                className={styles.newExitButton}
              >
                Procesar Nueva Salida
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className={`${styles.iconContainer} ${styles.warningIcon}`}>
              <QrCode className={styles.headerIconSvg} />
            </div>
            <h1 className={styles.title}>
              Terminal de Salida
            </h1>
            <p className={styles.subtitle}>
              Escanee el código QR o ingrese el código manualmente
            </p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle className={styles.errorIcon} />
              <div className={styles.errorContent}>
                <h3>Error</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className={styles.sections}>
            {/* Escáner QR */}
            <div>
              <h3>Opción 1: Escanear Código QR</h3>
              
              {!scannerActive ? (
                <button
                  onClick={startScanner}
                  disabled={loading}
                  className={styles.scannerButton}
                >
                  <Camera className={styles.buttonIconSvg} />
                  Activar Cámara
                </button>
              ) : (
                <div className={styles.scannerContainer}>
                  <div id="qr-scanner"></div>
                  <button
                    onClick={stopScanner}
                    className={styles.stopButton}
                  >
                    Detener Escáner
                  </button>
                </div>
              )}
            </div>

            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <div className={styles.dividerText}>
                <span>O</span>
              </div>
            </div>

            {/* Entrada manual */}
            <div>
              <h3>Opción 2: Código Manual</h3>
              
              <form onSubmit={handleManualSubmit} className={styles.manualForm}>
                <div className={styles.inputGroup}>
                  <label htmlFor="manualToken">
                    Código del Ticket
                  </label>
                  <input
                    type="text"
                    id="manualToken"
                    value={manualToken}
                    onChange={(e) => {
                      setManualToken(e.target.value);
                      setError('');
                    }}
                    placeholder="Ingrese el código del ticket"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !manualToken.trim()}
                  className={styles.submitButton}
                >
                  {loading ? (
                    <div className={styles.loadingContent}>
                      <LoadingSpinner size="sm" />
                      Procesando Salida...
                    </div>
                  ) : (
                    'Procesar Salida'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className={styles.tip}>
            <p className={styles.tipText}>
              💡 <strong>Tip:</strong> El código QR contiene toda la información necesaria. 
              Si no puede escanearlo, puede encontrar el código en la URL del ticket.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}