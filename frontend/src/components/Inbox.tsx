import { useState, useEffect } from 'react';
import { getInbox, getMessage, getInboxEntry, markAsRead, markAsSpam, archiveMessage, getEmailByAddress } from '../utils/contract';
import { decryptMessage } from '../utils/encryption';
import './Inbox.css';

interface InboxProps {
  address: string;
}

interface Message {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  isEncrypted: boolean;
  isRead: boolean;
  isSpam: boolean;
  isArchived: boolean;
}

function Inbox({ address }: InboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'spam'>('all');

  useEffect(() => {
    loadMessages();
  }, [address, filter]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messageIds = await getInbox(address);
      
      const messagePromises = messageIds.map(async (id) => {
        const msgData = await getMessage(id);
        if (!msgData) return null;

        const entry = await getInboxEntry(address, id);
        
        // Skip if filtered
        if (filter === 'unread' && entry.isRead) return null;
        if (filter === 'spam' && !entry.isSpam) return null;
        if (filter === 'all' && entry.isSpam) return null; // Don't show spam in 'all' by default

        let body = msgData.bodyRef;
        if (msgData.isEncrypted === '1') {
          try {
            body = decryptMessage(msgData.bodyRef);
          } catch (e) {
            body = '[Encrypted - Decryption failed]';
          }
        }

        // Get sender email
        const fromEmail = await getEmailByAddress(msgData.from) || msgData.from.substring(0, 8) + '...';

        return {
          id,
          from: msgData.from,
          fromEmail,
          to: msgData.to,
          subject: msgData.subject,
          body,
          timestamp: new Date(parseInt(msgData.timestamp) * 1000).toLocaleString(),
          isEncrypted: msgData.isEncrypted === '1',
          isRead: entry.isRead,
          isSpam: entry.isSpam,
          isArchived: entry.isArchived,
        };
      });

      const loadedMessages = (await Promise.all(messagePromises)).filter((m): m is Message => m !== null);
      loadedMessages.sort((a, b) => parseInt(b.id) - parseInt(a.id)); // Sort by ID (newest first)
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      await markAsRead(message.id);
      message.isRead = true;
      setMessages([...messages]);
    }
  };

  const handleMarkSpam = async (messageId: string) => {
    await markAsSpam(messageId);
    loadMessages();
  };

  const handleArchive = async (messageId: string) => {
    await archiveMessage(messageId);
    loadMessages();
  };

  if (loading) {
    return <div className="loading">Loading inbox...</div>;
  }

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <h2>Inbox</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button
            className={filter === 'spam' ? 'active' : ''}
            onClick={() => setFilter('spam')}
          >
            Spam
          </button>
        </div>
      </div>

      <div className="inbox-layout">
        <div className="message-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>No messages in your inbox</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-item ${!message.isRead ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                onClick={() => handleMessageClick(message as Message)}
              >
                <div className="message-header">
                  <span className="message-from">{message.fromEmail}</span>
                  <span className="message-time">{message.timestamp}</span>
                </div>
                <div className="message-subject">{message.subject}</div>
                {!message.isRead && <div className="unread-badge">New</div>}
              </div>
            ))
          )}
        </div>

        {selectedMessage && (
          <div className="message-view">
            <div className="message-view-header">
              <button onClick={() => setSelectedMessage(null)} className="close-button">×</button>
            </div>
            <div className="message-content">
              <div className="message-meta">
                <div><strong>From:</strong> {selectedMessage.fromEmail}</div>
                <div><strong>To:</strong> {selectedMessage.to}</div>
                <div><strong>Date:</strong> {selectedMessage.timestamp}</div>
                <div><strong>Subject:</strong> {selectedMessage.subject}</div>
              </div>
              <div className="message-body">{selectedMessage.body}</div>
              <div className="message-actions">
                {!selectedMessage.isSpam && (
                  <button onClick={() => handleMarkSpam(selectedMessage.id)} className="action-button spam">
                    Mark as Spam
                  </button>
                )}
                {!selectedMessage.isArchived && (
                  <button onClick={() => handleArchive(selectedMessage.id)} className="action-button archive">
                    Archive
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inbox;

