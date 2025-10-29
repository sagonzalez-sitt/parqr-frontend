'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Bike, QrCode } from 'lucide-react';
import { apiService, VehicleEntry } from '@/lib/api';
import { validatePlateNumber, getVehicleTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import QRDisplay from '@/components/QRDisplay';
import styles from './page.module.css';

export default function CounterPage() {
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE' | 'BICYCLE'>('CAR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<any>(null);

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

    try {
      const entryData: VehicleEntry = {
        plateNumber: plateNumber.toUpperCase(),
        vehicleType,
      };

      const response = await apiService.createEntry(entryData);
      setTicket(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleNewEntry = () => {
    setTicket(null);
    setPlateNumber('');
    setError('');
  };

  if (ticket) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.content}>
          <div className={styles.backSection}>
            <Link href="/" className={`${styles.backLink} ${styles.successBackLink}`}>
              <ArrowLeft className={styles.backIcon} />
              Volver al inicio
            </Link>
          </div>

          <QRDisplay
            qrCode={ticket.qrCode}
            verifyUrl={ticket.verifyUrl}
            plateNumber={ticket.ticket.plateNumber}
            vehicleType={getVehicleTypeLabel(ticket.ticket.vehicleType)}
          />

          <div className={styles.centerSection}>
            <button
              onClick={handleNewEntry}
              className={styles.newEntryButton}
            >
              Registrar Nuevo Vehículo
            </button>
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
            <div className={styles.iconContainer}>
              <QrCode className={styles.headerIconSvg} />
            </div>
            <h1 className={styles.title}>
              Terminal de Entrada
            </h1>
            <p className={styles.subtitle}>
              Registre la entrada del vehículo para generar el código QR
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Placa del vehículo */}
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
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                maxLength={10}
                autoComplete="off"
                autoFocus
              />
              {error && (
                <p className={styles.errorMessage}>{error}</p>
              )}
            </div>

            {/* Tipo de vehículo */}
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
                  <QrCode className={styles.buttonIconSvg} />
                  Generar Código QR
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}