# DeMailX Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

**Contract:**
```bash
cd contract
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment

**Contract `.env` file:**
Create `contract/.env` with:
```
WALLET_SECRET_KEY=your_wallet_secret_key_here
JSON_RPC_URL_PUBLIC=https://test.massa.net/api/v2:33035
```

**Frontend `.env` file:**
Create `frontend/.env` with:
```
VITE_CONTRACT_ADDRESS=your_contract_address_here
```

### Step 3: Deploy Contract

```bash
cd contract
npm run deploy
```

Copy the contract address from the output and add it to `frontend/.env`

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📧 Using DeMailX

1. **Connect Wallet**: Enter your wallet secret key on the home page
2. **Register Email**: Go to Settings → Register your email (e.g., `alice@demailx`)
3. **Send Email**: Go to Compose → Enter recipient email → Write message → Send
4. **Check Inbox**: View received messages in the Inbox
5. **Manage Settings**: Configure spam blocking and retention in Settings

## 🔑 Key Features

- **One Email Per Wallet**: Each wallet can only register one email address
- **Encrypted Messages**: Messages are encrypted before storage
- **DeMailX Only**: Can only send to other @demailx addresses
- **On-Chain Storage**: All messages stored on Massa blockchain

## ⚠️ Important Notes

- Keep your wallet secret key secure
- Each wallet can only have ONE email address
- Messages are encrypted but stored on-chain
- Only send to @demailx email addresses

## 🐛 Troubleshooting

**Contract deployment fails:**
- Check your `.env` file has correct `WALLET_SECRET_KEY`
- Ensure you have enough MASSA tokens for deployment

**Frontend can't connect:**
- Verify `VITE_CONTRACT_ADDRESS` in `frontend/.env` matches deployed contract
- Check browser console for errors

**Can't send email:**
- Ensure recipient email exists (check with `emailExists` function)
- Verify recipient email ends with `@demailx`

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the smart contract code in `contract/assembly/contracts/main.ts`
- Customize the UI in `frontend/src/`

