# DeMailX Deployment Guide

## 🚀 Complete Deployment Steps

### Prerequisites
- Node.js >= 16
- npm or yarn
- Massa wallet with testnet tokens
- Your wallet secret key

---

## Step 1: Smart Contract Deployment

### 1.1 Navigate to Contract Folder
```bash
cd contract
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Create Environment File
Create a `.env` file in the `contract` folder:
```env
WALLET_SECRET_KEY=your_wallet_secret_key_here
JSON_RPC_URL_PUBLIC=https://test.massa.net/api/v2:33035
```

**⚠️ Important:** Replace `your_wallet_secret_key_here` with your actual Massa wallet secret key.

### 1.4 Build the Contract
```bash
npm run build
```

This compiles the contract to WebAssembly. You should see:
```
1 files to compile
contract to compile assembly\contracts\main.ts
```

### 1.5 Deploy the Contract
```bash
npm run deploy
```

**Expected Output:**
```
✅ DeMailX contract deployed at: ASxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
📝 Save this address for frontend configuration: ASxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ CRITICAL:** Copy the contract address! You'll need it for the frontend.

---

## Step 2: Frontend Setup

### 2.1 Navigate to Frontend Folder
```bash
cd ../frontend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Create Environment File
Create a `.env` file in the `frontend` folder:
```env
VITE_CONTRACT_ADDRESS=ASxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Important:** Replace `ASxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with the contract address from Step 1.5.

### 2.4 Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 2.5 Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

---

## Step 3: Using DeMailX

### 3.1 First Time Setup
1. Open the app in your browser
2. You'll see the splash screen, then the home page
3. Enter your wallet secret key
4. Click "Connect Wallet & Get Mail"

### 3.2 Register Your Email
1. After connecting, you'll be redirected to the dashboard
2. Go to **Settings**
3. Enter a username (e.g., `alice`)
4. Click "Register Email"
5. Your email will be: `alice@demailx`

### 3.3 Send Your First Email
1. Go to **Compose**
2. Enter recipient email (must be `@demailx`)
3. Enter subject and message
4. Click "Send Message"

### 3.4 Check Your Inbox
1. Go to **Inbox** to see received messages
2. Click on any message to read it
3. Use filters: All, Unread, Spam

---

## Step 4: Production Deployment

### Option A: Deploy Frontend to Vercel/Netlify

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy `dist` folder** to your hosting service

3. **Set environment variable:**
   - Add `VITE_CONTRACT_ADDRESS` in your hosting platform's environment variables

### Option B: Deploy to DeWeb (Massa)

1. Follow Massa's DeWeb deployment guide
2. Upload the `dist` folder contents
3. Configure the contract address

---

## 🔧 Troubleshooting

### Contract Deployment Fails
- **Error:** "Insufficient funds"
  - **Solution:** Ensure your wallet has enough MASSA tokens for deployment (at least 0.01 MASSA)

- **Error:** "Invalid secret key"
  - **Solution:** Check your `.env` file has the correct `WALLET_SECRET_KEY`

### Frontend Can't Connect
- **Error:** "No wallet connected"
  - **Solution:** Make sure you've entered your wallet secret key on the home page

- **Error:** "Contract address not found"
  - **Solution:** Verify `VITE_CONTRACT_ADDRESS` in `frontend/.env` matches your deployed contract

### Can't Send Emails
- **Error:** "Recipient email not found"
  - **Solution:** Ensure the recipient has registered their email address

- **Error:** "Recipient must be a DeMailX email"
  - **Solution:** Emails can only be sent to `@demailx` addresses

---

## 📋 Checklist

Before going live, ensure:

- [ ] Contract deployed successfully
- [ ] Contract address saved and added to frontend `.env`
- [ ] Frontend builds without errors
- [ ] Can connect wallet
- [ ] Can register email
- [ ] Can send email to another user
- [ ] Can receive and read emails
- [ ] Spam filtering works
- [ ] Settings can be updated

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly** with multiple wallets
2. **Share your contract address** with other users
3. **Monitor contract events** for activity
4. **Gather user feedback** for improvements
5. **Consider adding features:**
   - Email attachments
   - Rich text formatting
   - Email search
   - Contact list

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure you're using the correct network (Buildnet/Testnet)
4. Check that your wallet has sufficient balance

---

## 🔐 Security Notes

- **Never commit** `.env` files to version control
- **Never share** your wallet secret key
- **Use testnet** for development and testing
- **Backup** your wallet secret key securely
- **Verify** contract address before using in production

---

**Congratulations!** 🎉 Your DeMailX is now deployed and ready to use!

