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
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: 'rgb(249 250 251)',
      overflow: 'hidden',
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}>
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
            background: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(99 102 241) 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.2s ease',
            zIndex: 50,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.5)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.transform = 'scale(1)';
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
