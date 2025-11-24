// Wallet connection utilities
// Note: Account creation uses massa-web3 Account directly
import { Account } from '@massalabs/massa-web3';
import { getWallets } from '@massalabs/wallet-provider';

const WALLET_KEY_STORAGE = 'demailx_wallet_key';
const WALLET_ADDRESS_STORAGE = 'demailx_wallet_address';

/**
 * Connect wallet using secret key
 * Note: In browser, we store the key and address separately
 * The actual Account object will be created when making transactions
 */
export async function connectWallet(secretKey: string): Promise<{ address: string }> {
  localStorage.setItem(WALLET_KEY_STORAGE, secretKey);
  const account = await Account.fromPrivateKey(secretKey);
  const address = account.address.toString();
  localStorage.setItem(WALLET_ADDRESS_STORAGE, address);
  return { address };
}

/**
 * Connect using a UI wallet (Bearby or MassaStation)
 */
export async function connectWithUiWallet(): Promise<{ address: string, provider: any }> {
  const wallets = await getWallets();
  if (!wallets || wallets.length === 0) {
    throw new Error('No wallet found. Please install Bearby or Massa Station');
  }

  // Prefer Bearby if available, else fallback to first wallet
  const bearby = wallets.find((w: any) => w.name && w.name() === 'BEARBY');
  const wallet = bearby || wallets[0];

  // Bearby supports connect(); MassaStation may not implement it
  if (wallet.connect) {
    await wallet.connect();
  }

  const accounts = await wallet.accounts();
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found in wallet');
  }

  const provider = accounts[0];
  const address = provider.address;
  localStorage.setItem(WALLET_ADDRESS_STORAGE, address);

  return { address, provider };
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
  localStorage.removeItem(WALLET_KEY_STORAGE);
  localStorage.removeItem(WALLET_ADDRESS_STORAGE);
}

/**
 * Get connected wallet address
 */
export function getConnectedAddress(): string | null {
  return localStorage.getItem(WALLET_ADDRESS_STORAGE);
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  return !!localStorage.getItem(WALLET_KEY_STORAGE);
}

/**
 * Get wallet secret key (for internal use)
 */
export function getWalletSecretKey(): string | null {
  return localStorage.getItem(WALLET_KEY_STORAGE);
}
