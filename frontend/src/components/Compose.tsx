import { useState } from 'react';
import { sendMessage, emailExists } from '../utils/contract';
import { encryptMessage } from '../utils/encryption';
import './Compose.css';

interface ComposeProps {
  address: string;
  email: string;
}

function Compose({ email }: ComposeProps) {
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [encrypt, setEncrypt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!toEmail.trim()) {
      setError('Please enter recipient email');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter subject');
      return;
    }
    if (!body.trim()) {
      setError('Please enter message body');
      return;
    }

    // Validate email format
    if (!toEmail.endsWith('@demailx')) {
      setError('Recipient must be a DeMailX email (@demailx)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Check if recipient exists
      const exists = await emailExists(toEmail);
      if (!exists) {
        setError('Recipient email does not exist');
        setLoading(false);
        return;
      }

      // Encrypt if needed
      let messageBody = body;
      if (encrypt) {
        messageBody = encryptMessage(body);
      }

      // Send message
      await sendMessage(toEmail, subject, messageBody, encrypt);

      setSuccess(true);
      setToEmail('');
      setSubject('');
      setBody('');

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compose-container">
      <div className="compose-header">
        <h2>Compose Message</h2>
        {email && <p className="from-email">From: {email}</p>}
      </div>

      <div className="compose-form">
        <div className="form-group">
          <label>To (DeMailX email)</label>
          <input
            type="text"
            placeholder="recipient@demailx"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Subject</label>
          <input
            type="text"
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea
            placeholder="Type your message here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="form-textarea"
            rows={10}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={encrypt}
              onChange={(e) => setEncrypt(e.target.checked)}
            />
            <span>Encrypt message (recommended)</span>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Message sent successfully! ✅</div>}

        <button
          onClick={handleSend}
          disabled={loading}
          className="send-button"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  );
}

export default Compose;

