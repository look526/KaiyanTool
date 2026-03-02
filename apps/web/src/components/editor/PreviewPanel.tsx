import React, { useState } from 'react';
import { FileText, Eye, FileCode, MapPin, Clock, Users, MessageSquare, Sparkles, Loader2, Package, Film, AtSign } from 'lucide-react';
import { Button } from '../ui/button-new';

interface Dialogue {
  characterName: string;
  text: string;
  shot?: {
    type: string;
    movement: string;
    angle: string;
    description: string;
    duration: number;
    transition: string;
  };
}

interface Action {
  description: string;
  type: string;
  shot?: {
    type: string;
    movement: string;
    angle: string;
    description: string;
    duration: number;
    transition: string;
  };
}

interface Item {
  name: string;
  size?: string;
  shape?: string;
  color?: string;
}

interface Shot {
  id: string;
  order: number;
  description: string;
  duration?: number;
  characters: string[];
  items: string[];
  sceneId: string;
  sceneName?: string;
  dialogue?: string;
  action?: string;
  shot?: Dialogue['shot'];
  notes?: string;
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
  items?: Item[];
  dialogue?: any[];
  action?: string;
  type?: string;
}

interface Character {
  id: string;
  name: string;
  description?: string;
  appearance?: {
    hairStyle?: string;
    facialFeatures?: string;
    bodyProportion?: string;
    otherDetails?: string[];
  } | string;
  costume?: {
    type?: string;
    color?: string;
    material?: string;
    decoration?: string;
  };
  personality?: string[];
  lines?: number;
}

interface PreviewPanelProps {
  scenes: Scene[];
  characters: Character[] | string[] | Array<string | { name: string; description?: string; appearance?: string }>;
  onEdit: () => void;
  onGenerateAssets?: () => void;
  isGenerating?: boolean;
}

export function PreviewPanel({ scenes, characters, onEdit, onGenerateAssets, isGenerating }: PreviewPanelProps) {
  // 调试日志
  console.log('[PreviewPanel] scenes:', scenes);
  console.log('[PreviewPanel] characters:', characters);
  
  const characterData: Character[] = Array.isArray(characters) 
    ? characters.map((c, idx) => {
        if (typeof c === 'string') {
          return { id: `char_${idx}`, name: c };
        }
        const char = c as Character;
        return { 
          id: char.id || `char_${idx}`, 
          name: char.name, 
          description: char.description,
          appearance: char.appearance,
          costume: char.costume,
          personality: char.personality,
          lines: char.lines || 0
        };
      })
    : [];

  const allItems = scenes.flatMap(s => s.items || []);
  const uniqueItems = Array.from(new Map(allItems.map(i => [i.name, i])).values());
  const shots = generateShots(scenes);
  
  console.log('[PreviewPanel] allItems:', allItems);
  console.log('[PreviewPanel] uniqueItems:', uniqueItems);
  console.log('[PreviewPanel] shots:', shots);

  return (
    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ 
        padding: '28px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        borderRadius: '20px', 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-primary)', 
        backdropFilter: 'blur(20px)',
      }}>
        <PreviewHeader onEdit={onEdit} onGenerateAssets={onGenerateAssets} isGenerating={isGenerating} hasScenes={scenes.length > 0} />
        
        <StatsGrid sceneCount={scenes.length} characterCount={characterData.length} itemCount={uniqueItems.length} shotCount={shots.length} />
        
        {characterData.length > 0 && (
          <CharacterList characters={characterData} />
        )}

        <ItemList items={uniqueItems} />

        <ShotList shots={shots} />

        <SceneList scenes={scenes} />
      </div>
    </div>
  );
}

