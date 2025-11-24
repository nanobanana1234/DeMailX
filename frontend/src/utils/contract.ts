// Contract interaction utilities
import {
  Account,
  Args,
  JsonRpcProvider,
  SmartContract,
  bytesToStr,
  Mas,
} from '@massalabs/massa-web3';

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

// Initialize provider
let provider: JsonRpcProvider | null = null;
let account: Account | null = null;
let accountAddress: string | null = null;
let walletProvider: any | null = null;

/**
 * Initialize Massa provider
 */
export async function initClient(secretKey?: string): Promise<JsonRpcProvider> {
  if (provider && account) {
    return provider;
  }

  const keyToUse = secretKey || localStorage.getItem('demailx_wallet_key');
  if (!keyToUse) {
    throw new Error('No wallet connected');
  }

  const acc = await Account.fromPrivateKey(keyToUse as string);
  const prov = JsonRpcProvider.buildnet(acc);

  account = acc;
  provider = prov;
  accountAddress = acc.address.toString();
  localStorage.setItem('demailx_wallet_address', accountAddress || '');

  return prov;
}

/**
 * Set provider from UI wallet (Bearby/MassaStation)
 */
export function setWalletProvider(p: any): void {
  walletProvider = p;
  account = null; // not needed when using wallet provider
  provider = null; // not used; SmartContract will use walletProvider directly
  accountAddress = p.address;
  localStorage.setItem('demailx_wallet_address', accountAddress || '');
}

/**
 * Set account after wallet connection
 */
export function setAccount(acc: any | null, address: string): void {
  account = acc;
  accountAddress = address;
  if (acc) {
    provider = JsonRpcProvider.buildnet(acc);
    localStorage.setItem('demailx_wallet_address', address);
  }
}

/**
 * Get current account address
 */
export function getCurrentAccountAddress(): string | null {
  return accountAddress || localStorage.getItem('demailx_wallet_address');
}

/**
 * Call smart contract function (read-only)
 */
async function readContract(functionName: string, args: Args): Promise<string> {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured. Set VITE_CONTRACT_ADDRESS');
  }
  const prov: any = JsonRpcProvider.buildnet();
  const sc = new SmartContract(prov, CONTRACT_ADDRESS);
  const result = await sc.read(functionName, args);
  return bytesToStr(result.value);
}

/**
 * Call smart contract function (write) - requires account
 */
async function writeContract(functionName: string, args: Args): Promise<void> {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured. Set VITE_CONTRACT_ADDRESS');
  }
  if (!walletProvider && (!provider || !account)) {
    throw new Error('No account connected. Please connect wallet first.');
  }
  const sc = new SmartContract(walletProvider || provider, CONTRACT_ADDRESS);
  const op = await sc.call(functionName, args, {
    coins: Mas.fromString('0.01'),
    maxGas: 200000000n,
  });
  const status = await op.waitFinalExecution(60000, 1000);
  if (status !== 4) { // OperationStatus.Success
    throw new Error('Transaction failed or not finalized');
  }
}

/**
 * Register email
 */
export async function registerEmail(username: string): Promise<string> {
  await writeContract('registerEmail', new Args().addString(username));
  return `${username}@demailx`;
}

/**
 * Get email by address
 */
export async function getEmailByAddress(address: string): Promise<string> {
  return await readContract('getEmailByAddress', new Args().addString(address));
}

/**
 * Get address by email
 */
export async function getAddressByEmail(email: string): Promise<string> {
  return await readContract('getAddressByEmail', new Args().addString(email));
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const result = await readContract('emailExists', new Args().addString(email));
  return result === '1';
}

/**
 * Send message
 */
