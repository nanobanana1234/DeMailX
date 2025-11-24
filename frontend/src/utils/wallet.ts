// Wallet connection utilities
// Note: Account creation uses massa-web3 Account directly
import { Account } from '@massalabs/massa-web3';

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
