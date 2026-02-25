import { useState } from 'react';
import { Play, ChevronRight, X, ExternalLink } from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  bvid: string;
  duration: string;
  category: string;
}

interface VideoTutorialPlayerProps {
  bvid: string;
  title: string;
  onClose?: () => void;
}

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: '快速开始指南',
    description: '了解平台基本功能和操作流程',
    bvid: 'BV1xx411c7mD',
    duration: '10:30',
    category: '入门'
  },
  {
    id: '2',
    title: '剧本创作教程',
    description: '学习如何使用剧本编辑器',
    bvid: 'BV1xx411c7mE',
    duration: '15:20',
    category: '剧本'
  },
  {
    id: '3',
    title: '角色管理指南',
    description: '创建和管理项目中的角色',
    bvid: 'BV1xx411c7mF',
    duration: '12:45',
    category: '角色'
  },
  {
    id: '4',
    title: 'AI图像生成技巧',
    description: '掌握AI图像生成的技巧',
    bvid: 'BV1xx411c7mG',
    duration: '20:15',
    category: '图像'
  },
  {
    id: '5',
    title: '视频生成完整流程',
    description: '从分镜到成片的完整教程',
    bvid: 'BV1xx411c7mH',
    duration: '25:30',
    category: '视频'
  }
];

export function VideoTutorialPlayer({ bvid, title, onClose }: VideoTutorialPlayerProps) {
  const videoUrl = `https://player.bilibili.com/player.html?bvid=${bvid}&page=1`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        width: '90%',
        maxWidth: '900px',
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>
        
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
        }}>
          <h3 style={{ color: '#fff', margin: 0 }}>{title}</h3>
        </div>
        
        <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
          <iframe
            src={videoUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allowFullScreen
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

interface VideoTutorialSectionProps {
  theme?: 'light' | 'dark';
}

export function VideoTutorialSection({ theme = 'dark' }: VideoTutorialSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = ['全部', '入门', '剧本', '角色', '图像', '视频'];
  
  const filteredTutorials = selectedCategory === '全部' 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory);

  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const mutedTextColor = theme === 'dark' ? '#a1a1aa' : '#64748b';
  const cardBg = theme === 'dark' ? '#18181b' : '#ffffff';
  const borderColor = theme === 'dark' ? '#27272a' : '#e2e8f0';

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 600, color: textColor, marginBottom: '20px' }}>
        视频教程
      </h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === category 
                ? '#6366f1' 
                : cardBg,
              color: selectedCategory === category ? '#fff' : mutedTextColor,
              border: `1px solid ${selectedCategory === category ? '#6366f1' : borderColor}`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredTutorials.map(tutorial => (
          <div
            key={tutorial.id}
            onClick={() => setSelectedVideo(tutorial)}
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              position: 'relative',
              height: '160px',
              backgroundColor: theme === 'dark' ? '#27272a' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Play size={24} color="#fff" style={{ marginLeft: '4px' }} />
              </div>
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
              }}>
                {tutorial.duration}
              </span>
            </div>
            
            <div style={{ padding: '16px' }}>
              <h4 style={{ color: textColor, fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>
                {tutorial.title}
              </h4>
              <p style={{ color: mutedTextColor, fontSize: '14px', margin: 0 }}>
                {tutorial.description}
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginTop: '12px',
                color: '#6366f1',
                fontSize: '13px',
              }}>
                <span>{tutorial.category}</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
        borderRadius: '12px',
        border: `1px solid ${theme === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
      }}>
        <p style={{ color: textColor, margin: 0, fontSize: '14px' }}>
          更多教程视频请访问我们的{' '}
          <a 
            href="https://space.bilibili.com/your-channel" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            B站官方频道 <ExternalLink size={14} />
          </a>
        </p>
      </div>

      {selectedVideo && (
        <VideoTutorialPlayer
          bvid={selectedVideo.bvid}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
