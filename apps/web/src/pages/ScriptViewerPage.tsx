import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Eye,
  FileDown,
  Share2,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { apiClient } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';

interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Scene {
  id: number;
  description: string;
  type: string;
  dialogue: Array<{
    character: string;
    lines: string[];
    action?: string;
  }>;
  action?: string;
}

const ScriptViewerPage = () => {
  const { projectId, scriptId } = useParams<{ projectId: string; scriptId: string }>();
  const { theme } = useTheme();
  const { addToast } = useToast();

  const [script, setScript] = useState<Script | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const mutedTextColor = theme === 'dark' ? '#a1a1aa' : '#64748b';
  const cardBg = theme === 'dark' ? '#18181b' : '#ffffff';
  const borderColor = theme === 'dark' ? '#27272a' : '#e2e8f0';
  const inputBg = theme === 'dark' ? '#09090b' : '#f8fafc';

  useEffect(() => {
    const fetchScript = async () => {
      if (!scriptId || !projectId) return;

      try {
        setLoading(true);
        const scriptData = await apiClient.getScript(scriptId);
        setScript(scriptData);
        
        if (scriptData.content) {
          const parsed = parseScript(scriptData.content);
          setScenes(parsed.scenes);
          setCharacters(parsed.characters);
        }
      } catch (error) {
        console.error('获取剧本失败:', error);
        addToast({
          type: 'error',
          title: '加载失败',
          message: '无法加载剧本内容，请稍后重试。',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [scriptId, projectId, addToast]);

  const parseScript = (content: string) => {
    const scenes: Scene[] = [];
    const charactersSet = new Set<string>();
    const lines = content.split('\n');
    let currentScene: Scene | null = null;
    let sceneId = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const sceneMatch = trimmedLine.match(/^(场景\d+|场景\s*\d+|Scene\s*\d+)\s*[-：:]\s*(.+)/i);
      const bracketSceneMatch = trimmedLine.match(/^\[场景(\d+)\]\s*(.+)/i);

      if (sceneMatch || bracketSceneMatch) {
        if (currentScene) {
          scenes.push(currentScene);
        }
        sceneId++;
        const description = bracketSceneMatch ? bracketSceneMatch[2] : sceneMatch![2];
        const sceneType = bracketSceneMatch?.[1] || sceneMatch![1].replace(/[^\d]/g, '');
        currentScene = {
          id: sceneId,
          description: description.trim(),
          type: sceneType,
          dialogue: [],
        };
        continue;
      }

      if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')') && currentScene) {
        const action = trimmedLine.substring(1, trimmedLine.length - 1).trim();
        if (currentScene.dialogue.length > 0) {
          const lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
          lastDialogue.action = action;
        } else {
          currentScene.action = action;
        }
        continue;
      }

      const characterMatch = trimmedLine.match(/^([^\uff1a\uff3b::：:]+)[\uff1a\uff3b::：:]\s*(.+)/);
      if (characterMatch && currentScene) {
        const character = characterMatch[1].trim();
        const text = characterMatch[2].trim();
        charactersSet.add(character);

        const lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
        if (lastDialogue && lastDialogue.character === character) {
          lastDialogue.lines.push(text);
        } else {
          currentScene.dialogue.push({
            character,
            lines: [text],
          });
        }
      }
    }

    if (currentScene) {
      scenes.push(currentScene);
    }

    return {
      scenes,
      characters: Array.from(charactersSet),
    };
  };

  const handleCopyScript = () => {
    if (!script?.content) return;

    navigator.clipboard.writeText(script.content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        addToast({
          type: 'success',
          title: '复制成功',
          message: '剧本内容已复制到剪贴板',
        });
      })
      .catch(() => {
        addToast({
          type: 'error',
          title: '复制失败',
          message: '无法复制剧本内容，请手动复制',
        });
      });
  };

  const handleExport = () => {
    if (!script?.content || !script?.title) return;

    const blob = new Blob([script.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title || '剧本'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!script) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FileText style={{ width: '48px', height: '48px', color: mutedTextColor, marginBottom: '16px' }} />
          <p style={{ color: mutedTextColor }}>剧本不存在或已被删除</p>
          <Button
            variant="outline"
            size="sm"
            style={{ marginTop: '16px' }}
            onClick={() => window.history.back()}
          >
            <ArrowLeft style={{ width: '14px', height: '14px', marginRight: '8px' }} />
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{
        height: '64px',
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: cardBg,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to={`/projects/${projectId}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: mutedTextColor,
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = inputBg;
              e.currentTarget.style.color = textColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = mutedTextColor;
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
          </Link>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: textColor, margin: 0 }}>
            {script.title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyScript}
          >
            {copied ? (
              <>
                <Check style={{ width: '14px', height: '14px', marginRight: '8px' }} />
                已复制
              </>
            ) : (
              <>
                <Copy style={{ width: '14px', height: '14px', marginRight: '8px' }} />
                复制
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <FileDown style={{ width: '14px', height: '14px', marginRight: '8px' }} />
            导出
          </Button>

          <Button
            variant="outline"
            size="sm"
          >
            <Share2 style={{ width: '14px', height: '14px', marginRight: '8px' }} />
            分享
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/projects/${projectId}/scripts/${scriptId}/edit`}>
              <Eye style={{ width: '14px', height: '14px', marginRight: '8px' }} />
              编辑
            </Link>
          </Button>
        </div>
      </header>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <Card style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: `1px solid ${borderColor}` }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: textColor, marginBottom: '16px', margin: '0 0 16px 0' }}>
              剧本信息
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: inputBg, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: mutedTextColor, marginBottom: '4px' }}>创建时间</div>
                <div style={{ fontSize: '14px', color: textColor }}>
                  {new Date(script.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: inputBg, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: mutedTextColor, marginBottom: '4px' }}>更新时间</div>
                <div style={{ fontSize: '14px', color: textColor }}>
                  {new Date(script.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: inputBg, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: mutedTextColor, marginBottom: '4px' }}>场景数量</div>
                <div style={{ fontSize: '14px', color: textColor }}>
                  {scenes.length}
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: inputBg, borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: mutedTextColor, marginBottom: '4px' }}>角色数量</div>
                <div style={{ fontSize: '14px', color: textColor }}>
                  {characters.length}
                </div>
              </div>
            </div>
          </div>

          {characters.length > 0 && (
            <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: `1px solid ${borderColor}` }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: textColor, marginBottom: '16px', margin: '0 0 16px 0' }}>
                角色列表
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {characters.map((char) => (
                  <span
                    key={char}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#6366f1',
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          )}

          <h2 style={{ fontSize: '16px', fontWeight: '600', color: textColor, marginBottom: '24px', margin: '0 0 24px 0' }}>
            剧本内容
          </h2>

          {scenes.length > 0 ? (
            scenes.map((scene) => (
              <div key={scene.id} style={{ marginBottom: '32px', padding: '24px', backgroundColor: inputBg, borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{
                    padding: '6px 16px',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6366f1',
                  }}>
                    场景 {scene.id}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: textColor, margin: 0 }}>
                    {scene.description}
                  </h3>
                </div>

                {scene.action && (
                  <p style={{ fontSize: '14px', color: mutedTextColor, fontStyle: 'italic', marginBottom: '16px', margin: '0 0 16px 0' }}>
                    ({scene.action})
                  </p>
                )}

                {scene.dialogue && scene.dialogue.map((d, i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '6px 16px',
                        backgroundColor: cardBg,
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                      }}>
                        {d.character}
                      </span>
                    </div>
                    <div style={{ marginLeft: '28px' }}>
                      {d.lines.map((line: string, j: number) => (
                        <p key={j} style={{
                          fontSize: '16px',
                          color: textColor,
                          margin: '0 0 8px 0',
                          lineHeight: '1.6',
                        }}>
                          {line}
                        </p>
                      ))}
                    </div>
                    {d.action && (
                      <p style={{
                        fontSize: '14px',
                        color: mutedTextColor,
                        fontStyle: 'italic',
                        margin: '8px 0 0 28px',
                      }}>
                        ({d.action})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '64px 24px',
              color: mutedTextColor,
              backgroundColor: inputBg,
              borderRadius: '12px',
            }}>
              <FileText style={{ width: '64px', height: '64px', marginBottom: '16px', display: 'inline-block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>
                剧本内容为空
              </h3>
              <p style={{ margin: '0' }}>请编辑剧本以添加内容</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ScriptViewerPage;
