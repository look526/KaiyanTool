import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import AIAssistant from '../components/AIAssistant/AIAssistant';
import { Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';

export function DashboardLayout() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#070d1f',
      fontFamily: "'Manrope', sans-serif",
      color: '#dfe4fe',
    }}>
      <Sidebar />
      
      <main style={{
        marginLeft: '256px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
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
            background: 'linear-gradient(135deg, #34b5fa 0%, #6366f1 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(52, 181, 250, 0.4)',
            transition: 'all 0.3s ease',
            zIndex: 50,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(52, 181, 250, 0.5)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(52, 181, 250, 0.4)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="AI 助手"
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
