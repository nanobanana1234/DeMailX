import { useState, useEffect } from 'react';
import { registerEmail } from '../utils/contract';
import { getSpamList, setSpamList, getMaxInboxDays, setMaxInboxDays, getMaxSpamDays, setMaxSpamDays } from '../utils/contract';
import './Settings.css';

interface SettingsProps {
  address: string;
  email: string;
  onEmailRegistered?: (email: string) => void;
}

function Settings({ address, email, onEmailRegistered }: SettingsProps) {
  const [username, setUsername] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [spamAddresses, setSpamAddresses] = useState<string[]>([]);
  const [newSpamAddress, setNewSpamAddress] = useState('');
  const [maxInboxDays, setMaxInboxDaysState] = useState(60);
  const [maxSpamDays, setMaxSpamDaysState] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [address]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const spam = await getSpamList(address);
      setSpamAddresses(spam);
      const inboxDays = await getMaxInboxDays(address);
      setMaxInboxDaysState(inboxDays);
      const spamDays = await getMaxSpamDays(address);
      setMaxSpamDaysState(spamDays);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEmail = async () => {
    if (!username.trim()) {
      setRegisterError('Please enter a username');
      return;
    }

    setRegistering(true);
    setRegisterError('');
    setRegisterSuccess(false);

    try {
      const newEmail = await registerEmail(username);
      setRegisterSuccess(true);
      setUsername('');
      if (onEmailRegistered) onEmailRegistered(newEmail);
    } catch (err: any) {
      setRegisterError(err.message || 'Failed to register email');
    } finally {
      setRegistering(false);
    }
  };

  const handleAddSpam = async () => {
    if (!newSpamAddress.trim()) {
      return;
    }

    const updated = [...spamAddresses, newSpamAddress];
    await setSpamList(updated);
    setSpamAddresses(updated);
    setNewSpamAddress('');
  };

  const handleRemoveSpam = async (address: string) => {
    const updated = spamAddresses.filter(addr => addr !== address);
    await setSpamList(updated);
    setSpamAddresses(updated);
  };

  const handleUpdateInboxDays = async () => {
    await setMaxInboxDays(maxInboxDays);
    alert('Inbox retention days updated!');
  };

  const handleUpdateSpamDays = async () => {
    await setMaxSpamDays(maxSpamDays);
    alert('Spam retention days updated!');
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Email Address</h3>
        {email ? (
          <div className="email-display">
            <p>Your email: <strong>{email}</strong></p>
          </div>
        ) : (
          <div className="register-email">
            <p>You don't have an email address yet. Register one now!</p>
            <div className="register-form">
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
              />
              <span className="email-suffix">@demailx</span>
              <button
                onClick={handleRegisterEmail}
                disabled={registering}
                className="register-button"
              >
                {registering ? 'Registering...' : 'Register Email'}
              </button>
            </div>
            {registerError && <div className="error-message">{registerError}</div>}
            {registerSuccess && <div className="success-message">Email registered successfully! ✅</div>}
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>Spam Blocking</h3>
        <div className="spam-list">
          <div className="add-spam">
            <input
              type="text"
              placeholder="Enter address to block"
              value={newSpamAddress}
              onChange={(e) => setNewSpamAddress(e.target.value)}
              className="form-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSpam()}
            />
            <button onClick={handleAddSpam} className="add-button">Add</button>
          </div>
          {spamAddresses.length > 0 ? (
            <ul className="spam-addresses">
              {spamAddresses.map((addr, idx) => (
                <li key={idx}>
                  {addr}
                  <button onClick={() => handleRemoveSpam(addr)} className="remove-button">Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No blocked addresses</p>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h3>Message Retention</h3>
        <div className="retention-setting">
          <label>
            Max inbox retention (days):
            <input
              type="number"
              value={maxInboxDays}
              onChange={(e) => setMaxInboxDaysState(parseInt(e.target.value))}
              className="form-input number-input"
              min="1"
            />
            <button onClick={handleUpdateInboxDays} className="update-button">Update</button>
          </label>
        </div>
        <div className="retention-setting">
          <label>
            Max spam retention (days):
            <input
              type="number"
              value={maxSpamDays}
              onChange={(e) => setMaxSpamDaysState(parseInt(e.target.value))}
              className="form-input number-input"
              min="1"
            />
            <button onClick={handleUpdateSpamDays} className="update-button">Update</button>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;

