import { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Key,
  Globe,
  CreditCard,
  Building,
  Save
} from 'lucide-react';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const sections: SettingsSection[] = [
  { id: 'profile', name: '个人资料', icon: User, description: '管理您的账户信息' },
  { id: 'notifications', name: '通知设置', icon: Bell, description: '配置通知偏好' },
  { id: 'security', name: '安全设置', icon: Shield, description: '密码和认证' },
  { id: 'appearance', name: '外观设置', icon: Palette, description: '主题和显示' },
  { id: 'api', name: 'API密钥', icon: Key, description: '管理API访问' },
  { id: 'billing', name: '账单管理', icon: CreditCard, description: '订阅和支付' },
  { id: 'team', name: '团队设置', icon: Building, description: '团队成员管理' },
  { id: 'integrations', name: '集成设置', icon: Globe, description: '第三方服务' }
];

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = () => {
    setIsDirty(false);
  };

  const SectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings onChange={() => setIsDirty(true)} />;
      case 'notifications':
        return <NotificationSettings onChange={() => setIsDirty(true)} />;
      case 'security':
        return <SecuritySettings />;
      case 'appearance':
        return <AppearanceSettings onChange={() => setIsDirty(true)} />;
      case 'api':
        return <ApiSettings />;
      default:
        return <div className="text-center text-gray-500 py-8">即将推出</div>;
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          设置
        </h2>
        <nav className="space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <div>
                <div className="font-medium">{section.name}</div>
                <div className="text-xs text-gray-400">{section.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <SectionContent />

        {isDirty && (
          <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <span className="text-sm">有未保存的更改</span>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSettings({ onChange }: { onChange: () => void }) {
  const [form, setForm] = useState({
    name: '用户名',
    email: 'user@example.com',
    bio: '',
    avatar: ''
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">个人资料</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold">
            {form.name[0]}
          </div>
          <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            更换头像
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">用户名</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => { setForm({ ...form, name: e.target.value }); onChange(); }}
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">邮箱地址</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => { setForm({ ...form, email: e.target.value }); onChange(); }}
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">个人简介</label>
        <textarea
          value={form.bio}
          onChange={(e) => { setForm({ ...form, bio: e.target.value }); onChange(); }}
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[100px]"
          placeholder="介绍一下自己..."
        />
      </div>
    </div>
  );
}

function NotificationSettings({ onChange }: { onChange: () => void }) {
  const [notifications, setNotifications] = useState({
    emailProjectUpdates: true,
    emailGenerations: true,
    emailComments: false,
    pushProjectUpdates: true,
    pushGenerations: true,
    pushComments: true,
    weeklyDigest: true
  });

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">邮件通知</h3>
        <div className="space-y-4">
          {[
            { key: 'emailProjectUpdates', label: '项目更新', desc: '当项目有重要更新时收到邮件' },
            { key: 'emailGenerations', label: '生成完成', desc: '当图像或视频生成完成时收到邮件' },
            { key: 'emailComments', label: '评论通知', desc: '当有人评论您的内容时收到邮件' },
            { key: 'weeklyDigest', label: '每周摘要', desc: '每周收到一次活动摘要' }
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
              <Toggle
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={() => {
                  setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] });
                  onChange();
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">修改密码</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">当前密码</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">新密码</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">确认新密码</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
            />
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            更新密码
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">两步验证</h3>
        <p className="text-gray-500 mb-4">添加额外的安全层来保护您的账户</p>
        <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg">
          启用两步验证
        </button>
      </div>
    </div>
  );
}

function AppearanceSettings({ onChange }: { onChange: () => void }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('zh-CN');

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">主题设置</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: '浅色', desc: '明亮的界面' },
            { value: 'dark', label: '深色', desc: '暗色界面' },
            { value: 'system', label: '跟随系统', desc: '自动匹配系统' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => { setTheme(option.value as any); onChange(); }}
              className={`p-4 border rounded-lg text-center transition-colors ${
                theme === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-gray-500">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">语言</h3>
        <select
          value={language}
          onChange={(e) => { setLanguage(e.target.value); onChange(); }}
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>
    </div>
  );
}

function ApiSettings() {
  const [apiKeys] = useState([
    { id: '1', name: '默认密钥', key: 'sk-...abc123', created: '2024-01-15', lastUsed: '2024-02-10' }
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">API 密钥</h3>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">
            创建新密钥
          </button>
        </div>
        <div className="space-y-3">
          {apiKeys.map(key => (
            <div key={key.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{key.name}</span>
                <button className="text-red-500 hover:text-red-600 text-sm">删除</button>
              </div>
              <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded mb-2">
                {key.key}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>创建于: {key.created}</span>
                <span>最后使用: {key.lastUsed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">使用统计</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold">1,234</div>
            <div className="text-sm text-gray-500">本月请求数</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm text-gray-500">成功率</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold">0.3s</div>
            <div className="text-sm text-gray-500">平均响应</div>
          </div>
        </div>
      </div>
    </div>
  );
}
