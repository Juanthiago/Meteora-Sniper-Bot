import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { config } from '../config';
import logger from '../utils/logger';

export class WalletService {
  private keypair: Keypair;

  constructor() {
    if (!config.wallet.privateKey) {
      throw new Error('WALLET_PRIVATE_KEY is not set in environment variables');
    }

    try {
      const privateKeyBytes = bs58.decode(config.wallet.privateKey);
      this.keypair = Keypair.fromSecretKey(privateKeyBytes);
      logger.info(`Wallet initialized: ${this.keypair.publicKey.toString()}`);
    } catch (error) {
      logger.error('Failed to initialize wallet:', error);
      throw new Error('Invalid wallet private key');
    }
  }

  getKeypair(): Keypair {
    return this.keypair;
  }

  getPublicKey() {
    return this.keypair.publicKey;
  }
}