export async function sendMessage(
  toEmail: string,
  subject: string,
  body: string,
  isEncrypted: boolean = true
): Promise<string> {
  const fromAddress = getCurrentAccountAddress();
  if (!fromAddress) throw new Error('No account connected');
  
  // Get recipient address
  const toAddress = await getAddressByEmail(toEmail);
  if (!toAddress) throw new Error('Recipient email not found');
  
  if (!provider || !account) {
    throw new Error('No account connected. Please connect wallet first.');
  }
  
  const sc = new SmartContract(provider, CONTRACT_ADDRESS);
  
  // Create message
  const createArgs = new Args()
    .addString(fromAddress)
    .addString(toAddress)
    .addString(subject)
    .addString(body)
    .addString(isEncrypted ? '1' : '0');
  
  const createOp = await sc.call('createMessage', createArgs, {
    coins: Mas.fromString('0.01'),
    maxGas: 200000000n,
  });
  const createStatus = await createOp.waitFinalExecution(60000, 1000);
  if (createStatus !== 4) {
    throw new Error('Create message failed or not finalized');
  }
  const createEvents = await createOp.getFinalEvents();
  let messageId = Date.now().toString();
  if (createEvents?.length) {
    const lastEvt = [...createEvents].reverse().find((e: any) => typeof e.data === 'string' && e.data.startsWith('Message created: '));
    if (lastEvt) {
      const m = /Message created:\s*(\d+)/.exec(lastEvt.data as string);
      if (m && m[1]) messageId = m[1];
    }
  }
  
  // Note: Getting message ID from createMessage return value requires reading events
  // For now, we'll use a timestamp-based ID as workaround
  // In production, you'd read the return value or events
  // Send message
  const sendArgs = new Args()
    .addString(toAddress)
    .addString(messageId);
  
  const sendOp = await sc.call('sendMessage', sendArgs, {
    coins: Mas.fromString('0.01'),
    maxGas: 200000000n,
  });
  const sendStatus = await sendOp.waitFinalExecution(60000, 1000);
  if (sendStatus !== 4) {
    throw new Error('Send message failed or not finalized');
  }
  
  return messageId;
}

/**
 * Get inbox messages
 */
export async function getInbox(address: string): Promise<string[]> {
  const inboxStr = await readContract('getInbox', new Args().addString(address));
  return inboxStr ? inboxStr.split(',').filter(id => id.trim()) : [];
}

/**
 * Get sent messages
 */
export async function getSent(address: string): Promise<string[]> {
  const sentStr = await readContract('getSent', new Args().addString(address));
  return sentStr ? sentStr.split(',').filter(id => id.trim()) : [];
}

/**
 * Get message details
 */
export async function getMessage(messageId: string): Promise<{
  from: string;
  to: string;
  subject: string;
  bodyRef: string;
  timestamp: string;
  isEncrypted: string;
} | null> {
  const messageStr = await readContract('getMessage', new Args().addString(messageId));
  if (!messageStr) return null;
  
  const [from, to, subject, bodyRef, timestamp, isEncrypted] = messageStr.split('|');
  return { from, to, subject, bodyRef, timestamp, isEncrypted };
}

/**
 * Get inbox entry metadata
 */
export async function getInboxEntry(address: string, messageId: string): Promise<{
  isRead: boolean;
  isArchived: boolean;
  isSpam: boolean;
}> {
  const entryStr = await readContract('getInboxEntry', new Args().addString(address).addString(messageId));
  const [isRead, isArchived, isSpam] = (entryStr || '0|0|0').split('|');
  
  return {
    isRead: isRead === '1',
    isArchived: isArchived === '1',
    isSpam: isSpam === '1',
  };
}

/**
 * Mark message as read
 */
export async function markAsRead(messageId: string): Promise<void> {
  await writeContract('markAsRead', new Args().addString(messageId));
}

/**
 * Mark message as spam
 */
export async function markAsSpam(messageId: string): Promise<void> {
  await writeContract('markAsSpam', new Args().addString(messageId));
}

/**
 * Archive message
 */
export async function archiveMessage(messageId: string): Promise<void> {
  await writeContract('archiveMessage', new Args().addString(messageId));
}

/**
 * Set spam list
 */
export async function setSpamList(addresses: string[]): Promise<void> {
  await writeContract('setSpamList', new Args().addString(addresses.join(',')));
}

/**
 * Get spam list
 */
export async function getSpamList(address: string): Promise<string[]> {
  const spamStr = await readContract('getSpamList', new Args().addString(address));
  return spamStr ? spamStr.split(',').filter(addr => addr.trim()) : [];
}

/**
 * Set max inbox days
 */
export async function setMaxInboxDays(days: number): Promise<void> {
  await writeContract('setMaxInboxDays', new Args().addString(days.toString()));
}

/**
 * Get max inbox days
 */
export async function getMaxInboxDays(address: string): Promise<number> {
  const result = await readContract('getMaxInboxDays', new Args().addString(address));
  return parseInt(result || '60');
}

/**
 * Set max spam days
 */
export async function setMaxSpamDays(days: number): Promise<void> {
  await writeContract('setMaxSpamDays', new Args().addString(days.toString()));
}

/**
 * Get max spam days
 */
export async function getMaxSpamDays(address: string): Promise<number> {
  const result = await readContract('getMaxSpamDays', new Args().addString(address));
  return parseInt(result || '7');
}
