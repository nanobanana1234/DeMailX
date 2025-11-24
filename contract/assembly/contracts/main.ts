// Main DeMailX Contract - Unified contract combining all functionality
// This is the main entry point for the DeMailX system
import { Context, generateEvent, Storage } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';

// Storage keys
const EMAIL_BY_ADDRESS_KEY = 'email_by_addr_';
const ADDRESS_BY_EMAIL_KEY = 'addr_by_email_';
const EMAIL_COUNT_KEY = 'email_count';
const MESSAGE_KEY = 'msg_';
const NEXT_MESSAGE_ID_KEY = 'next_msg_id';
const INBOX_KEY = 'inbox_';
const SENT_KEY = 'sent_';
const INBOX_ENTRY_KEY = 'inbox_entry_';
const SPAM_LIST_KEY = 'spam_list_';
const MAX_INBOX_DAYS_KEY = 'max_inbox_days_';
const MAX_SPAM_DAYS_KEY = 'max_spam_days_';

/**
 * Constructor - called once on deployment
 */
export function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract());
  Storage.set(EMAIL_COUNT_KEY, '0');
  Storage.set(NEXT_MESSAGE_ID_KEY, '1');
  generateEvent('DeMailX contract deployed');
}

// ========== Email ID Registry Functions ==========

/**
 * Register an email ID for the caller
 * One wallet can only have one email
 * @param binaryArgs - email username (without @demailx)
 */
export function registerEmail(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const username = args.nextString().expect('Username required');
  
  const caller = Context.caller().toString();
  const emailId = `${username}@demailx`;
  
  // Check if user already has an email
  const existingEmail = Storage.get(EMAIL_BY_ADDRESS_KEY + caller);
  assert(existingEmail == '', 'Wallet already has an email registered');
  
  // Check if email is already taken
  const existingAddr = Storage.get(ADDRESS_BY_EMAIL_KEY + emailId);
  assert(existingAddr == '', 'Email already taken');
  
  // Register email
  Storage.set(EMAIL_BY_ADDRESS_KEY + caller, emailId);
  Storage.set(ADDRESS_BY_EMAIL_KEY + emailId, caller);
  
  // Update count
  const countStr = Storage.get(EMAIL_COUNT_KEY);
  const count = countStr == '' ? 0 : parseInt(countStr);
  Storage.set(EMAIL_COUNT_KEY, (count + 1).toString());
  
  generateEvent(`Email registered: ${emailId} for ${caller}`);
  return stringToBytes(emailId);
}

/**
 * Get email ID for an address
 */
export function getEmailByAddress(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address required');
  
  const email = Storage.get(EMAIL_BY_ADDRESS_KEY + address);
  return stringToBytes(email);
}

/**
 * Get address for an email ID
 */
export function getAddressByEmail(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const emailId = args.nextString().expect('Email required');
  
  const addr = Storage.get(ADDRESS_BY_EMAIL_KEY + emailId);
  return stringToBytes(addr);
}

/**
 * Check if email exists
 */
export function emailExists(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const emailId = args.nextString().expect('Email required');
  
  const addr = Storage.get(ADDRESS_BY_EMAIL_KEY + emailId);
  const exists = addr != '' ? '1' : '0';
  return stringToBytes(exists);
}

// ========== Message Store Functions ==========

/**
 * Create a new message
 */
export function createMessage(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const from = args.nextString().expect('From address required');
  const to = args.nextString().expect('To address required');
  const subject = args.nextString().expect('Subject required');
  const bodyRef = args.nextString().expect('Body reference required');
  const isEncrypted = args.nextString().expect('Encryption flag required');
  
  // Get next message ID
  const messageIdStr = Storage.get(NEXT_MESSAGE_ID_KEY);
  const messageId = messageIdStr == '' ? '1' : messageIdStr;
  const nextId = (parseInt(messageId) + 1).toString();
  Storage.set(NEXT_MESSAGE_ID_KEY, nextId);
  
  // Get current timestamp
  const timestamp = Context.timestamp().toString();
  
  // Store message
  const messageData = `${from}|${to}|${subject}|${bodyRef}|${timestamp}|${isEncrypted}`;
  Storage.set(MESSAGE_KEY + messageId, messageData);
  
  generateEvent(`Message created: ${messageId} from ${from} to ${to}`);
  return stringToBytes(messageId);
}

/**
 * Get message by ID
 */
export function getMessage(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const messageId = args.nextString().expect('Message ID required');
  
  const messageData = Storage.get(MESSAGE_KEY + messageId);
  return stringToBytes(messageData);
}

// ========== Inbox Manager Functions ==========

/**
 * Send a message - adds to sender's sent and receiver's inbox
 */
