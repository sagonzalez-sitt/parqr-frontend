// Wrapper para html5-qrcode con mejor manejo de tipos
import { Html5QrcodeScanner } from 'html5-qrcode';

export interface QRScannerConfig {
  fps: number;
  qrbox: { width: number; height: number };
  aspectRatio: number;
}

export interface QRScannerCallbacks {
  onSuccess: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export class QRScanner {
  private scanner: Html5QrcodeScanner | null = null;

  constructor(
    private elementId: string,
    private config: QRScannerConfig,
    private callbacks: QRScannerCallbacks
  ) {}

  start(): void {
    if (typeof window === 'undefined') return;

    this.scanner = new Html5QrcodeScanner(
      this.elementId,
      this.config,
      false
    );

    this.scanner.render(
      this.callbacks.onSuccess,
      this.callbacks.onError || (() => {})
    );
  }

  stop(): void {
    if (this.scanner) {
      this.scanner.clear();
      this.scanner = null;
    }
  }
}