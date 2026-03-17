import { config } from '../config';
import logger from '../utils/logger';

// Note: axios import removed - using fetch API instead for better compatibility

export interface JitoBundle {
  transactions: string[];
}

export class JitoService {
  private jitoRpcUrl: string;

  constructor() {
    this.jitoRpcUrl = config.solana.jitoRpcUrl;
    logger.info('Jito Service initialized');
  }

  async sendBundle(bundle: JitoBundle): Promise<string[]> {
    try {
      // Jito bundle submission endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.jitoRpcUrl}/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bundle),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.info('Bundle submitted to Jito:', data);
      return data.signatures || [];
    } catch (error: any) {
      logger.error('Failed to submit bundle to Jito:', error.message);
      throw error;
    }
  }

  async getBundleStatuses(signatures: string[]): Promise<any[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.jitoRpcUrl}/bundles/statuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signatures }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error: any) {
      logger.error('Failed to get bundle statuses:', error.message);
      return [];
    }
  }

  async waitForBundleConfirmation(
    signatures: string[],
    timeoutMs: number = config.monitoring.confirmationTimeoutMs
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const statuses = await this.getBundleStatuses(signatures);
      
      const allConfirmed = statuses.every(
        (status: any) => status.confirmed || status.finalized
      );

      if (allConfirmed) {
        logger.info('Bundle confirmed:', signatures);
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    logger.warn('Bundle confirmation timeout:', signatures);
    return false;
  }
}
