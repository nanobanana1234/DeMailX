import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getConnectedAddress, disconnectWallet } from '../utils/wallet';
import { getEmailByAddress, initClient } from '../utils/contract';
import Inbox from '../components/Inbox';
import Sent from '../components/Sent';
import Compose from '../components/Compose';
import Settings from '../components/Settings';
import './Dashboard.css';

function Dashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [inboxCount, setInboxCount] = useState<number>(0);
  const [sentCount, setSentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const addr = getConnectedAddress();
        if (!addr) {
          navigate('/');
          return;
        }

        setAddress(addr);
        await initClient();
        const userEmail = await getEmailByAddress(addr);
        if (userEmail) setEmail(userEmail);
        const { getInbox, getSent } = await import('../utils/contract');
        const inbox = await getInbox(addr);
        const sent = await getSent(addr);
        setInboxCount(inbox.length);
        setSentCount(sent.length);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your inbox...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-logo">DeMailX</h1>
          <div className="user-info">
            {email && <span className="user-email">{email}</span>}
            <span className="user-address">{address?.substring(0, 8)}...{address?.substring(address.length - 6)}</span>
            <span className="user-counters">📥 {inboxCount} • 📤 {sentCount}</span>
            <button onClick={handleDisconnect} className="disconnect-button">
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to="/dashboard/inbox" className="nav-item">
              <span className="nav-icon">📥</span>
              <span>Inbox</span>
            </Link>
            <Link to="/dashboard/sent" className="nav-item">
              <span className="nav-icon">📤</span>
              <span>Sent</span>
            </Link>
            <Link to="/dashboard/compose" className="nav-item">
              <span className="nav-icon">✏️</span>
              <span>Compose</span>
            </Link>
            <Link to="/dashboard/settings" className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        <main className="dashboard-main">
          <Routes>
            <Route path="/" element={<Inbox address={address!} />} />
            <Route path="/inbox" element={<Inbox address={address!} />} />
            <Route path="/sent" element={<Sent address={address!} />} />
            <Route path="/compose" element={<Compose address={address!} email={email} />} />
            <Route path="/settings" element={<Settings address={address!} email={email} onEmailRegistered={(e) => setEmail(e)} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

