import React from 'react';
import { FileText, MapPin, Clock, Users, MessageSquare, Sparkles, Loader2, Package, Film, AtSign, FileCode, Wand, Eye } from 'lucide-react';

export interface Dialogue {
  characterName?: string;
  character?: string;
  text?: string;
  lines?: string[];
  action?: string;
  shot?: {
    type: string;
    movement: string;
    angle: string;
    description: string;
    duration: number;
    transition: string;
  };
}

export interface Action {
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

export interface Item {
  name: string;
  size?: string;
  shape?: string;
  color?: string;
}

export interface Scene {
  id: number | string;
  number?: number;
  heading?: string;
  location?: string;
  time?: string;
  description: string;
  characters?: string[];
  dialogues?: Dialogue[];
  actions?: Action[];
  items?: Item[];
  dialogue?: Dialogue[];
  action?: string;
  type?: string;
}

export interface Character {
  id?: string;
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
  lines?: number | string[];
}

interface ScriptPreviewPanelProps {
  scenes: Scene[];
  characters: Character[];
  items?: Item[];
  onEdit: () => void;
  onGenerateAssets: () => void;
  isGenerating: boolean;
  onParse: () => void;
  isParsing: boolean;
  hasContent: boolean;
}

export function ScriptPreviewPanel({
  scenes,
  characters,
  items: propItems,
  onEdit,
  onGenerateAssets,
  isGenerating,
  onParse,
  isParsing,
  hasContent,
}: ScriptPreviewPanelProps) {
  const sceneItems = scenes.flatMap((s: any) => s.items || []);
  const allItems = propItems && propItems.length > 0 ? propItems : sceneItems;
  const uniqueItems = Array.from(new Map(allItems.map((i: any) => [i.name, i])).values());
  
  const shots = generateShots(scenes);
  const shotCount = shots.length;
  const itemCount = uniqueItems.length;

  return (
    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ 
        padding: '28px', 
        maxWidth: '900px', 
        margin: '0 auto', 
        borderRadius: '20px', 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-primary)', 
        backdropFilter: 'blur(20px)',
      }}>
        <PreviewHeader 
          onEdit={onEdit} 
          onGenerateAssets={onGenerateAssets} 
          isGenerating={isGenerating}
          hasScenes={scenes.length > 0}
        />
        
        <StatsGrid 
          sceneCount={scenes.length} 
          characterCount={characters.length} 
          itemCount={itemCount} 
          shotCount={shotCount} 
        />
        
        {characters.length > 0 && (
          <CharacterList characters={characters} />
        )}

        <ItemList items={uniqueItems} />

        <ShotList shots={shots} />

        <SceneList scenes={scenes} />

        {scenes.length === 0 && hasContent && (
          <EmptyState onParse={onParse} isParsing={isParsing} />
        )}
      </div>
    </div>
  );
}

function generateShots(scenes: Scene[]) {
  const shots: any[] = [];
  let shotOrder = 0;

  scenes.forEach((scene: any) => {
    const sceneId = scene.id;
    const sceneName = scene.heading || scene.description?.substring(0, 30) || `场景 ${scene.id}`;
    
    const dialogues = scene.dialogues || scene.dialogue || [];
    if (Array.isArray(dialogues)) {
      dialogues.forEach((d: any, idx: number) => {
        shotOrder++;
        const charName = d.characterName || d.character || '角色';
        const text = d.text || (d.lines && d.lines.join('')) || '';
        shots.push({
          id: `shot_${sceneId}_${idx}`,
          order: shotOrder,
          description: `${charName}: ${text}`,
          duration: d.shot?.duration || Math.max(3, Math.ceil(text.length / 8)),
          characters: [charName],
          items: scene.items?.map((i: any) => i.name) || [],
          sceneId,
          sceneName,
          shot: d.shot,
        });
      });
    }

    const actions = scene.actions || (scene.action ? [{ description: scene.action, type: 'action' }] : []);
    if (Array.isArray(actions)) {
      actions.forEach((a: any, idx: number) => {
        shotOrder++;
        shots.push({
          id: `shot_${sceneId}_action_${idx}`,
          order: shotOrder,
          description: a.description,
          duration: a.shot?.duration || 3,
          characters: scene.characters || [],
          items: scene.items?.map((i: any) => i.name) || [],
          sceneId,
          sceneName,
          shot: a.shot,
        });
      });
    }
  });

  return shots;
}

