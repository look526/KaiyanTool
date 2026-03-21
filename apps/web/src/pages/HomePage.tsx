import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  Sparkles,
  Edit3,
  BarChart3,
  Scan,
  Lock,
  Image,
  Film,
  Palette,
  Activity,
  Play,
  ArrowRight,
} from 'lucide-react';

const colors = {
  bgDark: '#070d1f',
  primary: '#ba9eff',
  secondary: '#34b5fa',
  tertiary: '#ec63ff',
  onSurface: '#dfe4fe',
  onSurfaceVariant: '#a5aac2',
  surfaceContainerLow: '#0c1326',
  surfaceContainerHigh: '#171f36',
  glassBg: 'rgba(28, 37, 62, 0.4)',
  white: '#ffffff',
  whiteMuted: 'rgba(255, 255, 255, 0.5)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white5: 'rgba(255, 255, 255, 0.05)',
  white8: 'rgba(255, 255, 255, 0.08)',
  white20: 'rgba(255, 255, 255, 0.2)',
};

export default function HomePage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const glassPanelStyle: React.CSSProperties = {
    background: colors.glassBg,
    backdropFilter: 'blur(40px)',
    border: `1px solid ${colors.white8}`,
    borderRadius: '1rem',
  };

  const textGradientStyle = {
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.tertiary} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <div style={{ backgroundColor: colors.bgDark, color: colors.onSurface, overflowX: 'hidden', fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 50,
        background: 'rgba(7, 13, 31, 0.6)',
        backdropFilter: 'blur(48px)',
        borderBottom: `1px solid ${colors.white10}`,
        boxShadow: `0 20px 50px rgba(139, 92, 246, 0.1)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem', height: '5rem', maxWidth: '1440px', margin: '0 auto' }}>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.tertiary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            开演AI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
            <a href="#" style={{ color: colors.onSurfaceVariant, textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = colors.white)}
               onMouseLeave={e => (e.currentTarget.style.color = colors.onSurfaceVariant)}>
              作品展示
            </a>
            <a href="#" style={{ color: colors.onSurfaceVariant, textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = colors.white)}
               onMouseLeave={e => (e.currentTarget.style.color = colors.onSurfaceVariant)}>
              模型
            </a>
            <a href="#" style={{ color: colors.onSurfaceVariant, textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = colors.white)}
               onMouseLeave={e => (e.currentTarget.style.color = colors.onSurfaceVariant)}>
              文档
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              style={{ color: colors.primary, fontWeight: 700, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              登录
            </button>
            <button
              style={{
                background: `linear-gradient(to bottom right, ${colors.primary}, #8455ef)`,
                color: '#39008c',
                padding: '0.625rem 1.5rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 8px 24px rgba(186, 158, 255, 0.2)`,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            >
              立即开始
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section style={{
          position: 'relative',
          padding: '11rem 1.5rem 8rem',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '50%',
            height: '50%',
            background: `${colors.primary}20`,
            borderRadius: '50%',
            filter: 'blur(120px)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '40%',
            height: '40%',
            background: `${colors.tertiary}10`,
            borderRadius: '50%',
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 10, maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{
              ...glassPanelStyle,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              marginBottom: '2rem',
              border: `${colors.white5}`,
            }}>
              <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: colors.tertiary }} className="animate-pulse-slow" />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: colors.onSurfaceVariant }}>媒体的未来已至</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: colors.white,
              marginBottom: '2rem',
              lineHeight: 1.05,
            }}>
              开演AI：编织<span style={textGradientStyle}>电影级</span> <br />的智能创作未来
            </h1>

            <p style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
              color: colors.onSurfaceVariant,
              maxWidth: '42rem',
              margin: '0 auto 3rem',
              fontWeight: 500,
              lineHeight: 1.625,
            }}>
              通过单一提示词编织整个电影宇宙。从超写实的剧本合写到每一帧都完美的生成式视频，开启您的无限创意可能。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
              <button
                style={{
                  padding: '1.25rem 2.5rem',
                  background: colors.primary,
                  color: '#39008c',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: `0 0 40px rgba(186, 158, 255, 0.4)`,
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                免费开始创作
              </button>
              <button
                style={{
                  ...glassPanelStyle,
                  padding: '1.25rem 2.5rem',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: colors.white,
                  border: `${colors.white10}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = colors.white10; }}
                onMouseLeave={e => { e.currentTarget.style.background = colors.glassBg; }}
              >
                <PlayCircle size={28} />
                观看演示视频
              </button>
            </div>
          </div>

          <div style={{ marginTop: '6rem', position: 'relative', width: '100%', maxWidth: '72rem', aspectRatio: '16/9', padding: '0 1rem' }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '0.75rem',
              overflow: 'hidden',
              ...glassPanelStyle,
              border: `${colors.white10}`,
              padding: '1rem',
            }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIxxFsHOLYSH2IaV3LFw251lKLP-THBqD0vvsAVJo-odC4y5mBELcWr1WnGCbUSlVsBqK1GUF9QiKHMJCJR6iPntxXNtWZzyNUU5ByO0GtXYt2-D-L7pTJ8Z91VhPPQHmoT4MyJrzgqrkrhicE5IgWBKZLdhS-uMyClQUiWnsjXs3n_JU8SneFK2bH_Ryu0Vpeixawh2EGiW-RcxIev0P46WldqKdz-1DSlEKdjooCsu614RS62DQcktiPAg5dE_0uKedCU-aeMcc"
                alt="Abstract cinematic landscape"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem', opacity: 0.7 }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to top, ${colors.bgDark} 0%, transparent 50%, transparent 100%)`,
                pointerEvents: 'none',
              }} />
            </div>


          </div>
        </section>

        <section style={{ padding: '8rem 1.5rem', backgroundColor: colors.surfaceContainerLow, position: 'relative' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{ display: 'grid', gap: '5rem', alignItems: 'center' }}>
              <div>
                <h2 style={{
                  fontSize: 'clamp(2.25rem, 5vw, 3rem)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  color: colors.white,
                  marginBottom: '2rem',
                }}>
                  剧本与小说引擎
                </h2>
                <p style={{ color: colors.onSurfaceVariant, fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
                  AI辅助续写、改写、解析，支持强大的Monaco编辑器。它不仅仅是语法检查，更能理解潜台词、角色弧光和叙事节奏。
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <Sparkles size={24} style={{ color: colors.secondary, marginTop: '0.25rem' }} />
                    <div>
                      <h4 style={{ fontWeight: 700, color: colors.white, fontSize: '1.25rem' }}>动态改写</h4>
                      <p style={{ color: colors.onSurfaceVariant, fontSize: '0.875rem' }}>瞬间将整个场景的基调从"黑色电影"切换为"赛博朋克"，保持情节逻辑严密。</p>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <Edit3 size={24} style={{ color: colors.secondary, marginTop: '0.25rem' }} />
                    <div>
                      <h4 style={{ fontWeight: 700, color: colors.white, fontSize: '1.25rem' }}>无限连贯性</h4>
                      <p style={{ color: colors.onSurfaceVariant, fontSize: '0.875rem' }}>在数千页的长篇创作中，AI能精准保留角色背景、物品状态及世界观设定。</p>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <BarChart3 size={24} style={{ color: colors.secondary, marginTop: '0.25rem' }} />
                    <div>
                      <h4 style={{ fontWeight: 700, color: colors.white, fontSize: '1.25rem' }}>智能解析</h4>
                      <p style={{ color: colors.onSurfaceVariant, fontSize: '0.875rem' }}>自动识别剧本中的场景、角色、道具，一键生成拍摄计划资产清单。</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div style={{
                ...glassPanelStyle,
                padding: '0.5rem',
                borderRadius: '0.75rem',
                border: `${colors.white10}`,
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
              }}>
                <div style={{
                  background: colors.bgDark,
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', borderBottom: `${colors.white5}`, paddingBottom: '0.5rem' }}>
                    <span style={{ color: colors.secondary }}>editor.js</span>
                    <span style={{ color: '#4b5563' }}>ai_prompter.py</span>
                  </div>
                  <p style={{ color: '#9ca3af' }}><span style={{ color: '#6b7280' }}>01</span> <span style={{ color: colors.tertiary }}>日。霓虹区 - 街道</span></p>
                  <p style={{ color: '#9ca3af' }}><span style={{ color: '#6b7280' }}>02</span> 雨水打湿了路面。<span style={{ color: colors.primary }}>凯伦</span>像影子一样移动。</p>
                  <p style={{ color: '#9ca3af' }}><span style={{ color: '#6b7280' }}>03</span> <span style={{ color: '#6b7280' }}>// AI 建议：增加全息锦鲤池的倒影效果</span></p>
                  <p style={{ color: colors.white, background: `${colors.primary}10`, borderLeft: `2px solid ${colors.primary}`, paddingLeft: '0.5rem', margin: '0.5rem 0', padding: '0.25rem 0.5rem' }}><span style={{ color: '#6b7280' }}>04</span> 巨大的全息锦鲤在空中游过，在凯伦的面罩上投下蓝光。</p>
                  <p style={{ color: '#9ca3af' }}><span style={{ color: '#6b7280' }}>05</span> 凯伦："我们的时间不多了。"</p>
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: `${colors.secondary}20`,
                      color: colors.secondary,
                      border: `1px solid ${colors.secondary}30`,
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                    }}>
                      续写
                    </button>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: `${colors.tertiary}20`,
                      color: colors.tertiary,
                      border: `1px solid ${colors.tertiary}30`,
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                    }}>
                      改写
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '8rem 1.5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{
                fontSize: 'clamp(2.25rem, 5vw, 3rem)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                color: colors.white,
                marginBottom: '1.5rem',
              }}>
                角色与场景管理
              </h2>
              <p style={{ color: colors.onSurfaceVariant, fontSize: '1.125rem', maxWidth: '42rem', margin: '0 auto' }}>
                独特的<span style={{ ...textGradientStyle, fontWeight: 700 }}>基因锁</span>技术，确保您的数字资产在跨场景、跨媒体创作中保持绝对的一致性。
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: '1.5rem',
              minHeight: '800px',
            }}>
              <div
                style={{
                  ...glassPanelStyle,
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  position: 'relative',
                  gridColumn: 'span 2',
                  gridRow: 'span 2',
                }}
                onMouseEnter={() => setHoveredCard('character1')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr3KmOKV5lINbiFGiD2ug7mcyUyXiDHgmNfhRMfXsYvPkA8vpl9saVodHKDECg2s2wTxtzi9bOZoF5CZxke5m2mMH8M5fFtX4wDtc0M26oncGZVMyutcNfh2GCKLp30HgRYw9ZJI4peGpMTz72vsl4FlMh73_k2scXUAIZarS_khR6Jh9Z5xz5LdXnZJJMJOklYGWRtPgjKKQ3_VhJEFGalraLAqYfRjkkuFTOTUk3hpGfAOdMGyYmIUmTXqDBXatx66xztQf3qpo"
                  alt="Hyper-realistic digital character"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.7s',
                    transform: hoveredCard === 'character1' ? 'scale(1.1)' : 'scale(1)',
                    position: 'absolute',
                    inset: 0,
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(to top, ${colors.bgDark} 0%, transparent 50%)`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '2rem',
                }}>
                  <span style={{ color: colors.primary, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>角色种子 #9921</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.white }}>指挥官 艾莉亚</h3>
                  <p style={{ color: colors.onSurfaceVariant, fontSize: '0.875rem', marginTop: '0.5rem' }}>已锁定：解剖比例、生物识别特征、特有服装集</p>
                </div>
              </div>

              <div
                style={{
                  ...glassPanelStyle,
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredCard('character2')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKE2BK9OLDlFTVSnAgmkEbqyYo3Wa-SI6kpKH8acLTR95HCZngwFJW2Q_WoLsVl4mx-urhVNOTPQ1OyH1Y7BS2t73UJAh_bRO9RkZmg8PuI9mNYmZjFnXjpbtIC9ncKzImaaRYtFVtU-4_f0JS61I1H2ubyrZK8Wh6aPwOmhDTtd6sRLhL_yv_ZeIm_sboe9D2LapnoNKUzGGs4IduIbhx7o-DN6PocbSVrQY_pGkKM2_FIifSiIS7GUlnO4OTMtt7YlehYZSUu2Q"
                  alt="Futuristic robotic eye"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.6,
                    transition: 'transform 0.7s',
                    transform: hoveredCard === 'character2' ? 'scale(1.1)' : 'scale(1)',
                    position: 'absolute',
                    inset: 0,
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{ ...glassPanelStyle, padding: '0.5rem', borderRadius: '50%' }}>
                    <Scan size={24} style={{ color: colors.white }} />
                  </div>
                </div>
              </div>

              <div style={{
                ...glassPanelStyle,
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderLeft: `4px solid ${colors.tertiary}`,
              }}>
                <Lock size={40} style={{ color: colors.tertiary, marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.white, marginBottom: '0.5rem' }}>基因锁定</h4>
                <p style={{ color: colors.onSurfaceVariant, fontSize: '0.875rem' }}>在整个分镜脚本中精确锁定面部特征和肢体比例，告别"AI变脸"烦恼。</p>
              </div>

              <div
                style={{
                  ...glassPanelStyle,
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  position: 'relative',
                  gridColumn: 'span 2',
                }}
                onMouseEnter={() => setHoveredCard('character3')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP7-wW1OHqe7hCryS9onm1XBVmGgZMCvX1bwppQ2iBj4TLTeSiDQVokUob94uLbHba1ACtyjUUTXBuy34rKup0RT-C0jH2vIqidiKOu28t2xmFzQswzYdfCL-c1_laIQJDLU8YBLGeYG7eYQnJrehLxKBr0uDM3rAlXXfuFOHj7tQ9IpvuDjuOcLppLdfV3jZUdbQMZrIj93WIHihlMQ8otdfB1EUzMoFkz0xkth-wg_DUejFmYEde8f2VgaH6mxQAAXgzhv2an88"
                  alt="Abstract data visualization"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.5,
                    transition: 'transform 0.7s',
                    transform: hoveredCard === 'character3' ? 'scale(1.1)' : 'scale(1)',
                    position: 'absolute',
                    inset: 0,
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: colors.white }}>2.5M+</span>
                    <p style={{ fontSize: '0.75rem', color: colors.onSurface, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.5rem' }}>资产参数库</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '8rem 1.5rem', backgroundColor: colors.surfaceContainerLow }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4rem' }}>
              <div>
                <h2 style={{
                  fontSize: 'clamp(2.25rem, 5vw, 3rem)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  color: colors.white,
                  marginBottom: '1.5rem',
                }}>
                  多媒体合成
                </h2>
                <p style={{ color: colors.onSurfaceVariant, fontSize: '1.125rem' }}>
                  直接从您的剧本生成高保真帧和流体级电影视频。支持 8K 图像生成与物理感知视频合成。
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={{
                  ...glassPanelStyle,
                  padding: '1rem',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = colors.bgDark; }}
                onMouseLeave={e => { e.currentTarget.style.background = colors.glassBg; e.currentTarget.style.color = colors.white; }}
                >
                  <Image size={24} />
                </button>
                <button style={{
                  ...glassPanelStyle,
                  padding: '1rem',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = colors.bgDark; }}
                onMouseLeave={e => { e.currentTarget.style.background = colors.glassBg; e.currentTarget.style.color = colors.white; }}
                >
                  <Film size={24} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem' }}>
              <div
                style={{
                  ...glassPanelStyle,
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredCard('imageGen')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdXqKk_cy6YRHr-TUOQwwvayX-hrAuZVB2WahTYzajax0mtGDLY2qYzmkv1EflYMxi9fPEbzBqi-J9sGH5_AtX0VBPP5zvniVfBBxJryI6SCJ8Mb4Lb80Nb1cEbdDQF3wxdtBPB4BlZXXZNjP3RGArDy7veDGTecrrWMaveZJ06FwrmVzifIw_bftZ8YI0sY-sybqfsUqdOIo8HKVnoPBGhybEOxkcvfgf2cCrxnUPKlmw_BifQGafsKI647uxcMY5ZGYMh9jMKPI"
                  alt="Crystalline structures landscape"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    aspectRatio: '1/1',
                    filter: hoveredCard === 'imageGen' ? 'grayscale(0%)' : 'grayscale(100%)',
                    transition: 'filter 1s',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '1.5rem',
                  left: '1.5rem',
                  ...glassPanelStyle,
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Palette size={16} style={{ color: colors.secondary }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.white }}>8K 图像生成</span>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  opacity: hoveredCard === 'imageGen' ? 1 : 0,
                  transform: hoveredCard === 'imageGen' ? 'translateY(0)' : 'translateY(1rem)',
                  transition: 'all 0.3s',
                }}>
                  <div style={{ ...glassPanelStyle, padding: '1.5rem', borderRadius: '0.75rem', backdropFilter: 'blur(48px)' }}>
                    <p style={{ fontSize: '0.875rem', color: '#cbd5e1', fontStyle: 'italic' }}>"电影感镜头：漂浮在紫色星云中的水晶宫殿..."</p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...glassPanelStyle,
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredCard('videoGen')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDujkwBv5eYzwE2SitkVQAqTmfqQqulAYPDXhtgZm-bmfuwBMetWVPU5GIIoDI_VB2iGQ2sQCE5rdcIfLIMe2X3dmkUMUFe7y7VlJQePRB_p1yb60ebYKZGlT8gCxyXsaSYN1T6ev9-5Jjf-hBvxhiI0beLLAFVezMWOnqOzxEqsNfqoGGYENlPw2StdZdbRwKAnaTueHdlQYUTnjiHVFc7xZWTeRxSuSmTCHTfhGJKVZxica4-EkYbntEmnJE3raytYEeTwzhfnZw"
                  alt="Futuristic spacecraft"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    aspectRatio: '1/1',
                    filter: hoveredCard === 'videoGen' ? 'grayscale(0%)' : 'grayscale(100%)',
                    transition: 'filter 1s',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '1.5rem',
                  left: '1.5rem',
                  ...glassPanelStyle,
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Activity size={16} style={{ color: colors.tertiary }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.white }}>物理感知视频</span>
                </div>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: hoveredCard === 'videoGen' ? 1 : 0,
                  transition: 'opacity 0.3s',
                }}>
                  <div style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(24px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <Play size={40} style={{ color: colors.white }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '8rem 1.5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', ...glassPanelStyle, borderRadius: '1rem', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '50%',
              height: '100%',
              background: `${colors.primary}05`,
              filter: 'blur(120px)',
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 10 }}>
              <div>
                <h2 style={{
                  fontSize: '2.25rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  color: colors.white,
                  marginBottom: '1.5rem',
                }}>
                  团队协作与生产管理
                </h2>
                <p style={{ color: colors.onSurfaceVariant, fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                  将整个制作团队聚集在一起。共享工作空间、AI 种子的版本控制，以及实时的多人剧本编辑，彻底重塑制片流程。
                </p>
                <div style={{ display: 'flex', marginBottom: '2.5rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    border: `4px solid ${colors.bgDark}`,
                    background: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: colors.white,
                  }}>JS</div>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    border: `4px solid ${colors.bgDark}`,
                    background: `${colors.primary}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: colors.white,
                    marginLeft: '-1rem',
                  }}>AK</div>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    border: `4px solid ${colors.bgDark}`,
                    background: `${colors.tertiary}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: colors.white,
                    marginLeft: '-1rem',
                  }}>RV</div>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    border: `4px solid ${colors.bgDark}`,
                    background: colors.glassBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: colors.white,
                    marginLeft: '-1rem',
                  }}>+8</div>
                </div>
                <button style={{
                  color: colors.primary,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}>
                  探索团队功能
                  <ArrowRight size={20} />
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{
                  ...glassPanelStyle,
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: `${colors.white10}`,
                  transform: 'rotate(3deg) translateX(1rem) translateY(1rem)',
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#ff6e84' }} />
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: colors.secondary }} />
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: colors.tertiary }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ height: '1rem', width: '75%', background: colors.white5, borderRadius: '0.25rem' }} />
                    <div style={{ height: '1rem', width: '50%', background: colors.white5, borderRadius: '0.25rem' }} />
                    <div style={{ height: '6rem', width: '100%', background: colors.white5, borderRadius: '0.5rem', border: `1px dashed ${colors.white20}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>资产版本历史记录</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '11rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent, rgba(186, 158, 255, 0.05), transparent)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: '56rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
            <h2 style={{
              fontSize: 'clamp(3rem, 7vw, 5rem)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              color: colors.white,
              marginBottom: '2.5rem',
              letterSpacing: '-0.05em',
            }}>
              立即开启您的<br /><span style={textGradientStyle}>创作之旅</span>
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem' }}>下一代电影级叙事，只需一个提示词即可触达。</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
              <button
                style={{
                  padding: '1.5rem 3rem',
                  background: colors.white,
                  color: colors.bgDark,
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                立即创建
              </button>
              <button
                style={{
                  padding: '1.5rem 3rem',
                  ...glassPanelStyle,
                  color: colors.white,
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = colors.white10; }}
                onMouseLeave={e => { e.currentTarget.style.background = colors.glassBg; }}
              >
                咨询专家
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ width: '100%', padding: '3rem 0', borderTop: `1px solid ${colors.white5}`, background: colors.bgDark }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', padding: '0 3rem', maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)' }}>
            © 2026 开演AI. 编织电影级智能。
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <a href="#" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = colors.secondary)}
               onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
              服务条款
            </a>
            <a href="#" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = colors.secondary)}
               onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
              隐私政策
            </a>
            <a href="#" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = colors.secondary)}
               onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
              Discord
            </a>
            <a href="#" style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => (e.currentTarget.style.color = colors.secondary)}
               onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}