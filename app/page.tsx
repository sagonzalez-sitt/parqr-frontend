import Link from 'next/link'
import { Car, Bike, QrCode, BarChart3, LogOut } from 'lucide-react'
import styles from './page.module.css'

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Sistema de Parqueadero
          </h1>
          <p className={styles.subtitle}>
            Gestión eficiente de parqueadero con códigos QR. Sin registro, sin aplicaciones.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Terminal de Entrada */}
          <Link href="/counter" className={styles.cardLink}>
            <div className={styles.card}>
              <div className={`${styles.iconContainer} ${styles.iconSuccess}`}>
                <QrCode size={32} />
              </div>
              <h3 className={styles.cardTitle}>
                Terminal de Entrada
              </h3>
              <p className={styles.cardDescription}>
                Registrar entrada de vehículos y generar código QR
              </p>
            </div>
          </Link>

          {/* Terminal de Salida */}
          <Link href="/exit" className={styles.cardLink}>
            <div className={styles.card}>
              <div className={`${styles.iconContainer} ${styles.iconWarning}`}>
                <LogOut size={32} />
              </div>
              <h3 className={styles.cardTitle}>
                Terminal de Salida
              </h3>
              <p className={styles.cardDescription}>
                Procesar salida y calcular tarifa
              </p>
            </div>
          </Link>

          {/* Dashboard */}
          <Link href="/dashboard" className={styles.cardLink}>
            <div className={styles.card}>
              <div className={`${styles.iconContainer} ${styles.iconPrimary}`}>
                <BarChart3 size={32} />
              </div>
              <h3 className={styles.cardTitle}>
                Dashboard
              </h3>
              <p className={styles.cardDescription}>
                Estadísticas y estado del parqueadero
              </p>
            </div>
          </Link>

          {/* Panel del Operador */}
          <Link href="/operator" className={styles.cardLink}>
            <div className={styles.card}>
              <div className={`${styles.iconContainer} ${styles.iconBlue}`}>
                <QrCode size={32} />
              </div>
              <h3 className={styles.cardTitle}>
                Panel Operador
              </h3>
              <p className={styles.cardDescription}>
                Registrar entrada de vehículos
              </p>
            </div>
          </Link>

          {/* Pantalla del Torniquete */}
          <Link href="/entry-display" className={styles.cardLink}>
            <div className={styles.card}>
              <div className={`${styles.iconContainer} ${styles.iconIndigo}`}>
                <BarChart3 size={32} />
              </div>
              <h3 className={styles.cardTitle}>
                Pantalla Torniquete
              </h3>
              <p className={styles.cardDescription}>
                Simulación de pantalla de entrada
              </p>
            </div>
          </Link>

          {/* Vista de Usuario */}
          <Link href="/user" className={styles.cardLink}>
            <div className={styles.card}>
              <div className={`${styles.iconContainer} ${styles.iconPurple}`}>
                <QrCode size={32} />
              </div>
              <h3 className={styles.cardTitle}>
                Vista de Usuario
              </h3>
              <p className={styles.cardDescription}>
                Simular experiencia móvil del usuario
              </p>
            </div>
          </Link>

          {/* Información */}
          <div className={styles.card}>
            <div className={styles.ratesSection}>
              <h3 className={styles.ratesTitle}>
                Tarifas
              </h3>
              <div className={styles.ratesList}>
                <div className={styles.rateItem}>
                  <div className={styles.rateLabel}>
                    <Car size={16} className={styles.rateIcon} />
                    <span>Carro</span>
                  </div>
                  <span className={styles.ratePrice}>$2.00/hora</span>
                </div>
                <div className={styles.rateItem}>
                  <div className={styles.rateLabel}>
                    <Car size={16} className={styles.rateIcon} />
                    <span>Moto</span>
                  </div>
                  <span className={styles.ratePrice}>$1.00/hora</span>
                </div>
                <div className={styles.rateItem}>
                  <div className={styles.rateLabel}>
                    <Bike size={16} className={styles.rateIcon} />
                    <span>Bicicleta</span>
                  </div>
                  <span className={styles.ratePrice}>$0.50/hora</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}