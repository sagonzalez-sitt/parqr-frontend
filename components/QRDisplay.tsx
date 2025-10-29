'use client';

import { useState } from 'react';
import { Download, Printer, Copy, Check } from 'lucide-react';
import styles from './QRDisplay.module.css';

interface QRDisplayProps {
  qrCode: string;
  verifyUrl: string;
  plateNumber: string;
  vehicleType: string;
}

export default function QRDisplay({ qrCode, verifyUrl, plateNumber, vehicleType }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `ticket-${plateNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket de Parqueadero - ${plateNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .ticket {
                max-width: 300px;
                margin: 0 auto;
                border: 2px dashed #333;
                padding: 20px;
              }
              .qr-code {
                margin: 20px 0;
              }
              .info {
                margin: 10px 0;
                font-size: 14px;
              }
              .plate {
                font-size: 18px;
                font-weight: bold;
                margin: 15px 0;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="ticket">
              <h2>TICKET DE PARQUEADERO</h2>
              <div class="plate">Placa: ${plateNumber}</div>
              <div class="info">Tipo: ${vehicleType}</div>
              <div class="info">Fecha: ${new Date().toLocaleString('es-CO')}</div>
              <div class="qr-code">
                <img src="${qrCode}" alt="Código QR" style="max-width: 200px;" />
              </div>
              <div class="info">Escanee el código QR para verificar su ticket</div>
              <div class="info" style="font-size: 10px; word-break: break-all;">${verifyUrl}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyUrl = async () => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando URL:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h3 className={styles.title}>
          ¡Ticket Generado!
        </h3>
        
        <div className={styles.qrContainer}>
          <img 
            src={qrCode} 
            alt="Código QR del ticket" 
            className={styles.qrImage}
          />
          
          <div className={styles.infoList}>
            <div><strong>Placa:</strong> {plateNumber}</div>
            <div><strong>Tipo:</strong> {vehicleType}</div>
            <div><strong>Hora:</strong> {new Date().toLocaleString('es-CO')}</div>
          </div>
        </div>

        <div className={styles.buttonGrid}>
          <button
            onClick={handleDownload}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            <Download size={16} />
            Descargar
          </button>
          
          <button
            onClick={handlePrint}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            <Printer size={16} />
            Imprimir
          </button>
          
          <button
            onClick={handleCopyUrl}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copiado
              </>
            ) : (
              <>
                <Copy size={16} />
                Copiar URL
              </>
            )}
          </button>
        </div>

        <div className={styles.instructions}>
          <p className={styles.instructionsTitle}>
            <strong>Instrucciones:</strong>
          </p>
          <p>
            1. Guarde este código QR en su teléfono<br/>
            2. Escanéelo al salir del parqueadero<br/>
            3. También puede acceder en: <br/>
            <span className={styles.urlText}>{verifyUrl}</span>
          </p>
        </div>
      </div>
    </div>
  );
}