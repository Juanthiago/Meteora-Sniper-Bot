import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { config } from '../config';
import logger from '../utils/logger';

export class RPCService {
  private connection: Connection;
  private heliusConnection: Connection;

  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed');
    this.heliusConnection = config.solana.heliusRpcUrl
      ? new Connection(config.solana.heliusRpcUrl, 'confirmed')
      : this.connection;
    
    logger.info('RPC Service initialized');
  }

  async getLatestBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    try {
      // Use Helius RPC for getting blockhash (faster)
      const blockhash = await this.heliusConnection.getLatestBlockhash('confirmed');
      return blockhash;
    } catch (error) {
      logger.error('Failed to get latest blockhash:', error);
      // Fallback to regular RPC
      const blockhash = await this.connection.getLatestBlockhash('confirmed');
      return blockhash;
    }
  }

  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    skipPreflight: boolean = false
  ): Promise<string> {
    try {
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight,
          maxRetries: 3,
        }
      );
      return signature;
    } catch (error) {
      logger.error('Failed to send transaction:', error);
      throw error;
    }
  }

  async confirmTransaction(
    signature: string,
    commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
  ): Promise<boolean> {
    try {
      const confirmation = await this.connection.confirmTransaction(
        signature,
        commitment
      );
      return confirmation.value.err === null;
    } catch (error) {
      logger.error(`Failed to confirm transaction ${signature}:`, error);
      return false;
    }
  }

  async getAccountInfo(publicKey: PublicKey) {
    return await this.connection.getAccountInfo(publicKey);
  }

  async getTokenAccountBalance(publicKey: PublicKey) {
    return await this.connection.getTokenAccountBalance(publicKey);
  }

  getConnection(): Connection {
    return this.connection;
  }
}