export function sendMessage(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const toAddress = args.nextString().expect('To address required');
  const messageId = args.nextString().expect('Message ID required');
  
  const fromAddress = Context.caller().toString();
  
  // Add to sender's sent list
  const sentKey = SENT_KEY + fromAddress;
  const sentStr = Storage.get(sentKey);
  const sentList = sentStr == '' ? messageId : sentStr + ',' + messageId;
  Storage.set(sentKey, sentList);
  
  // Add to receiver's inbox
  const inboxKey = INBOX_KEY + toAddress;
  const inboxStr = Storage.get(inboxKey);
  const inboxList = inboxStr == '' ? messageId : inboxStr + ',' + messageId;
  Storage.set(inboxKey, inboxList);
  
  // Store inbox entry metadata
  const entryKey = INBOX_ENTRY_KEY + toAddress + '_' + messageId;
  Storage.set(entryKey, '0|0|0'); // isRead|isArchived|isSpam
  
  generateEvent(`Message sent: ${messageId} from ${fromAddress} to ${toAddress}`);
}

/**
 * Get inbox messages for a user
 */
export function getInbox(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address required');
  
  const inboxStr = Storage.get(INBOX_KEY + address);
  return stringToBytes(inboxStr);
}

/**
 * Get sent messages for a user
 */
export function getSent(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address required');
  
  const sentStr = Storage.get(SENT_KEY + address);
  return stringToBytes(sentStr);
}

/**
 * Mark message as read
 */
export function markAsRead(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const messageId = args.nextString().expect('Message ID required');
  
  const caller = Context.caller().toString();
  const entryKey = INBOX_ENTRY_KEY + caller + '_' + messageId;
  const entryStr = Storage.get(entryKey);
  
  if (entryStr != '') {
    const parts = entryStr.split('|');
    parts[0] = '1'; // isRead = true
    Storage.set(entryKey, parts.join('|'));
    generateEvent(`Message marked as read: ${messageId}`);
  }
}

/**
 * Mark message as spam
 */
export function markAsSpam(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const messageId = args.nextString().expect('Message ID required');
  
  const caller = Context.caller().toString();
  const entryKey = INBOX_ENTRY_KEY + caller + '_' + messageId;
  const entryStr = Storage.get(entryKey);
  
  if (entryStr != '') {
    const parts = entryStr.split('|');
    parts[2] = '1'; // isSpam = true
    Storage.set(entryKey, parts.join('|'));
    generateEvent(`Message marked as spam: ${messageId}`);
  }
}

/**
 * Archive message
 */
export function archiveMessage(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const messageId = args.nextString().expect('Message ID required');
  
  const caller = Context.caller().toString();
  const entryKey = INBOX_ENTRY_KEY + caller + '_' + messageId;
  const entryStr = Storage.get(entryKey);
  
  if (entryStr != '') {
    const parts = entryStr.split('|');
    parts[1] = '1'; // isArchived = true
    Storage.set(entryKey, parts.join('|'));
    generateEvent(`Message archived: ${messageId}`);
  }
}

/**
 * Get inbox entry metadata
 */
export function getInboxEntry(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address required');
  const messageId = args.nextString().expect('Message ID required');
  
  const entryKey = INBOX_ENTRY_KEY + address + '_' + messageId;
  const entryStr = Storage.get(entryKey);
  
  if (entryStr == '') {
    return stringToBytes('0|0|0'); // default
  }
  return stringToBytes(entryStr);
}

// ========== User Settings Functions ==========

/**
 * Set spam list for user
 */
export function setSpamList(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const addresses = args.nextString().expect('Addresses required');
  
  const caller = Context.caller().toString();
  Storage.set(SPAM_LIST_KEY + caller, addresses);
  
  generateEvent(`Spam list updated for ${caller}`);
}

/**
 * Get spam list for user
 */
export function getSpamList(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address required');
  
  const spamStr = Storage.get(SPAM_LIST_KEY + address);
  return stringToBytes(spamStr);
}

/**
 * Set max inbox retention days
 */
export function setMaxInboxDays(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const days = args.nextString().expect('Days required');
  
  const caller = Context.caller().toString();
  Storage.set(MAX_INBOX_DAYS_KEY + caller, days);
  
  generateEvent(`Max inbox days set to ${days} for ${caller}`);
}

/**
 * Get max inbox retention days
 */
export function getMaxInboxDays(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address required');
  
  const daysStr = Storage.get(MAX_INBOX_DAYS_KEY + address);
  const days = daysStr == '' ? '60' : daysStr; // default 60 days
  return stringToBytes(days);
}

/**
 * Set max spam retention days
 */
export function setMaxSpamDays(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const days = args.nextString().expect('Days required');
  
  const caller = Context.caller().toString();
  Storage.set(MAX_SPAM_DAYS_KEY + caller, days);
  
  generateEvent(`Max spam days set to ${days} for ${caller}`);
}

/**
 * Get max spam retention days
 */
export function getMaxSpamDays(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('Address required');
  
  const daysStr = Storage.get(MAX_SPAM_DAYS_KEY + address);
  const days = daysStr == '' ? '7' : daysStr; // default 7 days
  return stringToBytes(days);
}
