'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Car, Bike, Clock, DollarSign, Calendar, Hash } from 'lucide-react';
import { apiService, TicketResponse } from '@/lib/api';
import { formatCurrency, formatTime, formatDateTime, getVehicleTypeLabel } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';
import styles from './TicketModal.module.css';

interface TicketModalProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketModal({ ticketId, isOpen, onClose }: TicketModalProps) {
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTicketDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getTicketById(ticketId);
      setTicket(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicketDetails();
    }
  }, [isOpen, ticketId, fetchTicketDetails]);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'CAR': return Car;
      case 'MOTORCYCLE': return Car;
      case 'BICYCLE': return Bike;
      default: return Car;
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'ACTIVE': return styles.statusActive;
      case 'COMPLETED': return styles.statusCompleted;
      case 'CANCELLED': return styles.statusCancelled;
      default: return styles.statusActive;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Detalles del Ticket</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p className={styles.errorText}>{error}</p>
              <button
                onClick={fetchTicketDetails}
                className={styles.retryButton}
              >
                Reintentar
              </button>
            </div>
          )}

          {ticket && (
            <div className={styles.details}>
              {/* Estado y ID */}
              <div className={styles.statusRow}>
                <div className={styles.statusInfo}>
                  <Hash size={16} className={styles.statusIcon} />
                  <span className={styles.statusLabel}>ID:</span>
                  <span className={styles.statusId}>
                    {ticket.ticket.id}
                  </span>
                </div>
                <span className={`${styles.statusBadge} ${getStatusColorClass(ticket.ticket.status)}`}>
                  {getStatusLabel(ticket.ticket.status)}
                </span>
              </div>

              {/* Información del vehículo */}
              <div className={styles.vehicleInfo}>
                <div className={styles.vehicleIcon}>
                  {(() => {
                    const VehicleIcon = getVehicleIcon(ticket.ticket.vehicleType);
                    return <VehicleIcon size={48} />;
                  })()}
                </div>
                
                <div className={styles.vehicleGrid}>
                  <div className={styles.vehicleField}>
                    <div className={styles.vehicleFieldLabel}>Placa</div>
                    <div className={styles.vehicleFieldValue}>{ticket.ticket.plateNumber}</div>
                  </div>
                  <div className={styles.vehicleField}>
                    <div className={styles.vehicleFieldLabel}>Tipo</div>
                    <div className={styles.vehicleFieldValueSecondary}>
                      {getVehicleTypeLabel(ticket.ticket.vehicleType)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de tiempo */}
              <div className={styles.timeInfo}>
                <div className={styles.timeRow}>
                  <Calendar size={20} className={styles.timeIcon} />
                  <div className={styles.timeDetails}>
                    <div className={styles.timeLabel}>Entrada</div>
                    <div className={styles.timeValue}>{formatDateTime(ticket.ticket.entryTimestamp)}</div>
                  </div>
                </div>

                {ticket.ticket.exitTimestamp && (
                  <div className={styles.timeRow}>
                    <Calendar size={20} className={styles.timeIcon} />
                    <div className={styles.timeDetails}>
                      <div className={styles.timeLabel}>Salida</div>
                      <div className={styles.timeValue}>{formatDateTime(ticket.ticket.exitTimestamp)}</div>
                    </div>
                  </div>
                )}

                <div className={styles.timeRow}>
                  <Clock size={20} className={styles.timeIcon} />
                  <div className={styles.timeDetails}>
                    <div className={styles.timeLabel}>Tiempo transcurrido</div>
                    <div className={styles.timeValueLarge}>{formatTime(ticket.timeElapsed || 0)}</div>
                  </div>
                </div>

                <div className={styles.timeRow}>
                  <DollarSign size={20} className={styles.timeIcon} />
                  <div className={styles.timeDetails}>
                    <div className={styles.timeLabel}>
                      {ticket.ticket.status === 'COMPLETED' ? 'Tarifa total' : 'Tarifa estimada'}
                    </div>
                    <div className={styles.feeValue}>
                      {formatCurrency(ticket.estimatedFee || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Token */}
              <div className={styles.tokenSection}>
                <div className={styles.tokenLabel}>Token QR</div>
                <div className={styles.tokenValue}>
                  {ticket.ticket.qrToken}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}