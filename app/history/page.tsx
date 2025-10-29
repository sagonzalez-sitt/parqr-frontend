'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Car, Bike, Search, Filter, Calendar } from 'lucide-react';
import { apiService, TicketResponse } from '@/lib/api';
import { formatCurrency, formatTime, formatDateTime, getVehicleTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import TicketModal from '@/components/TicketModal';
import styles from './page.module.css';

export default function HistoryPage() {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('ALL');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setError('');
      const response = await apiService.getAllTickets();
      setTickets(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = useCallback(() => {
    let filtered = tickets;

    // Filtrar por término de búsqueda (placa)
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticket?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.ticket?.status === statusFilter);
    }

    // Filtrar por tipo de vehículo
    if (vehicleTypeFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.ticket?.vehicleType === vehicleTypeFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, vehicleTypeFilter]);

  useEffect(() => {
    filterTickets();
  }, [filterTickets]);

  const handleRefresh = () => {
    setLoading(true);
    fetchTickets();
  };

  const handleViewDetails = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'CAR': return Car;
      case 'MOTORCYCLE': return Car;
      case 'BICYCLE': return Bike;
      default: return Car;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return styles.statusActive;
      case 'COMPLETED': return styles.statusCompleted;
      case 'CANCELLED': return styles.statusCancelled;
      default: return 'text-gray-600 bg-gray-100';
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
          <p className={styles.loadingText}>Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Link href="/dashboard" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            Volver al dashboard
          </Link>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={styles.refreshButton}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className={styles.title}>
          <h1 className={styles.mainTitle}>
            Historial de Tickets
          </h1>
          <p className={styles.subtitle}>
            Registro completo de todos los tickets del parqueadero
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <p>{error}</p>
          </div>
        )}

        {/* Filtros */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersGrid}>
            {/* Búsqueda por placa */}
            <div className={styles.inputWrapper}>
              <Search className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Buscar por placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Filtro por estado */}
            <div className={styles.inputWrapper}>
              <Filter className={styles.inputIcon} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.select}
              >
                <option value="ALL">Todos los estados</option>
                <option value="ACTIVE">Activos</option>
                <option value="COMPLETED">Completados</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </div>

            {/* Filtro por tipo de vehículo */}
            <div className={styles.inputWrapper}>
              <Car className={styles.inputIcon} />
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                className={styles.select}
              >
                <option value="ALL">Todos los vehículos</option>
                <option value="CAR">Carros</option>
                <option value="MOTORCYCLE">Motos</option>
                <option value="BICYCLE">Bicicletas</option>
              </select>
            </div>

            {/* Estadísticas rápidas */}
            <div className={styles.statsBox}>
              <div>
                <div className={styles.statsNumber}>{filteredTickets.length}</div>
                <div className={styles.statsLabel}>Tickets</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de tickets */}
        <div className={styles.ticketsCard}>
          <div className={styles.ticketsHeader}>
            <h3 className={styles.ticketsTitle}>
              Tickets ({filteredTickets.length})
            </h3>
          </div>

          {filteredTickets.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar className={styles.emptyIcon} />
              <p>No se encontraron tickets con los filtros aplicados</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Tiempo</th>
                    <th>Tarifa</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => {
                    const VehicleIcon = getVehicleIcon(ticket.ticket.vehicleType);
                    const rates = { CAR: 200, MOTORCYCLE: 100, BICYCLE: 50 };
                    const hours = Math.ceil((ticket.timeElapsed || 0) / 60);
                    const estimatedFee = ticket.ticket.calculatedFee || (hours * (rates[ticket.ticket.vehicleType as keyof typeof rates] || 200));
                    
                    return (
                      <tr key={ticket.ticket.id}>
                        <td className={styles.plateNumber}>
                          {ticket.ticket.plateNumber}
                        </td>
                        <td>
                          <div className={styles.vehicleTypeCell}>
                            <VehicleIcon className={styles.vehicleIcon} />
                            <span className={styles.vehicleTypeLabel}>
                              {getVehicleTypeLabel(ticket.ticket.vehicleType)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusColor(ticket.ticket.status)}`}>
                            {getStatusLabel(ticket.ticket.status)}
                          </span>
                        </td>
                        <td className={styles.timeCell}>
                          {formatDateTime(ticket.ticket.entryTimestamp)}
                        </td>
                        <td className={styles.timeCell}>
                          {ticket.ticket.exitTimestamp ? formatDateTime(ticket.ticket.exitTimestamp) : '-'}
                        </td>
                        <td className={styles.timeCell}>
                          {formatTime(ticket.timeElapsed || 0)}
                        </td>
                        <td className={styles.feeCell}>
                          {formatCurrency(estimatedFee)}
                        </td>
                        <td>
                          <button
                            onClick={() => handleViewDetails(ticket.ticket.id)}
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