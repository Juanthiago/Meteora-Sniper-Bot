import * as dotenv from 'dotenv';

dotenv.config();

export interface Config {
  solana: {
    rpcUrl: string;
    heliusRpcUrl: string;
    jitoRpcUrl: string;
  };
  yellowstone: {
    grpcUrl: string;
    apiKey: string;
  };
  wallet: {
    privateKey: string;
  };
  trading: {
    slippageBps: number;
    maxBuyAmountSol: number;
    minPoolLiquiditySol: number;
    stopLossPercent: number;
    takeProfitPercent: number;
  };
  meteora: {
    dbcProgramId: string;
    dammV1ProgramId: string;
    dammV2ProgramId: string;
    dlmmProgramId: string;
  };
  monitoring: {
    pollIntervalMs: number;
    confirmationTimeoutMs: number;
  };
  logging: {
    level: string;
  };
}

export const config: Config = {
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    heliusRpcUrl: process.env.HELIUS_RPC_URL || '',
    jitoRpcUrl: process.env.JITO_RPC_URL || 'https://mainnet.block-engine.jito.wtf/api/v1/transactions',
  },
  yellowstone: {
    grpcUrl: process.env.YELLOWSTONE_GRPC_URL || 'grpc://api.mainnet-beta.solana.com:10000',
    apiKey: process.env.YELLOWSTONE_API_KEY || '',
  },
  wallet: {
    privateKey: process.env.WALLET_PRIVATE_KEY || '',
  },
  trading: {
    slippageBps: parseInt(process.env.SLIPPAGE_BPS || '500'),
    maxBuyAmountSol: parseFloat(process.env.MAX_BUY_AMOUNT_SOL || '1.0'),
    minPoolLiquiditySol: parseFloat(process.env.MIN_POOL_LIQUIDITY_SOL || '5.0'),
    stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT || '10'),
    takeProfitPercent: parseFloat(process.env.TAKE_PROFIT_PERCENT || '50'),
  },
  meteora: {
    dbcProgramId: process.env.METEORA_DBC_PROGRAM_ID || 'DBcWUzJg37oauX1Rsnmb9DBdXaDb9hPcXCg6h3ttzQvE',
    dammV1ProgramId: process.env.METEORA_DAMM_V1_PROGRAM_ID || '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
    dammV2ProgramId: process.env.METEORA_DAMM_V2_PROGRAM_ID || '2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c',
    dlmmProgramId: process.env.METEORA_DLMM_PROGRAM_ID || 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
  },
  monitoring: {
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '1000'),
    confirmationTimeoutMs: parseInt(process.env.CONFIRMATION_TIMEOUT_MS || '30000'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