function generateShots(scenes: Scene[]): Shot[] {
  const shots: Shot[] = [];
  let shotOrder = 0;

  scenes.forEach((scene) => {
    const sceneId = String(scene.id);
    const sceneName = scene.heading || scene.description?.substring(0, 30) || `场景 ${scene.number}`;
    
    if (scene.dialogues && scene.dialogues.length > 0) {
      scene.dialogues.forEach((dialogue, idx) => {
        shotOrder++;
        shots.push({
          id: `shot_${sceneId}_${idx}`,
          order: shotOrder,
          description: `${dialogue.characterName}: ${dialogue.text}`,
          duration: dialogue.shot?.duration || estimateDuration(dialogue.text),
          characters: [dialogue.characterName],
          items: scene.items?.map(i => i.name) || [],
          sceneId,
          sceneName,
          dialogue: dialogue.text,
          shot: dialogue.shot,
        });
      });
    }

    if (scene.actions && scene.actions.length > 0) {
      scene.actions.forEach((action, idx) => {
        shotOrder++;
        shots.push({
          id: `shot_${sceneId}_action_${idx}`,
          order: shotOrder,
          description: action.description,
          duration: action.shot?.duration || 3,
          characters: scene.characters || [],
          items: scene.items?.map(i => i.name) || [],
          sceneId,
          sceneName,
          action: action.description,
          shot: action.shot,
        });
      });
    }
  });

  return shots;
}

function estimateDuration(text: string): number {
  const charCount = text.length;
  return Math.max(2, Math.ceil(charCount / 10));
}

function PreviewHeader({ onEdit, onGenerateAssets, isGenerating, hasScenes }: { 
  onEdit: () => void; 
  onGenerateAssets?: () => void;
  isGenerating?: boolean;
  hasScenes: boolean;
}) {
  const [generateHover, setGenerateHover] = useState(false);

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
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>解析完成，可生成角色、物品、场景和分镜资产</p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="outline" size="sm" onClick={onEdit} icon={<FileCode style={{ width: '14px', height: '14px' }} />}>返回编辑</Button>
        {onGenerateAssets && (
          <button
            onClick={onGenerateAssets}
            disabled={isGenerating || !hasScenes}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: (isGenerating || !hasScenes) 
                ? 'rgba(99, 102, 241, 0.5)' 
                : generateHover 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              cursor: (isGenerating || !hasScenes) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: (isGenerating || !hasScenes) ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={() => setGenerateHover(true)}
            onMouseLeave={() => setGenerateHover(false)}
          >
            {isGenerating ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Sparkles style={{ width: '16px', height: '16px' }} />
            )}
            {isGenerating ? '生成中...' : '生成资产'}
          </button>
        )}
      </div>
    </div>
  );
}

