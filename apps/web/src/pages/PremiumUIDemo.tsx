import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { Tabs, TabPanel } from '../components/ui/Tabs';
import { Badge, BadgeCount, BadgeDot } from '../components/ui/Badge';
import { Search, Plus, Settings, User, Bell, Star, Heart, Zap, Sparkles, Flame } from 'lucide-react';

export default function PremiumUIDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [inputValue, setInputValue] = useState('');

  const tabs = [
    { key: 'overview', label: '概览', icon: <Star size={16} /> },
    { key: 'features', label: '功能', icon: <Zap size={16} />, badge: 3 },
    { key: 'analytics', label: '分析', icon: <Sparkles size={16} /> },
    { key: 'settings', label: '设置', icon: <Settings size={16} /> },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      padding: '40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Premium UI Components
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            高级、流畅、有交互感的UI组件库，采用玻璃态设计、流畅圆角和精美渐变
          </p>
        </div>

        <Tabs
          items={tabs}
          activeKey={activeTab}
          onChange={setActiveTab}
          variant="pills"
          size="large"
          style={{ marginBottom: '48px', justifyContent: 'center' }}
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px',
          marginBottom: '48px',
        }}>
          <Card style={{ padding: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              }}>
                <Flame size={24} color="white" />
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 4px 0',
                }}>
                  玻璃态设计
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0,
                }}>
                  Glassmorphism
                </p>
              </div>
            </div>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              采用高级玻璃态效果，提供半透明背景、模糊滤镜和精美边框，创造层次感和深度感。
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <Badge variant="gradient">Premium</Badge>
              <Badge variant="success">Modern</Badge>
              <Badge variant="info">Glass</Badge>
            </div>
          </Card>

          <Card style={{ padding: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(240, 147, 251, 0.4)',
              }}>
                <Sparkles size={24} color="white" />
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 4px 0',
                }}>
                  流畅交互
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0,
                }}>
                  Smooth Interactions
                </p>
              </div>
            </div>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              每个交互都经过精心设计，提供流畅的动画、悬停效果和点击反馈，提升用户体验。
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <Badge variant="primary">Interactive</Badge>
              <Badge variant="warning">Animated</Badge>
              <BadgeDot color="#667eea" pulse />
            </div>
          </Card>

          <Card style={{ padding: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(79, 172, 254, 0.4)',
              }}>
                <Zap size={24} color="white" />
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 4px 0',
                }}>
                  高级渐变
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0,
                }}>
                  Premium Gradients
                </p>
              </div>
            </div>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              使用精心挑选的渐变配色方案，创造视觉层次和品牌识别度，让界面更加生动。
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <Badge variant="success">Gradient</Badge>
              <Badge variant="error">Vibrant</Badge>
              <BadgeCount count={5} variant="gradient" pulse />
            </div>
          </Card>
        </div>

        <Card style={{ padding: '40px', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}>
            按钮组件
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
          }}>
            <Button variant="default">默认按钮</Button>
            <Button variant="destructive">危险按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="glass">玻璃按钮</Button>
            <Button variant="glow">发光按钮</Button>
            <Button variant="default" shimmer>闪光按钮</Button>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
          }}>
            <Button size="sm">小按钮</Button>
            <Button size="default">默认大小</Button>
            <Button size="lg">大按钮</Button>
            <Button icon={<Plus size={16} />} size="icon" />
            <Button icon={<Search size={16} />} variant="outline" />
            <Button icon={<Heart size={16} />} variant="ghost" />
            <Button loading>加载中...</Button>
          </div>
        </Card>

        <Card style={{ padding: '40px', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}>
            输入框组件
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}>
            <Input
              placeholder="默认输入框"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              placeholder="带图标的输入框"
              leftIcon={<Search size={18} />}
              rightIcon={<Bell size={18} />}
            />
            <Input
              placeholder="错误状态"
              error
            />
            <Input
              placeholder="浮动标签"
              floating
            />
          </div>
        </Card>

        <Card style={{ padding: '40px', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}>
            徽章组件
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '32px',
          }}>
            <Badge>默认徽章</Badge>
            <Badge variant="primary">主要徽章</Badge>
            <Badge variant="success">成功徽章</Badge>
            <Badge variant="warning">警告徽章</Badge>
            <Badge variant="error">错误徽章</Badge>
            <Badge variant="info">信息徽章</Badge>
            <Badge variant="gradient">渐变徽章</Badge>
            <Badge dot>带点徽章</Badge>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
          }}>
            <Badge size="sm">小徽章</Badge>
            <Badge size="medium">中徽章</Badge>
            <Badge size="large">大徽章</Badge>
            <BadgeCount count={5} />
            <BadgeCount count={99} variant="success" />
            <BadgeCount count={100} variant="warning" />
            <BadgeCount count={999} variant="error" />
            <BadgeDot color="#667eea" />
            <BadgeDot color="#10b981" pulse />
            <BadgeDot color="#f59e0b" size="large" />
          </div>
        </Card>

        <Card style={{ padding: '40px', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}>
            标签页组件
          </h2>
          <div style={{ marginBottom: '32px' }}>
            <Tabs
              items={tabs}
              activeKey={activeTab}
              onChange={setActiveTab}
              variant="pills"
            />
          </div>
          <div style={{ marginBottom: '32px' }}>
            <Tabs
              items={tabs}
              activeKey={activeTab}
              onChange={setActiveTab}
              variant="segmented"
            />
          </div>
          <div>
            <Tabs
              items={tabs}
              activeKey={activeTab}
              onChange={setActiveTab}
              variant="underline"
            />
          </div>
        </Card>

        <Card style={{ padding: '40px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}>
            模态框组件
          </h2>
          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            style={{ marginBottom: '24px' }}
          >
            打开模态框
          </Button>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.6',
          }}>
            点击上方按钮打开高级模态框，体验流畅的动画和玻璃态效果。
          </p>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="高级模态框"
          size="large"
        >
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px',
            }}>
              欢迎使用 Premium UI
            </h3>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              这是一个采用高级玻璃态设计的模态框组件，具有流畅的动画、精美的渐变和出色的交互体验。
            </p>
            <Input
              placeholder="输入您的邮箱..."
              leftIcon={<User size={18} />}
              style={{ marginBottom: '16px' }}
            />
            <Input
              placeholder="输入您的密码..."
              type="password"
              style={{ marginBottom: '24px' }}
            />
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={() => setIsModalOpen(false)}
            >
              确认
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
