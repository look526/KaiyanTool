import React from 'react';
import {
  Plus,
  ArrowRight,
  Download,
  Trash2,
  Check,
  Settings,
  Heart,
  Share2,
  Loader2,
} from 'lucide-react';
import { Button, ButtonGroup } from '../components/ui/button-new';

export default function ButtonShowcasePage() {
  const [loading, setLoading] = React.useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: 'var(--space-8)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: 'var(--space-12)', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}>
            Button Component Design System
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
          }}>
            Modern, accessible, and highly customizable button components
          </p>
        </header>

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            Variants
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
          }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            Sizes
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
          }}>
            <Button size="xs" variant="primary">Extra Small</Button>
            <Button size="sm" variant="primary">Small</Button>
            <Button size="md" variant="primary">Medium</Button>
            <Button size="lg" variant="primary">Large</Button>
            <Button size="xl" variant="primary">Extra Large</Button>
            <Button size="2xl" variant="primary">2X Large</Button>
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            Icon Buttons
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
          }}>
            <Button size="icon-xs" variant="primary" icon={<Plus size={12} />} aria-label="Add" />
            <Button size="icon-sm" variant="primary" icon={<Plus size={14} />} aria-label="Add" />
            <Button size="icon" variant="primary" icon={<Plus size={18} />} aria-label="Add" />
            <Button size="icon-lg" variant="primary" icon={<Plus size={20} />} aria-label="Add" />
            <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-subtle)', margin: '0 var(--space-2)' }} />
            <Button size="icon" variant="secondary" icon={<Settings size={18} />} aria-label="Settings" />
            <Button size="icon" variant="outline" icon={<Heart size={18} />} aria-label="Like" />
            <Button size="icon" variant="ghost" icon={<Share2 size={18} />} aria-label="Share" />
            <Button size="icon" variant="danger" icon={<Trash2 size={18} />} aria-label="Delete" />
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            With Icons
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
          }}>
            <Button variant="primary" icon={<Plus size={16} />}>Add Item</Button>
            <Button variant="secondary" icon={<Download size={16} />}>Download</Button>
            <Button variant="outline" icon={<Settings size={16} />}>Settings</Button>
            <Button variant="ghost" icon={<Heart size={16} />}>Favorite</Button>
            <Button variant="danger" icon={<Trash2 size={16} />}>Delete</Button>
            <Button variant="success" icon={<Check size={16} />}>Confirm</Button>
            <Button variant="primary" icon={<ArrowRight size={16} />} iconPosition="right">
              Continue
            </Button>
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            States
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
          }}>
            <Button variant="primary">Default</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" onClick={handleLoadingDemo} loading={loading}>
              {loading ? 'Processing...' : 'Click to Load'}
            </Button>
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            Full Width
          </h2>
          <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Button variant="primary" fullWidth>Full Width Primary</Button>
            <Button variant="secondary" fullWidth>Full Width Secondary</Button>
            <Button variant="outline" fullWidth icon={<Download size={16} />}>
              Download Full Width
            </Button>
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            Button Groups
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Default (with gap)</p>
              <ButtonGroup>
                <Button variant="outline">Left</Button>
                <Button variant="outline">Center</Button>
                <Button variant="outline">Right</Button>
              </ButtonGroup>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Attached</p>
              <ButtonGroup attached>
                <Button variant="outline">Left</Button>
                <Button variant="outline">Center</Button>
                <Button variant="outline">Right</Button>
              </ButtonGroup>
            </div>
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Vertical</p>
              <ButtonGroup orientation="vertical" attached>
                <Button variant="outline">Top</Button>
                <Button variant="outline">Middle</Button>
                <Button variant="outline">Bottom</Button>
              </ButtonGroup>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            Real-world Examples
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            <div style={{
              padding: 'var(--space-6)',
              backgroundColor: 'var(--bento-bg)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--bento-border)',
            }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                Form Actions
              </h3>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <Button variant="ghost">Cancel</Button>
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>

            <div style={{
              padding: 'var(--space-6)',
              backgroundColor: 'var(--bento-bg)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--bento-border)',
            }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                Danger Zone
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Permanently delete this item
                </span>
                <Button variant="danger" size="sm" icon={<Trash2 size={14} />}>
                  Delete
                </Button>
              </div>
            </div>

            <div style={{
              padding: 'var(--space-6)',
              backgroundColor: 'var(--bento-bg)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--bento-border)',
            }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                Call to Action
              </h3>
              <Button variant="primary" size="xl" fullWidth icon={<ArrowRight size={18} />} iconPosition="right">
                Get Started Free
              </Button>
            </div>

            <div style={{
              padding: 'var(--space-6)',
              backgroundColor: 'var(--bento-bg)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--bento-border)',
            }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
                Toolbar
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button size="icon-sm" variant="ghost" icon={<Plus size={14} />} aria-label="Add" />
                <Button size="icon-sm" variant="ghost" icon={<Settings size={14} />} aria-label="Settings" />
                <Button size="icon-sm" variant="ghost" icon={<Download size={14} />} aria-label="Download" />
                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)', margin: '0 var(--space-1)' }} />
                <Button size="icon-sm" variant="ghost" icon={<Trash2 size={14} />} aria-label="Delete" />
              </div>
            </div>
          </div>
        </section>

        <section style={{
          padding: 'var(--space-6)',
          backgroundColor: 'var(--bento-bg)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--bento-border)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}>
            Design Specifications
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
          }}>
            <div>
              <h4 style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Transitions</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <li>Duration: 200ms</li>
                <li>Easing: ease-out</li>
                <li>Properties: all</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Hover Effects</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <li>Background darkens</li>
                <li>Shadow enhances</li>
                <li>Lift effect: -1px</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Accessibility</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <li>Focus ring visible</li>
                <li>aria-busy for loading</li>
                <li>aria-disabled support</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Color Contrast</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <li>WCAG AA compliant</li>
                <li>4.5:1 minimum ratio</li>
                <li>Light/Dark support</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
