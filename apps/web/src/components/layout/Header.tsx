import React, { useState } from 'react';
import { Search, Bell, Grid3X3, User, TrendingUp } from 'lucide-react';

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
}

export function Header({ title, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [iconHover, setIconHover] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: '256px',
      height: '80px',
      background: 'rgba(7, 13, 31, 0.4)',
      backdropFilter: 'blur(24px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 32px',
      zIndex: 40,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--on-surface)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>{title}</h2>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
          <TrendingUp size={16} />
          <span>状态统计</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface-container-low)',
          padding: '8px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(65, 71, 91, 0.1)',
          gap: '8px',
        }}>
          <Search size={16} style={{ color: 'var(--on-surface-variant)' }} />
          <input
            type="text"
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              width: '256px',
              color: 'var(--on-surface)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onMouseEnter={() => setIconHover('bell')}
            onMouseLeave={() => setIconHover(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              background: iconHover === 'bell' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              color: iconHover === 'bell' ? 'var(--primary)' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <Bell size={20} />
          </button>

          <button
            onMouseEnter={() => setIconHover('grid')}
            onMouseLeave={() => setIconHover(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              background: iconHover === 'grid' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              color: iconHover === 'grid' ? 'var(--primary)' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <Grid3X3 size={20} />
          </button>

          <button
            onMouseEnter={() => setIconHover('user')}
            onMouseLeave={() => setIconHover(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              background: iconHover === 'user' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              color: iconHover === 'user' ? 'var(--primary)' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
