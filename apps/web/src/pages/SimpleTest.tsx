import { Link } from 'react-router-dom';

export default function SimpleTest() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
    }}>
      <h1>Simple Test</h1>
      <p>This is a simple test page.</p>
      <Link to="/" style={{ color: 'var(--accent)', marginTop: '20px' }}>
        Back to Home
      </Link>
    </div>
  );
}
