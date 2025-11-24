import { useState } from 'react';
import { connectWallet } from '../utils/wallet';
import './Home.css';

interface HomeProps {
  onConnect: () => void;
}

function Home({ onConnect }: HomeProps) {
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!secretKey.trim()) {
      setError('Please enter your wallet secret key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await connectWallet(secretKey);
      const { initClient } = await import('../utils/contract');
      await initClient(secretKey);
      onConnect();
    } catch (err) {
      setError('Invalid secret key. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="hero-section">
          <h1 className="logo">DeMailX</h1>
          <p className="tagline">Decentralized Email on Massa Blockchain</p>
        </div>

        <div className="features-section">
          <h2>How DeMailX Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📧</div>
              <h3>One Email Per Wallet</h3>
              <p>Each Massa wallet gets one unique email address. Simple, secure, and permanent.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>End-to-End Encryption</h3>
              <p>Your messages are encrypted before being stored on-chain. Only you can read them.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Fully Decentralized</h3>
              <p>No servers, no central authority. Your emails live on the Massa blockchain forever.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Delivery</h3>
              <p>Send and receive emails instantly within the DeMailX network. No delays, no downtime.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Spam Protection</h3>
              <p>Built-in spam filtering and blocking. Take control of your inbox.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Auto Cleanup</h3>
              <p>Automatic message cleanup and archiving. Keep your inbox organized.</p>
            </div>
          </div>
        </div>

        <div className="connect-section">
          <h2>Get Your Mail</h2>
          <p className="connect-description">
            Connect your Massa wallet to access your DeMailX inbox. 
            If you don't have an email yet, we'll help you create one.
          </p>
          
          <div className="wallet-connect-form">
            <input
              type="password"
              placeholder="Enter your wallet secret key"
              value={secretKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSecretKey(e.target.value)}
              className="wallet-input"
              onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleConnect()}
            />
            {error && <div className="error-message">{error}</div>}
            <button
              onClick={handleConnect}
              disabled={loading}
              className="connect-button"
            >
              {loading ? 'Connecting...' : 'Connect Wallet & Get Mail'}
            </button>
            <p className="help-text">
              Don't have a wallet? Download{' '}
              <a href="https://station.massa.net" target="_blank" rel="noopener noreferrer">
                Massa Station
              </a>{' '}
              or{' '}
              <a href="https://bearby.io" target="_blank" rel="noopener noreferrer">
                Bearby Wallet
              </a>
            </p>
          </div>
        </div>

        <div className="info-section">
          <h3>Why DeMailX?</h3>
          <ul>
            <li>✅ <strong>Privacy First:</strong> Your emails are encrypted and stored on-chain</li>
            <li>✅ <strong>No Censorship:</strong> Decentralized means no one can block your messages</li>
            <li>✅ <strong>Permanent:</strong> Your email address is yours forever, tied to your wallet</li>
            <li>✅ <strong>Open Source:</strong> Built on transparent smart contracts</li>
            <li>✅ <strong>Free to Use:</strong> Only pay minimal blockchain fees</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;

