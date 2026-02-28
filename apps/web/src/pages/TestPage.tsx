import { Link } from 'react-router-dom';

export default function TestPage() {
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
      <h1>Test Page</h1>
      <p>This is a test page for development.</p>
      <Link to="/" style={{ color: 'var(--accent)', marginTop: '20px' }}>
        Back to Home
      </Link>
    </div>
  );
}
