import { PublicKey } from '@solana/web3.js';

export enum MeteoraPoolType {
  DBC = 'DBC',
  DAMM_V1 = 'DAMM_V1',
  DAMM_V2 = 'DAMM_V2',
  DLMM = 'DLMM',
}

export interface MeteoraPool {
  address: PublicKey;
  type: MeteoraPoolType;
  tokenA: PublicKey;
  tokenB: PublicKey;
  liquidity: number;
  createdAt: Date;
}

export interface Position {
  pool: MeteoraPool;
  tokenMint: PublicKey;
  amount: number;
  buyPrice: number;
  buyTimestamp: Date;
  stopLossPrice: number;
  takeProfitPrice: number;
}

export interface TradeResult {
  success: boolean;
  signature?: string;
  error?: string;
}
