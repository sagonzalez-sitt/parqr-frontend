'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Car, Bike, Users, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { apiService, ParkingStatus } from '@/lib/api';
import { formatCurrency, formatTime, formatDateTime, getVehicleTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import TicketModal from '@/components/TicketModal';
import styles from './page.module.css';

export default function DashboardPage() {
  const [status, setStatus] = useState<ParkingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStatus = async () => {
    try {
      setError('');
      const response = await apiService.getParkingStatus();
      setStatus(response);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el estado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'CAR': return Car;
      case 'MOTORCYCLE': return Car; // Usando Car como icono para motos
      case 'BICYCLE': return Bike;
      default: return Car;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchStatus();
  };

  const handleViewDetails = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
  };

  if (loading && !status) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
          <p className={styles.loadingText}>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            Volver al inicio
          </Link>
          
          <div className={styles.headerActions}>
            <span className={styles.lastUpdate}>
              Última actualización: {formatDateTime(lastUpdate)}
            </span>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={styles.refreshButton}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        <div className={styles.title}>
          <h1 className={styles.mainTitle}>
            Dashboard del Parqueadero
          </h1>
          <p className={styles.subtitle}>
            Estado en tiempo real y estadísticas del parqueadero
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <p>{error}</p>
          </div>
        )}

        {status && (
          <>
            {/* Estadísticas principales */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statContent}>
                  <h3>Vehículos Activos</h3>
                  <p style={{color: 'var(--primary-600)'}}>{status.activeVehicles}</p>
                </div>
                <div className={`${styles.statIcon}`} style={{background: 'var(--primary-100)'}}>
                  <Users className={styles.statIconSvg} style={{color: 'var(--primary-600)'}} />
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statContent}>
                  <h3>Entradas Hoy</h3>
                  <p style={{color: 'var(--success-600)'}}>{status.todayStats.totalEntries}</p>
                </div>
                <div className={styles.statIcon} style={{background: 'var(--success-100)'}}>
                  <TrendingUp className={styles.statIconSvg} style={{color: 'var(--success-600)'}} />
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statContent}>
                  <h3>Ingresos Hoy</h3>
                  <p style={{color: 'var(--warning-600)'}}>
                    {formatCurrency(status.todayStats.totalRevenue)}
                  </p>
                </div>
                <div className={styles.statIcon} style={{background: 'var(--warning-100)'}}>
                  <DollarSign className={styles.statIconSvg} style={{color: 'var(--warning-600)'}} />
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statContent}>
                  <h3>Tiempo Promedio</h3>
                  <p style={{color: 'var(--gray-600)'}}>
                    {status.activeTickets.length > 0 
                      ? formatTime(Math.floor(status.activeTickets.reduce((acc, ticket) => acc + ticket.timeElapsed, 0) / status.activeTickets.length))
                      : '0min'
                    }
                  </p>
                </div>
                <div className={styles.statIcon} style={{background: 'var(--gray-100)'}}>
                  <Clock className={styles.statIconSvg} style={{color: 'var(--gray-600)'}} />
                </div>
              </div>
            </div>

            {/* Distribución por tipo de vehículo */}
            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>
                  Vehículos por Tipo
                </h3>
                
                <div className={styles.vehicleTypeList}>
                  {[
                    { type: 'CAR', label: 'Carros', icon: Car, color: 'primary' },
                    { type: 'MOTORCYCLE', label: 'Motos', icon: Car, color: 'success' },
                    { type: 'BICYCLE', label: 'Bicicletas', icon: Bike, color: 'warning' },
                  ].map(({ type, label, icon: Icon, color }) => {
                    const count = status.vehicleTypeCounts[type] || 0;
                    const percentage = status.activeVehicles > 0 ? (count / status.activeVehicles) * 100 : 0;
                    
                    return (
                      <div key={type} className={styles.vehicleTypeItem}>
                        <div className={styles.vehicleTypeInfo}>
                          <div className={styles.vehicleTypeIcon} style={{
                            background: `var(--${color}-100)`,
                            color: `var(--${color}-600)`
                          }}>
                            <Icon className={styles.vehicleIconSvg} />
                          </div>
                          <span className={styles.vehicleTypeLabel}>{label}</span>
                        </div>
                        <div className={styles.vehicleTypeStats}>
                          <div className={styles.vehicleTypeCount}>{count}</div>
                          <div className={styles.vehicleTypePercentage}>{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen rápido */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>
                  Resumen del Día
                </h3>
                
                <div className={styles.summaryList}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Total de entradas:</span>
                    <span className={styles.summaryValue}>{status.todayStats.totalEntries}</span>
                  </div>
                  
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Vehículos activos:</span>
                    <span className={styles.summaryValue}>{status.activeVehicles}</span>
                  </div>
                  
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Salidas procesadas:</span>
                    <span className={styles.summaryValue}>
                      {status.todayStats.totalEntries - status.activeVehicles}
                    </span>
                  </div>
                  
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Ingresos totales:</span>
                    <span className={styles.summaryValue} style={{color: 'var(--success-600)'}}>
                      {formatCurrency(status.todayStats.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de vehículos activos */}
            <div className={styles.activeVehiclesCard}>
              <div className={styles.activeVehiclesHeader}>
                <h3 className={styles.activeVehiclesTitle}>
                  Vehículos Activos ({status.activeVehicles})
                </h3>
                <Link href="/history" className={styles.historyLink}>
                  Ver historial completo
                </Link>
              </div>

              {status.activeTickets.length === 0 ? (
                <div className={styles.emptyState}>
                  <Users className={styles.emptyIcon} />
                  <p>No hay vehículos en el parqueadero actualmente</p>
                </div>
              ) : (
                <div className={styles.vehiclesTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Placa</th>
                        <th>Tipo</th>
                        <th>Entrada</th>
                        <th>Tiempo</th>
                        <th>Tarifa Est.</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.activeTickets.map((ticket) => {
                        const VehicleIcon = getVehicleIcon(ticket.vehicleType);
                        const rates = { CAR: 200, MOTORCYCLE: 100, BICYCLE: 50 };
                        const hours = Math.ceil(ticket.timeElapsed / 60);
                        const estimatedFee = hours * (rates[ticket.vehicleType as keyof typeof rates] || 200);
                        
                        return (
                          <tr key={ticket.id}>
                            <td className={styles.plateNumber}>
                              {ticket.plateNumber}
                            </td>
                            <td>
                              <div className={styles.vehicleTypeCell}>
                                <VehicleIcon className={styles.tableVehicleIcon} />
                                <span className={styles.vehicleTypeLabel}>
                                  {getVehicleTypeLabel(ticket.vehicleType)}
                                </span>
                              </div>
                            </td>
                            <td className={styles.timeCell}>
                              {formatDateTime(ticket.entryTimestamp)}
                            </td>
                            <td className={styles.timeCell}>
                              {formatTime(ticket.timeElapsed)}
                            </td>
                            <td className={styles.feeCell}>
                              {formatCurrency(estimatedFee)}
                            </td>
                            <td>
                              <button
                                onClick={() => handleViewDetails(ticket.id)}
                                className={styles.actionButton}
                              >
                                Ver detalles
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de detalles del ticket */}
      {selectedTicketId && (
        <TicketModal
          ticketId={selectedTicketId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}