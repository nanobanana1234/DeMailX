import { useState, useEffect } from 'react';
import { getSent, getMessage, getEmailByAddress } from '../utils/contract';
import { decryptMessage } from '../utils/encryption';
import './Sent.css';

interface SentProps {
  address: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  toEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  isEncrypted: boolean;
}

function Sent({ address }: SentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [address]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messageIds = await getSent(address);
      
      const messagePromises = messageIds.map(async (id) => {
        const msgData = await getMessage(id);
        if (!msgData) return null;

        let body = msgData.bodyRef;
        if (msgData.isEncrypted === '1') {
          try {
            body = decryptMessage(msgData.bodyRef);
          } catch (e) {
            body = '[Encrypted - Decryption failed]';
          }
        }

        // Get recipient email
        const toEmail = await getEmailByAddress(msgData.to) || msgData.to.substring(0, 8) + '...';

        return {
          id,
          from: msgData.from,
          to: msgData.to,
          toEmail,
          subject: msgData.subject,
          body,
          timestamp: new Date(parseInt(msgData.timestamp) * 1000).toLocaleString(),
          isEncrypted: msgData.isEncrypted === '1',
        };
      });

      const loadedMessages = (await Promise.all(messagePromises)).filter((m): m is Message => m !== null);
      loadedMessages.sort((a, b) => parseInt(b.id) - parseInt(a.id)); // Sort by ID (newest first)
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading sent messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading sent messages...</div>;
  }

  return (
    <div className="sent-container">
      <div className="sent-header">
        <h2>Sent Messages</h2>
      </div>

      <div className="sent-layout">
        <div className="message-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>No sent messages</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="message-header">
                  <span className="message-to">To: {message.toEmail}</span>
                  <span className="message-time">{message.timestamp}</span>
                </div>
                <div className="message-subject">{message.subject}</div>
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
                <div><strong>To:</strong> {selectedMessage.toEmail}</div>
                <div><strong>Date:</strong> {selectedMessage.timestamp}</div>
                <div><strong>Subject:</strong> {selectedMessage.subject}</div>
              </div>
              <div className="message-body">{selectedMessage.body}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sent;

