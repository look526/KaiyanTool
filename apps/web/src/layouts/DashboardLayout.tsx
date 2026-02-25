import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useState, useEffect } from 'react';
import AIAssistant from '../components/AIAssistant/AIAssistant';
import { Bot } from 'lucide-react';
import { apiClient } from '../lib/api';

export function DashboardLayout() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { user } = await apiClient.getCurrentUser();
        setIsAdmin(user?.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </main>
      
      {isAdmin && (
        <button
          onClick={() => setShowAIAssistant(true)}
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            zIndex: 999,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
          }}
          title="AI助手"
        >
          <Bot style={{ width: '24px', height: '24px', color: 'white' }} />
        </button>
      )}
      
      {isAdmin && showAIAssistant && (
        <AIAssistant 
          isOpen={showAIAssistant} 
          onClose={() => setShowAIAssistant(false)} 
        />
      )}
    </div>
  );
}
