# DeMailX - Decentralized Email on Massa Blockchain

DeMailX is a fully decentralized email system built on the Massa blockchain. Each wallet gets one unique email address, and all messages are stored on-chain with optional encryption.

## Features

- ✅ **One Email Per Wallet** - Each Massa wallet can register one unique email address
- ✅ **End-to-End Encryption** - Messages are encrypted before being stored on-chain
- ✅ **Fully Decentralized** - No servers, no central authority
- ✅ **Instant Delivery** - Send and receive emails instantly within DeMailX network
- ✅ **Spam Protection** - Built-in spam filtering and blocking
- ✅ **Auto Cleanup** - Automatic message cleanup and archiving
- ✅ **Beautiful UI** - Modern, responsive interface

## Project Structure

```
DeMailX/
├── contract/          # Massa smart contracts
│   ├── assembly/
│   │   └── contracts/
│   │       └── main.ts    # Main DeMailX contract
│   └── src/
│       └── deploy.ts      # Deployment script
└── frontend/         # React frontend
    └── src/
        ├── pages/        # Page components
        ├── components/   # UI components
        └── utils/        # Utilities (contract, wallet, encryption)
```

## Setup Instructions

### Prerequisites

- Node.js >= 16
- npm or yarn
- Massa wallet (Massa Station or Bearby)

### 1. Smart Contract Setup

```bash
cd contract
npm install
```

Create a `.env` file in the `contract` folder:

```env
WALLET_SECRET_KEY=your_wallet_secret_key_here
JSON_RPC_URL_PUBLIC=https://test.massa.net/api/v2:33035
```

Build and deploy the contract:

```bash
npm run build
npm run deploy
```

After deployment, copy the contract address and add it to the frontend `.env` file.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_CONTRACT_ADDRESS=your_deployed_contract_address_here
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Connect Wallet**: On the home page, enter your wallet secret key and click "Connect Wallet & Get Mail"
2. **Register Email**: If you don't have an email yet, go to Settings and register one (e.g., `username@demailx`)
3. **Send Email**: Use the Compose page to send encrypted emails to other DeMailX users
4. **View Inbox**: Check your inbox for received messages
5. **Manage Settings**: Configure spam blocking and message retention in Settings

## Smart Contract Functions

### Email Registration
- `registerEmail(username)` - Register an email address for your wallet
- `getEmailByAddress(address)` - Get email for an address
- `getAddressByEmail(email)` - Get address for an email
- `emailExists(email)` - Check if email exists

### Messaging
- `createMessage(from, to, subject, bodyRef, isEncrypted)` - Create a message
- `sendMessage(toAddress, messageId)` - Send message to recipient
- `getMessage(messageId)` - Get message details
- `getInbox(address)` - Get inbox message IDs
- `getSent(address)` - Get sent message IDs

### Inbox Management
- `markAsRead(messageId)` - Mark message as read
- `markAsSpam(messageId)` - Mark message as spam
- `archiveMessage(messageId)` - Archive message

### Settings
- `setSpamList(addresses)` - Set spam block list
- `setMaxInboxDays(days)` - Set inbox retention days
- `setMaxSpamDays(days)` - Set spam retention days

## Security Notes

- **Encryption**: Messages are encrypted using a simple XOR cipher (for demo). In production, use proper AES encryption.
- **Private Keys**: Never share your wallet secret key. Store it securely.
- **On-Chain Data**: Message metadata (subject, timestamps) are stored on-chain. Encrypted message bodies are also stored on-chain.

## Development

### Build Contracts
```bash
cd contract
npm run build
```

### Test Contracts
```bash
cd contract
npm run test
```

### Build Frontend
```bash
cd frontend
npm run build
```

## License

MIT

## Support

For issues and questions, please open an issue on the repository.