function PreviewHeader({ onEdit, onGenerateAssets, isGenerating, hasScenes }: {
  onEdit: () => void;
  onGenerateAssets: () => void;
  isGenerating: boolean;
  hasScenes: boolean;
}) {
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
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FileText style={{ width: '16px', height: '16px', color: 'white' }} />
          </div>
          剧本统计
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>剧本解析结果概览</p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onGenerateAssets}
          disabled={isGenerating || !hasScenes}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: 'none',
            background: isGenerating || !hasScenes ? 'var(--bg-hover)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: isGenerating || !hasScenes ? 'var(--text-muted)' : '#fff',
            fontSize: '13px',
            fontWeight: '500',
            cursor: isGenerating || !hasScenes ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isGenerating ? (
            <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Wand style={{ width: '14px', height: '14px' }} />
          )}
          {isGenerating ? '生成中...' : '生成资产'}
        </button>
        <button
          onClick={onEdit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-hover)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <FileCode style={{ width: '14px', height: '14px' }} />
          编辑
        </button>
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
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}

function CharacterList({ characters }: { characters: Character[] }) {
  return (
    <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-primary)' }}>
      <SectionTitle icon={<Users style={{ width: '14px', height: '14px', color: 'white' }} />} color="#10b981">
        角色列表
      </SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {characters.map((char, idx) => (
          <CharacterCard key={char.id || char.name || idx} character={char} />
        ))}
      </div>
    </div>
  );
}

