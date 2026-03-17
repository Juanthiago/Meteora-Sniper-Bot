import { PublicKey } from '@solana/web3.js';
import { Position } from '../types';
import { config } from '../config';
import logger from '../utils/logger';
import { MeteoraService } from './meteora';
import { WalletService } from './wallet';

export class PositionManager {
  private positions: Map<string, Position> = new Map();
  private meteoraService: MeteoraService;
  private walletService: WalletService;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(meteoraService: MeteoraService, walletService: WalletService) {
    this.meteoraService = meteoraService;
    this.walletService = walletService;
  }

  addPosition(position: Position): void {
    const key = position.pool.address.toString();
    this.positions.set(key, position);
    logger.info(`Position added: ${key}, Buy Price: ${position.buyPrice}`);
  }

  removePosition(poolAddress: PublicKey): void {
    const key = poolAddress.toString();
    this.positions.delete(key);
    logger.info(`Position removed: ${key}`);
  }

  getPosition(poolAddress: PublicKey): Position | undefined {
    return this.positions.get(poolAddress.toString());
  }

  getAllPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  startMonitoring(): void {
    if (this.monitoringInterval) {
      return;
    }

    logger.info('Starting position monitoring...');
    this.monitoringInterval = setInterval(async () => {
      await this.checkPositions();
    }, config.monitoring.pollIntervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Position monitoring stopped');
    }
  }

  private async checkPositions(): Promise<void> {
    const positions = this.getAllPositions();
    
    for (const position of positions) {
      try {
        // Get current price from pool
        const currentPrice = await this.meteoraService.getTokenPrice(position.pool);

        if (currentPrice === 0) {
          continue; // Skip if price unavailable
        }

        const priceChangePercent =
          ((currentPrice - position.buyPrice) / position.buyPrice) * 100;

        // Check stop loss
        if (currentPrice <= position.stopLossPrice) {
          logger.warn(
            `Stop loss triggered for position ${position.pool.address.toString()}: ${priceChangePercent.toFixed(2)}%`
          );
          await this.executeStopLoss(position);
          continue;
        }

        // Check take profit
        if (currentPrice >= position.takeProfitPrice) {
          logger.info(
            `Take profit triggered for position ${position.pool.address.toString()}: ${priceChangePercent.toFixed(2)}%`
          );
          await this.executeTakeProfit(position);
          continue;
        }

        logger.debug(
          `Position ${position.pool.address.toString()}: ${priceChangePercent.toFixed(2)}% (SL: ${position.stopLossPrice}, TP: ${position.takeProfitPrice})`
        );
      } catch (error) {
        logger.error(
          `Error checking position ${position.pool.address.toString()}:`,
          error
        );
      }
    }
  }

  private async executeStopLoss(position: Position): Promise<void> {
    try {
      const wallet = this.walletService.getKeypair();

      const result = await this.meteoraService.sellToken(
        wallet,
        position.pool,
        position.amount
      );

      if (result.success) {
        this.removePosition(position.pool.address);
        logger.info(`Stop loss executed: ${result.signature}`);
      } else {
        logger.error(`Stop loss failed: ${result.error}`);
      }
    } catch (error) {
      logger.error('Failed to execute stop loss:', error);
    }
  }

  private async executeTakeProfit(position: Position): Promise<void> {
    try {
      const wallet = this.walletService.getKeypair();

      const result = await this.meteoraService.sellToken(
        wallet,
        position.pool,
        position.amount
      );

      if (result.success) {
        this.removePosition(position.pool.address);
        logger.info(`Take profit executed: ${result.signature}`);
      } else {
        logger.error(`Take profit failed: ${result.error}`);
      }
    } catch (error) {
      logger.error('Failed to execute take profit:', error);
    }
  }
}
