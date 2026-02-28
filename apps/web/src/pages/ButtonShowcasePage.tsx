import { useState } from 'react';
import { Button } from '../components/ui/button-new';

export default function ButtonShowcasePage() {
  const [loading, setLoading] = useState(false);

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      padding: '40px',
    }}>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '32px' }}>Button Showcase</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Variants</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>

        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Sizes</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>States</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button disabled>Disabled</Button>
            <Button loading={loading} onClick={handleLoadingClick}>
              {loading ? 'Loading...' : 'Click to Load'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
