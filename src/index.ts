import { PublicKey } from '@solana/web3.js';
import { config } from './config';
import logger from './utils/logger';
import { YellowstoneClient } from './services/yellowstone';
import { RPCService } from './services/rpc';
import { JitoService } from './services/jito';
import { MeteoraService } from './services/meteora';
import { WalletService } from './services/wallet';
import { PositionManager } from './services/positionManager';
import { MeteoraPoolType, Position } from './types';

class MeteoraSniperBot {
  private yellowstoneClient: YellowstoneClient;
  private rpcService: RPCService;
  private jitoService: JitoService;
  private meteoraService: MeteoraService;
  private walletService: WalletService;
  private positionManager: PositionManager;
  private isRunning: boolean = false;
  private processedPools: Set<string> = new Set();

  constructor() {
    this.yellowstoneClient = new YellowstoneClient();
    this.rpcService = new RPCService();
    this.jitoService = new JitoService();
    this.meteoraService = new MeteoraService(this.rpcService, this.jitoService);
    this.walletService = new WalletService();
    this.positionManager = new PositionManager(
      this.meteoraService,
      this.walletService
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Bot is already running');
      return;
    }

    logger.info('Starting Meteora Sniper Bot...');
    logger.info(`Wallet: ${this.walletService.getPublicKey().toString()}`);
    logger.info(`Max Buy Amount: ${config.trading.maxBuyAmountSol} SOL`);
    logger.info(`Stop Loss: ${config.trading.stopLossPercent}%`);
    logger.info(`Take Profit: ${config.trading.takeProfitPercent}%`);

    try {
      // Connect to Yellowstone gRPC
      await this.yellowstoneClient.connect();

      // Start monitoring positions
      this.positionManager.startMonitoring();

      // Subscribe to new Meteora pools
      await this.yellowstoneClient.subscribeToMeteoraPools(
        async (poolAddress: PublicKey, poolType: MeteoraPoolType) => {
          await this.handleNewPool(poolAddress, poolType);
        }
      );

      this.isRunning = true;
      logger.info('Bot started successfully');

      // Keep the process alive
      process.on('SIGINT', () => this.stop());
      process.on('SIGTERM', () => this.stop());
    } catch (error) {
      logger.error('Failed to start bot:', error);
      throw error;
    }
  }

  private async handleNewPool(
    poolAddress: PublicKey,
    poolType: MeteoraPoolType
  ): Promise<void> {
    const poolKey = poolAddress.toString();

    // Skip if already processed
    if (this.processedPools.has(poolKey)) {
      return;
    }

    this.processedPools.add(poolKey);
    logger.info(`New pool detected: ${poolKey}, Type: ${poolType}`);

    try {
      // Detect and validate pool
      const pool = await this.meteoraService.detectNewPool(
        poolAddress,
        poolType
      );

      if (!pool) {
        logger.info(`Pool ${poolKey} validation failed or insufficient liquidity`);
        return;
      }

      // Execute buy immediately
      const wallet = this.walletService.getKeypair();
      const buyAmount = config.trading.maxBuyAmountSol;

      logger.info(`Executing buy for pool ${poolKey}...`);
      const buyResult = await this.meteoraService.buyToken(
        wallet,
        pool,
        buyAmount
      );

      if (!buyResult.success) {
        logger.error(`Buy failed for pool ${poolKey}: ${buyResult.error}`);
        return;
      }

      logger.info(`Buy successful: ${buyResult.signature}`);

      // Get current price (simplified - would need actual price calculation)
      const currentPrice = await this.meteoraService.getTokenPrice(pool);
      
      // Calculate stop loss and take profit prices
      const stopLossPrice =
        currentPrice * (1 - config.trading.stopLossPercent / 100);
      const takeProfitPrice =
        currentPrice * (1 + config.trading.takeProfitPercent / 100);

      // Create position
      const position: Position = {
        pool: pool,
        tokenMint: this.meteoraService.getTokenToBuy(pool),
        amount: buyAmount, // Simplified - would need actual token amount
        buyPrice: currentPrice,
        buyTimestamp: new Date(),
        stopLossPrice,
        takeProfitPrice,
      };

      // Add position for monitoring
      this.positionManager.addPosition(position);

      logger.info(
        `Position created: Pool ${poolKey}, Buy Price: ${currentPrice}, SL: ${stopLossPrice}, TP: ${takeProfitPrice}`
      );
    } catch (error) {
      logger.error(`Error handling new pool ${poolKey}:`, error);
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.info('Stopping bot...');
    this.isRunning = false;

    this.positionManager.stopMonitoring();
    this.yellowstoneClient.disconnect();

    logger.info('Bot stopped');
    process.exit(0);
  }
}

// Start the bot
async function main() {
  const bot = new MeteoraSniperBot();
  
  try {
    await bot.start();
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