function CharacterCard({ character }: { character: Character }) {
  const appearanceDesc = getAppearanceDesc(character);
  const lines = character.lines;
  const personality = character.personality;

  return (
    <div style={{
      padding: '14px',
      background: 'var(--bg-hover)',
      borderRadius: '12px',
      border: '1px solid var(--border-primary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: appearanceDesc || personality ? '10px' : 0 }}>
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
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{character.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {lines ? `${Array.isArray(lines) ? lines.length : lines} 句台词` : ''}
          </div>
        </div>
      </div>
      {appearanceDesc && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', paddingLeft: '48px', marginBottom: personality ? '8px' : 0 }}>
          <span style={{ color: '#10b981', fontWeight: '500' }}>外貌：</span>
          {appearanceDesc}
        </div>
      )}
      {personality && Array.isArray(personality) && personality.length > 0 && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '48px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>性格：</span>
          {personality.join('、')}
        </div>
      )}
    </div>
  );
}

function getAppearanceDesc(character: Character): string | null {
  const parts: string[] = [];
  const appearance = character.appearance;
  const costume = character.costume;

  if (typeof appearance === 'object' && appearance !== null) {
    if (appearance.hairStyle) parts.push(appearance.hairStyle);
    if (appearance.facialFeatures) parts.push(appearance.facialFeatures);
    if (appearance.bodyProportion) parts.push(appearance.bodyProportion);
    if (appearance.otherDetails) parts.push(...appearance.otherDetails);
  } else if (typeof appearance === 'string') {
    parts.push(appearance);
  }

  if (costume && typeof costume === 'object') {
    const costumeParts = [costume.type].filter(Boolean);
    if (costume.color) costumeParts.push(costume.color);
    if (costume.material) costumeParts.push(costume.material);
    if (costume.decoration) costumeParts.push(costume.decoration);
    if (costumeParts.length > 0) parts.push(`穿着${costumeParts.join('、')}`);
  }

  return parts.length > 0 ? parts.join('，') : null;
}

function ItemList({ items }: { items: Item[] }) {
  return (
    <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-primary)' }}>
      <SectionTitle icon={<Package style={{ width: '14px', height: '14px', color: 'white' }} />} color="#f59e0b">
        物品列表
      </SectionTitle>
      {items.length === 0 ? (
        <EmptyMessage message="暂无物品数据" />
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
    </div>
  );
}

function ShotList({ shots }: { shots: any[] }) {
  return (
    <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-primary)' }}>
      <SectionTitle icon={<Film style={{ width: '14px', height: '14px', color: 'white' }} />} color="#ec4899">
        分镜列表
      </SectionTitle>
      {shots.length === 0 ? (
        <EmptyMessage message="暂无分镜数据" />
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
    </div>
  );
}

function ShotCard({ shot }: { shot: any }) {
  return (
    <div style={{
      padding: '12px 14px',
      background: 'var(--bg-hover)',
      borderRadius: '12px',
      border: '1px solid var(--border-primary)',
    }}>
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
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>~{shot.duration}s</span>
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
    </div>
  );
}

function SceneList({ scenes }: { scenes: Scene[] }) {
  return (
    <>
      <SectionTitle icon={<Eye style={{ width: '14px', height: '14px', color: 'white' }} />} color="#ec4899">
        场景预览
      </SectionTitle>
      {scenes.map((scene) => (
        <SceneCard key={scene.id} scene={scene} />
      ))}
    </>
  );
}

function SceneCard({ scene }: { scene: Scene }) {
  const [hover, setHover] = React.useState(false);

  return (
    <div 
      style={{
        marginBottom: '16px',
        padding: '20px',
        background: hover ? 'var(--bg-input)' : 'var(--bg-hover)',
        borderRadius: '16px',
        border: `1px solid ${hover ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-primary)'}`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.1)' : 'none',
      }} 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ 
          padding: '4px 10px', 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
          borderRadius: '8px', 
          fontSize: '11px', 
          fontWeight: '600', 
          color: 'white' 
        }}>场景 {scene.id}</span>
        {scene.location && (
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
            {scene.location}
          </span>
        )}
        {scene.time && (
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
            {scene.time}
          </span>
        )}
      </div>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
        {scene.heading || scene.description}
      </h3>
      {scene.description && scene.heading && scene.description !== scene.heading && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.6' }}>
          {scene.description}
        </p>
      )}
      {scene.action && <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.6' }}>({scene.action})</p>}
      
      {scene.items && scene.items.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px' }}>物品:</span>
          {scene.items.map((item, idx) => (
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

      {scene.characters && scene.characters.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px' }}>角色:</span>
          {scene.characters.map((char, idx) => (
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

      {(scene.dialogues || scene.dialogue) && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare style={{ width: '12px', height: '12px' }} />
            对话 ({(scene.dialogues || scene.dialogue || []).length})
          </div>
          {(scene.dialogues || scene.dialogue || []).slice(0, 3).map((d: any, i: number) => {
            const charName = d.characterName || d.character || '未知';
            const text = d.text || (d.lines && d.lines.join('')) || '';
            if (!text) return null;
            return (
              <div key={i} style={{ marginBottom: '4px', paddingLeft: '10px', borderLeft: '2px solid var(--border-primary)' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#60a5fa' }}>{charName}：</span>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{text.substring(0, 50)}{text.length > 50 ? '...' : ''}</span>
              </div>
            );
          })}
          {(scene.dialogues || scene.dialogue || []).length > 3 && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '10px' }}>
              还有 {(scene.dialogues || scene.dialogue || []).length - 3} 条对话...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onParse, isParsing }: { onParse: () => void; isParsing: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', background: 'var(--bg-hover)', borderRadius: '16px', border: '2px dashed var(--border-primary)' }}>
      <FileText style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.5 }} />
      <p style={{ fontSize: '14px', marginBottom: '16px' }}>点击"解析"按钮查看剧本预览</p>
      <button
        onClick={onParse}
        disabled={isParsing}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 18px',
          borderRadius: '10px',
          border: 'none',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#fff',
          fontSize: '13px',
          fontWeight: '500',
          cursor: isParsing ? 'not-allowed' : 'pointer',
          opacity: isParsing ? 0.7 : 1,
        }}
      >
        {isParsing ? (
          <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
        ) : (
          <Sparkles style={{ width: '16px', height: '16px' }} />
        )}
        {isParsing ? '解析中...' : '解析剧本'}
      </button>
    </div>
  );
}

function SectionTitle({ icon, color, children }: { icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      {children}
    </h2>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-hover)', borderRadius: '10px', fontSize: '13px' }}>
      {message}
    </div>
  );
}