function StatsGrid({ sceneCount, characterCount, itemCount, shotCount }: { 
  sceneCount: number; 
  characterCount: number;
  itemCount: number;
  shotCount: number;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
      <StatCard label="场景" value={sceneCount} icon={<MapPin style={{ width: '18px', height: '18px' }} />} color="#007AFF" />
      <StatCard label="角色" value={characterCount} icon={<Users style={{ width: '18px', height: '18px' }} />} color="#10b981" />
      <StatCard label="物品" value={itemCount} icon={<Package style={{ width: '18px', height: '18px' }} />} color="#f59e0b" />
      <StatCard label="分镜" value={shotCount} icon={<Film style={{ width: '18px', height: '18px' }} />} color="#ec4899" />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ 
      padding: '16px', 
      background: 'var(--bg-hover)', 
      borderRadius: '14px', 
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: '1px solid var(--border-primary)',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}

function CharacterList({ characters }: { characters: Character[] }) {
  return (
    <Section title="角色列表" icon={<Users style={{ width: '14px', height: '14px' }} />} color="#10b981">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {characters.map((char, idx) => (
          <CharacterCard key={char.id || idx} character={char} />
        ))}
      </div>
    </Section>
  );
}

function CharacterCard({ character }: { character: Character }) {
  const [hover, setHover] = useState(false);

  // 获取外貌描述
  const getAppearanceDesc = () => {
    const parts: string[] = [];
    
    if (typeof character.appearance === 'object' && character.appearance !== null) {
      const app = character.appearance;
      if (app.hairStyle) parts.push(app.hairStyle);
      if (app.facialFeatures) parts.push(app.facialFeatures);
      if (app.bodyProportion) parts.push(app.bodyProportion);
      if (app.otherDetails && Array.isArray(app.otherDetails)) {
        parts.push(...app.otherDetails);
      }
    } else if (typeof character.appearance === 'string') {
      parts.push(character.appearance);
    }
    
    if (character.costume?.type) {
      const costumeParts = [character.costume.type];
      if (character.costume.color) costumeParts.push(character.costume.color);
      if (character.costume.material) costumeParts.push(character.costume.material);
      if (character.costume.decoration) costumeParts.push(character.costume.decoration);
      parts.push(`穿着${costumeParts.join('、')}`);
    }
    
    return parts.length > 0 ? parts.join('，') : null;
  };

  const appearanceDesc = getAppearanceDesc();

  return (
    <div 
      style={{
        padding: '14px',
        background: hover ? 'var(--bg-input)' : 'var(--bg-hover)',
        borderRadius: '12px',
        border: `1px solid ${hover ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-primary)'}`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: (appearanceDesc || character.personality) ? '10px' : 0 }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          {character.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {character.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {character.lines !== undefined ? `${character.lines} 句台词` : ''}
            {character.description && character.lines !== undefined ? ' · ' : ''}
            {character.description}
          </div>
        </div>
      </div>
      
      {appearanceDesc && (
        <div style={{ 
          fontSize: '13px', 
          color: 'var(--text-secondary)', 
          lineHeight: '1.6',
          paddingLeft: '48px',
          marginBottom: character.personality ? '8px' : 0,
        }}>
          <span style={{ color: '#10b981', fontWeight: '500' }}>外貌：</span>
          {appearanceDesc}
        </div>
      )}
      
      {character.personality && character.personality.length > 0 && (
        <div style={{ 
          fontSize: '12px', 
          color: 'var(--text-muted)', 
          paddingLeft: '48px',
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>性格：</span>
          {character.personality.join('、')}
        </div>
      )}
    </div>
  );
}

function ItemList({ items }: { items: Item[] }) {
  return (
    <Section title="物品列表" icon={<Package style={{ width: '14px', height: '14px' }} />} color="#f59e0b">
      {items.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          background: 'var(--bg-hover)',
          borderRadius: '10px',
          fontSize: '13px',
        }}>
          暂无物品数据
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{
              padding: '10px 14px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#f59e0b',
            }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.name}</div>
            {(item.size || item.shape || item.color) && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {[item.size, item.shape, item.color].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </Section>
  );
}

function ShotList({ shots }: { shots: Shot[] }) {
  return (
    <Section title="分镜列表" icon={<Film style={{ width: '14px', height: '14px' }} />} color="#ec4899">
      {shots.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          background: 'var(--bg-hover)',
          borderRadius: '10px',
          fontSize: '13px',
        }}>
          暂无分镜数据
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shots.slice(0, 10).map((shot) => (
            <ShotCard key={shot.id} shot={shot} />
          ))}
          {shots.length > 10 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '8px' }}>
              还有 {shots.length - 10} 个分镜...
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

function ShotCard({ shot }: { shot: Shot }) {
  const [hover, setHover] = useState(false);

  return (
    <div 
      style={{
        padding: '12px 14px',
        background: hover ? 'var(--bg-input)' : 'var(--bg-hover)',
        borderRadius: '12px',
        border: `1px solid ${hover ? 'rgba(236, 72, 153, 0.3)' : 'var(--border-primary)'}`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <span style={{
          padding: '2px 8px',
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          color: 'white',
        }}>
          #{shot.order}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          ~{shot.duration}s
        </span>
        {shot.sceneName && (
          <span style={{
            fontSize: '11px',
            color: '#818cf8',
            background: 'rgba(99, 102, 241, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>
            {shot.sceneName}
          </span>
        )}
        {shot.shot && (
          <span style={{
            fontSize: '10px',
            color: '#ec4899',
            background: 'rgba(236, 72, 153, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}>
            {shot.shot.type} · {shot.shot.movement}
          </span>
        )}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
        {shot.description}
      </div>
      {shot.shot?.description && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', paddingLeft: '10px', borderLeft: '2px solid var(--border-primary)' }}>
          镜头：{shot.shot.description}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
        {shot.characters.map(c => (
          <span key={c} style={{
            fontSize: '10px',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}>
            <AtSign style={{ width: '10px', height: '10px' }} />
            {c}
          </span>
        ))}
        {shot.items.map(i => (
          <span key={i} style={{
            fontSize: '10px',
            color: '#f59e0b',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}>
            📦 {i}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({ title, icon, color, children }: { 
  title: string; 
  icon: React.ReactNode; 
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-primary)' }}>
      <h3 style={{ 
        fontSize: '14px', 
        fontWeight: '600', 
        color: 'var(--text-primary)', 
        marginBottom: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </div>
        {title}
      </h3>
      {children}
    </div>
  );
}

function SceneList({ scenes }: { scenes: Scene[] }) {
  return (
    <Section title="场景详情" icon={<MapPin style={{ width: '14px', height: '14px' }} />} color="#007AFF">
      {scenes.map((scene, idx) => (
        <SceneCard key={scene.id || idx} scene={scene} index={idx} />
      ))}
    </Section>
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
  const sceneItems = scene.items || [];

  return (
    <div 
      style={{
        marginBottom: '12px',
        padding: '16px',
        background: hover ? 'var(--bg-input)' : 'var(--bg-hover)',
        borderRadius: '14px',
        border: `1px solid ${hover ? 'rgba(0, 122, 255, 0.3)' : 'var(--border-primary)'}`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }} 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <span style={{ 
          padding: '3px 10px', 
          background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)', 
          borderRadius: '6px', 
          fontSize: '11px', 
          fontWeight: '600', 
          color: 'white' 
        }}>场景 {sceneNumber}</span>
        
        {location && (
          <span style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px', 
            background: 'rgba(99, 102, 241, 0.1)', 
            borderRadius: '4px', 
            fontSize: '11px', 
            color: '#818cf8'
          }}>
            <MapPin style={{ width: '10px', height: '10px' }} />
            {location}
          </span>
        )}
        
        {time && (
          <span style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            borderRadius: '4px', 
            fontSize: '11px', 
            color: '#f59e0b'
          }}>
            <Clock style={{ width: '10px', height: '10px' }} />
            {time}
          </span>
        )}
      </div>
      
      <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
        {heading}
      </h4>
      
      {description && description !== heading && (
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.6' }}>
          {description}
        </p>
      )}

      {sceneItems.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px' }}>物品:</span>
          {sceneItems.map((item, idx) => (
            <span key={idx} style={{
              padding: '2px 8px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#f59e0b',
              marginRight: '4px',
            }}>
              {item.name}
            </span>
          ))}
        </div>
      )}
      
      {sceneCharacters.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px' }}>角色:</span>
          {sceneCharacters.map((char, idx) => (
            <span key={idx} style={{
              padding: '2px 8px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#10b981',
              marginRight: '4px',
            }}>
              {char}
            </span>
          ))}
        </div>
      )}
      
      {dialogues.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare style={{ width: '12px', height: '12px' }} />
            对话 ({dialogues.length})
          </div>
          {dialogues.slice(0, 3).map((d, idx) => {
            const charName = d.characterName || d.character || '未知';
            const text = d.text || d.lines || '';
            if (!text) return null;
            return (
              <div key={idx} style={{ marginBottom: '4px', paddingLeft: '10px', borderLeft: '2px solid var(--border-primary)' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#60a5fa' }}>{charName}：</span>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{text.substring(0, 50)}{text.length > 50 ? '...' : ''}</span>
              </div>
            );
          })}
          {dialogues.length > 3 && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '10px' }}>
              还有 {dialogues.length - 3} 条对话...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
