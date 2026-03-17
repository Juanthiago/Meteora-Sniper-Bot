# Meteora Sniper Bot

A high-performance Solana trading bot that automatically snipes new liquidity pools on Meteora DEX (DBC, DAMM v1, v2, DLMM) and executes trades with stop loss and take profit functionality.

## Features

- 🎯 **Instant Pool Detection**: Monitors Meteora DEX for new pool creation using Yellowstone gRPC streaming
- ⚡ **Fast Execution**: Uses Helius RPC for blockhash retrieval and Jito for transaction confirmation
- 🛡️ **Risk Management**: Built-in stop loss and take profit mechanisms
- 📊 **Multi-Pool Support**: Supports all Meteora pool types (DBC, DAMM v1, DAMM v2, DLMM)
- 🔄 **Position Monitoring**: Continuous monitoring of open positions with automatic sell execution

## Architecture

- **Yellowstone gRPC**: Real-time transaction streaming for pool detection
- **Helius RPC**: Fast blockhash retrieval for transaction building
- **Jito**: Transaction bundle submission for faster confirmation
- **TypeScript**: Type-safe implementation with modern ES2020 features

## Prerequisites

- Node.js 18+ and npm/yarn
- Solana wallet with SOL for trading
- Yellowstone gRPC API key (optional, for enhanced streaming)
- Helius RPC API key (recommended for better performance)
- Jito RPC access

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Meteora-Sniper-Bot
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Edit `.env` with your configuration:

```env
# Solana Network Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
JITO_RPC_URL=https://mainnet.block-engine.jito.wtf/api/v1/transactions

# Yellowstone gRPC Configuration
YELLOWSTONE_GRPC_URL=grpc://api.mainnet-beta.solana.com:10000
YELLOWSTONE_API_KEY=YOUR_YELLOWSTONE_API_KEY

# Wallet Configuration (Base58 encoded private key)
WALLET_PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY_BASE58

# Trading Configuration
SLIPPAGE_BPS=500                    # Slippage in basis points (500 = 5%)
MAX_BUY_AMOUNT_SOL=1.0              # Maximum SOL amount per trade
MIN_POOL_LIQUIDITY_SOL=5.0          # Minimum pool liquidity to trade

# Stop Loss & Take Profit (in percentage)
STOP_LOSS_PERCENT=10                # Stop loss at -10%
TAKE_PROFIT_PERCENT=50              # Take profit at +50%

# Monitoring Configuration
POLL_INTERVAL_MS=1000               # Position check interval
CONFIRMATION_TIMEOUT_MS=30000       # Transaction confirmation timeout

# Logging
LOG_LEVEL=info
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## How It Works

1. **Pool Detection**: The bot subscribes to Meteora program accounts via Yellowstone gRPC and detects new pool creations in real-time.

2. **Pool Validation**: When a new pool is detected, the bot validates:
   - Pool liquidity meets minimum requirements
   - Pool structure is valid
   - Token information is available

3. **Instant Buy**: Upon validation, the bot immediately executes a buy order:
   - Retrieves latest blockhash from Helius RPC
   - Builds swap transaction
   - Submits via Jito for fast confirmation

4. **Position Management**: After a successful buy:
   - Position is tracked with buy price
   - Stop loss and take profit levels are calculated
   - Continuous monitoring begins

5. **Automatic Sell**: The bot monitors positions and automatically sells when:
   - Stop loss threshold is reached
   - Take profit threshold is reached

## Project Structure

```
Meteora-Sniper-Bot/
├── src/
│   ├── config.ts                 # Configuration management
│   ├── index.ts                  # Main bot entry point
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── services/
│   │   ├── yellowstone.ts        # Yellowstone gRPC client
│   │   ├── rpc.ts                # RPC service (Helius integration)
│   │   ├── jito.ts               # Jito bundle submission
│   │   ├── meteora.ts            # Meteora DEX integration
│   │   ├── wallet.ts             # Wallet management
│   │   └── positionManager.ts    # Position tracking & monitoring
│   └── utils/
│       └── logger.ts             # Logging utility
├── dist/                         # Compiled JavaScript (generated)
├── logs/                         # Log files (generated)
├── package.json
├── tsconfig.json
├── .gitignore
├── env.example
└── README.md
```

## Important Notes

### Meteora IDL Integration Required

The current implementation includes placeholder methods for swap instruction creation. To fully function, you need to:

1. **Obtain Meteora Program IDLs**: Get the IDL (Interface Definition Language) files for each Meteora program:
   - DBC Program
   - DAMM v1 Program
   - DAMM v2 Program
   - DLMM Program

2. **Generate TypeScript Types**: Use Anchor to generate TypeScript types from the IDLs:
```bash
anchor build
```

3. **Implement Swap Instructions**: Update `createSwapInstruction()` and `createSellInstruction()` methods in `src/services/meteora.ts` with actual instruction building logic.

### Yellowstone gRPC Setup

The Yellowstone gRPC client is a simplified implementation. For production use:

1. **Generate Proto Files**: Download Yellowstone's proto files and generate TypeScript types:
```bash
# Example (adjust based on Yellowstone's actual proto files)
protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out=./src/proto \
  yellowstone.proto
```

2. **Update Client**: Replace the placeholder client in `src/services/yellowstone.ts` with the generated client.

### Security Considerations

- **Never commit your `.env` file** - It contains your private key
- **Use a dedicated trading wallet** - Don't use your main wallet
- **Set appropriate limits** - Configure `MAX_BUY_AMOUNT_SOL` based on your risk tolerance
- **Monitor logs** - Regularly check logs for errors and unexpected behavior
- **Test on devnet first** - Before using on mainnet, test thoroughly on devnet

## Troubleshooting

### Connection Issues
- Verify your RPC URLs are correct and accessible
- Check if your API keys are valid
- Ensure network connectivity

### Transaction Failures
- Check wallet balance (SOL for fees)
- Verify slippage settings are appropriate
- Check if pool has sufficient liquidity
- Review transaction logs for specific errors

### Pool Detection Issues
- Verify Yellowstone gRPC connection
- Check if Meteora program IDs are correct
- Ensure account subscription is working

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All new features include proper error handling
- Logging is comprehensive
- Documentation is updated

## License

MIT License - see LICENSE file for details

## Disclaimer

This bot is for educational purposes. Trading cryptocurrencies involves significant risk. Use at your own risk. The authors are not responsible for any financial losses incurred while using this bot.

## Support

For issues and questions:
- Check the logs in `logs/` directory
- Review configuration in `.env`
- Ensure all dependencies are installed correctly
