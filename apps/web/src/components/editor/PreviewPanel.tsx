import React, { useState } from 'react';
import { FileText, Eye, FileCode, MapPin, Clock, Users, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button-new';

interface Dialogue {
  characterName: string;
  text: string;
}

interface Action {
  description: string;
  type: string;
}

interface Scene {
  id: string | number;
  number?: number;
  heading?: string;
  location?: string;
  time?: string;
  description: string;
  characters?: string[];
  dialogues?: Dialogue[];
  actions?: Action[];
  dialogue?: any[];
  action?: string;
  type?: string;
}

interface Character {
  id: string;
  name: string;
  description?: string;
  lines?: number;
}

interface PreviewPanelProps {
  scenes: Scene[];
  characters: Character[] | string[];
  onEdit: () => void;
}

export function PreviewPanel({ scenes, characters, onEdit }: PreviewPanelProps) {
  const characterList = Array.isArray(characters) 
    ? characters.map(c => typeof c === 'string' ? c : c.name)
    : [];

  return (
    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ 
        padding: '28px', 
        maxWidth: '1000px', 
        margin: '0 auto', 
        borderRadius: '20px', 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-primary)', 
        backdropFilter: 'blur(20px)',
      }}>
        <PreviewHeader onEdit={onEdit} />
        <StatsGrid sceneCount={scenes.length} characterCount={characterList.length} />
        
        {characterList.length > 0 && (
          <CharacterList characters={characterList} />
        )}

        <SceneList scenes={scenes} />
      </div>
    </div>
  );
}

function PreviewHeader({ onEdit }: { onEdit: () => void }) {
  return (
    <div style={{ 
      marginBottom: '28px', 
      paddingBottom: '24px', 
      borderBottom: '1px solid var(--border-primary)', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start' 
    }}>
      <div>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--text-primary)', 
          marginBottom: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px' 
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FileText style={{ width: '16px', height: '16px', color: 'white' }} />
          </div>
          剧本解析结果
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>解析完成，以下是提取的场景和角色信息</p>
      </div>
      <Button variant="outline" size="sm" onClick={onEdit} icon={<FileCode style={{ width: '14px', height: '14px' }} />}>返回编辑</Button>
    </div>
  );
}

function StatsGrid({ sceneCount, characterCount }: { sceneCount: number; characterCount: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px' }}>
      <StatCard label="场景数量" value={sceneCount} icon={<MapPin style={{ width: '20px', height: '20px' }} />} color="#007AFF" />
      <StatCard label="角色数量" value={characterCount} icon={<Users style={{ width: '20px', height: '20px' }} />} color="#10b981" />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ 
      padding: '20px', 
      background: 'var(--bg-hover)', 
      borderRadius: '16px', 
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      border: '1px solid var(--border-primary)',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}

function CharacterList({ characters }: { characters: string[] }) {
  return (
    <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-primary)' }}>
      <h2 style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        color: 'var(--text-primary)', 
        marginBottom: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px' 
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Users style={{ width: '14px', height: '14px', color: 'white' }} />
        </div>
        角色列表
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {characters.map((char, idx) => (
          <CharacterTag key={idx} name={char} />
        ))}
      </div>
    </div>
  );
}

function CharacterTag({ name }: { name: string }) {
  const [hover, setHover] = useState(false);

  return (
    <span 
      style={{
        padding: '8px 16px',
        background: hover ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)',
        border: `1px solid ${hover ? 'rgba(0, 122, 255, 0.4)' : 'rgba(0, 122, 255, 0.2)'}`,
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '500',
        color: '#60a5fa',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? '0 4px 12px rgba(0, 122, 255, 0.2)' : 'none',
      }} 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
    >
      {name}
    </span>
  );
}

function SceneList({ scenes }: { scenes: Scene[] }) {
  return (
    <>
      <h2 style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        color: 'var(--text-primary)', 
        marginBottom: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px' 
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Eye style={{ width: '14px', height: '14px', color: 'white' }} />
        </div>
        场景列表
      </h2>

      {scenes.map((scene, idx) => (
        <SceneCard key={scene.id || idx} scene={scene} index={idx} />
      ))}
    </>
  );
}

function SceneCard({ scene, index }: { scene: Scene; index: number }) {
  const [hover, setHover] = useState(false);
  
  const sceneNumber = scene.number || index + 1;
  const heading = scene.heading || scene.description?.substring(0, 50) || `场景 ${sceneNumber}`;
  const location = scene.location;
  const time = scene.time;
  const description = scene.description;
  const dialogues = scene.dialogues || scene.dialogue || [];
  const actions = scene.actions || (scene.action ? [{ description: scene.action, type: 'action' }] : []);
  const sceneCharacters = scene.characters || [];

  return (
    <div 
      style={{
        marginBottom: '16px',
        padding: '20px',
        background: 'var(--bg-hover)',
        borderRadius: '16px',
        border: `1px solid ${hover ? 'rgba(0, 122, 255, 0.3)' : 'var(--border-primary)'}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.1)' : 'none',
      }} 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <span style={{ 
          padding: '4px 12px', 
          background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)', 
          borderRadius: '8px', 
          fontSize: '12px', 
          fontWeight: '600', 
          color: 'white' 
        }}>场景 {sceneNumber}</span>
        
        {location && (
          <span style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px', 
            background: 'rgba(99, 102, 241, 0.1)', 
            borderRadius: '6px', 
            fontSize: '12px', 
            color: '#818cf8'
          }}>
            <MapPin style={{ width: '12px', height: '12px' }} />
            {location}
          </span>
        )}
        
        {time && (
          <span style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            borderRadius: '6px', 
            fontSize: '12px', 
            color: '#f59e0b'
          }}>
            <Clock style={{ width: '12px', height: '12px' }} />
            {time}
          </span>
        )}
      </div>
      
      <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
        {heading}
      </h3>
      
      {description && description !== heading && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
          {description}
        </p>
      )}
      
      {sceneCharacters.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>出场角色</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {sceneCharacters.map((char, idx) => (
              <span key={idx} style={{
                padding: '4px 10px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#10b981',
              }}>
                {char}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {dialogues.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare style={{ width: '14px', height: '14px' }} />
            对话 ({dialogues.length})
          </div>
          {dialogues.map((d, idx) => {
            const charName = d.characterName || d.character || '未知';
            const text = d.text || d.lines || '';
            if (!text) return null;
            return (
              <div key={idx} style={{ marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid var(--border-primary)' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#60a5fa' }}>{charName}：</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{text}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {actions.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>动作</div>
          {actions.map((a, idx) => (
            <p key={idx} style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 4px 0', lineHeight: '1.6' }}>
              ({a.description})
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
