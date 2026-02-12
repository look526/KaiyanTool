import { ArrowRight, Sparkles, Zap, Layers } from 'lucide-react';

export default function SimpleTest() {
  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease-out',
    minHeight: '320px',
    cursor: 'pointer',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    gap: '24px',
  };

  const iconContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', padding: '48px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>
        简单卡片测试
      </h1>
      
      <div style={gridStyle as any}>
        <div style={cardStyle as any}>
          <div style={{ display: 'flex', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={iconContainerStyle as any}>
              <Sparkles style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6' 
            }}>
              <ArrowRight style={{ width: '20px', height: '20px', color: '#4b5563' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            AI 驱动
          </h3>
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>
            利用先进的人工智能技术，自动生成创意内容和设计方案
          </p>
        </div>

        <div style={cardStyle as any}>
          <div style={{ display: 'flex', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={iconContainerStyle as any}>
              <Zap style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6' 
            }}>
              <ArrowRight style={{ width: '20px', height: '20px', color: '#4b5563' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            高效协作
          </h3>
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>
            实时同步，多人协作，让团队工作更加流畅高效
          </p>
        </div>

        <div style={cardStyle as any}>
          <div style={{ display: 'flex', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={iconContainerStyle as any}>
              <Layers style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6' 
            }}>
              <ArrowRight style={{ width: '20px', height: '20px', color: '#4b5563' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            灵活扩展
          </h3>
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>
            丰富的插件生态系统，满足各种个性化需求
          </p>
        </div>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          如果你能看到这三个白色卡片，说明布局正常工作！
        </p>
      </div>
    </div>
  );
}
