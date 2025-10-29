'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { config } from '@/lib/config';
import styles from './page.module.css';

interface DownloadPageProps {
  params: {
    token: string;
  };
}

export default function DownloadPage({ params }: DownloadPageProps) {
  const [status, setStatus] = useState<'downloading' | 'success' | 'error'>('downloading');
  const [error, setError] = useState('');

  const downloadTicket = useCallback(async () => {
    try {
      setStatus('downloading');
      setError('');

      // Hacer request para descargar la imagen
      const response = await fetch(`${config.api.baseUrl}/parking/ticket/${params.token}/image`);
      
      if (!response.ok) {
        throw new Error('No se pudo descargar el ticket');
      }

      // Obtener el blob de la imagen
      const blob = await response.blob();
      
      // Crear URL para descarga
      const url = URL.createObjectURL(blob);
      
      // Crear elemento de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${params.token}.png`;
      document.body.appendChild(link);
      
      // Iniciar descarga
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus('success');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar el ticket');
      setStatus('error');
    }
  }, [params.token]);

  useEffect(() => {
    downloadTicket();
  }, [downloadTicket]);

  // Vista de descarga
  if (status === 'downloading') {
    return (
      <div className={`${styles.container} ${styles.downloadingContainer}`}>
        <div className={styles.card}>
          <div className={`${styles.iconContainer} ${styles.downloadingIcon}`}>
            <Download className={styles.iconLarge} />
          </div>
          
          <h1 className={`${styles.title} ${styles.downloadingTitle}`}>
            Descargando tu Ticket...
          </h1>
          
          <p className={styles.subtitle}>
            Tu ticket se está descargando automáticamente
          </p>
          
          <div className={styles.spinner}>
            <div className={styles.spinnerElement}></div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de éxito
  if (status === 'success') {
    return (
      <div className={`${styles.container} ${styles.successContainer}`}>
        <div className={styles.card}>
          <div className={`${styles.iconContainer} ${styles.successIcon}`}>
            <CheckCircle className={styles.iconLarge} />
          </div>
          
          <h1 className={`${styles.title} ${styles.successTitle}`}>
            ¡Ticket Descargado!
          </h1>
          
          <p className={styles.subtitle}>
            Tu ticket se ha guardado exitosamente en tu dispositivo
          </p>
          
          <div className={styles.actions}>
            <div className={styles.instructionsBox}>
              <h3 className={styles.instructionsTitle}>Instrucciones:</h3>
              <div className={styles.instructionsList}>
                <div>✓ El ticket se guardó en tu carpeta de Descargas</div>
                <div>✓ También puedes encontrarlo en tu galería de fotos</div>
                <div>✓ Muestra esta imagen al salir del parqueadero</div>
                <div>✓ El operador escaneará el código QR</div>
              </div>
            </div>
            
            <button
              onClick={downloadTicket}
              className={styles.downloadButton}
            >
              <Download className={styles.iconSmall} />
              Descargar de Nuevo
            </button>
          </div>
          
          <div className={styles.tip}>
            <p className={styles.tipText}>
              💡 <strong>Tip:</strong> Si no encuentras el archivo, revisa tu carpeta de Descargas 
              o la galería de tu teléfono. El archivo se llama &quot;ticket-{params.token}.png&quot;
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Vista de error
  return (
    <div className={`${styles.container} ${styles.errorContainer}`}>
      <div className={styles.card}>
        <div className={`${styles.iconContainer} ${styles.errorIcon}`}>
          <AlertCircle className={styles.iconLarge} />
        </div>
        
        <h1 className={`${styles.title} ${styles.errorTitle}`}>
          Error al Descargar
        </h1>
        
        <p className={styles.subtitle}>
          {error}
        </p>
        
        <div className={styles.actions}>
          <button
            onClick={downloadTicket}
            className={styles.retryButton}
          >
            <RefreshCw className={styles.iconSmall} />
            Intentar de Nuevo
          </button>
          
          <div className={styles.errorBox}>
            <h3 className={styles.errorBoxTitle}>Posibles soluciones:</h3>
            <div className={styles.errorBoxList}>
              <div>• Verifica tu conexión a internet</div>
              <div>• Asegúrate de que el código QR sea válido</div>
              <div>• Intenta desde otro navegador</div>
              <div>• Contacta al operador si el problema persiste</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}