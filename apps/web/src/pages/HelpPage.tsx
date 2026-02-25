import {
  HelpCircle,
  Mail,
  Github,
  ExternalLink,
  ChevronRight,
  FileText,
  Image,
  Users,
  FolderOpen,
  Settings,
  Video
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

interface HelpCategory {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: HelpItem[];
}

interface HelpItem {
  question: string;
  answer: string;
}

const helpCategories: HelpCategory[] = [
  {
    icon: <FolderOpen style={{ width: 24, height: 24 }} />,
    title: '项目管理',
    description: '创建和管理您的创作项目',
    items: [
      {
        question: '如何创建新项目？',
        answer: '在"我的项目"页面，点击右上角的"新建项目"按钮。选择项目类型（剧本、小说或混合），填写项目名称和描述即可创建。'
      },
      {
        question: '项目成员如何协作？',
        answer: '进入项目详情页，点击"管理成员"可以邀请其他用户加入项目，并设置不同的权限角色（管理员、编辑者、查看者）。'
      },
      {
        question: '如何删除项目？',
        answer: '在项目详情页点击"设置"按钮，然后点击"删除"按钮确认删除。项目删除后无法恢复，请谨慎操作。'
      }
    ]
  },
  {
    icon: <FileText style={{ width: 24, height: 24 }} />,
    title: '剧本创作',
    description: '编写和管理剧本内容',
    items: [
      {
        question: '如何输入剧本？',
        answer: '进入项目后，点击"输入剧本"可以上传剧本文件或直接编写剧本内容。系统支持自动解析剧本格式。'
      },
      {
        question: '如何使用 AI 辅助创作？',
        answer: '在剧本编辑页面，可以使用 AI 功能来续写、改写或优化剧本内容。点击相应的 AI 按钮即可使用。'
      },
      {
        question: '如何生成分镜？',
        answer: '完成剧本输入后，系统可以自动分析剧本内容并生成分镜脚本。每个分镜包含镜头描述、画面提示词等信息。'
      }
    ]
  },
  {
    icon: <Image style={{ width: 24, height: 24 }} />,
    title: 'AI 图像生成',
    description: '使用 AI 生成项目图片素材',
    items: [
      {
        question: '如何生成角色图片？',
        answer: '进入项目的"管理角色"页面，点击角色头像可以生成 AI 图像。系统会根据角色描述自动生成图片。'
      },
      {
        question: '如何生成场景图片？',
        answer: '在"管理场景"页面，可以为每个场景生成 AI 图像。系统会根据场景描述和氛围设置生成相应的图片。'
      },
      {
        question: '支持哪些 AI 模型？',
        answer: '系统支持多种 AI 图像生成模型，可以在设置页面配置您的 AI 提供商和首选模型。'
      }
    ]
  },
  {
    icon: <Video style={{ width: 24, height: 24 }} />,
    title: 'AI 视频生成',
    description: '使用 AI 生成视频内容',
    items: [
      {
        question: '如何生成视频？',
        answer: '在项目中使用分镜功能，选择对应的分镜后可以生成视频。系统会将分镜图片转换为动态视频。'
      },
      {
        question: '视频生成需要多长时间？',
        answer: '视频生成时间取决于分镜数量、分辨率设置和 AI 模型的处理速度。一般需要几分钟到十几分钟不等。'
      },
      {
        question: '如何导出视频？',
        answer: '在"AI 视频"页面可以查看和管理生成的视频，支持导出为不同格式的视频文件。'
      }
    ]
  },
  {
    icon: <Users style={{ width: 24, height: 24 }} />,
    title: '团队协作',
    description: '邀请成员和权限管理',
    items: [
      {
        question: '如何邀请团队成员？',
        answer: '在项目详情页进入"管理成员"，点击"添加成员"并搜索其他用户的邮箱即可邀请加入项目。'
      },
      {
        question: '成员权限有哪些？',
        answer: '管理员可以管理项目设置和成员；编辑者可以编辑项目内容；查看者只能浏览项目内容，不能修改。'
      },
      {
        question: '如何转让项目所有权？',
        answer: '当前所有者可以在项目设置中将所有权转让给其他成员。转让后，原所有者将变为管理员。'
      }
    ]
  },
  {
    icon: <Settings style={{ width: 24, height: 24 }} />,
    title: '账户与设置',
    description: '管理您的账户偏好',
    items: [
      {
        question: '如何修改个人信息？',
        answer: '在设置页面点击"个人资料"可以修改您的名称、头像和个人简介。'
      },
      {
        question: '如何配置 AI 提供商？',
        answer: '在设置页面点击"AI 提供商"，可以添加和管理您的 AI API 密钥，如 OpenAI、Claude 等。'
      },
      {
        question: '如何设置默认 AI 模型？',
        answer: '在"模型配置"页面可以为不同任务类型设置默认使用的 AI 模型。'
      }
    ]
  }
];

export default function HelpPage() {
  return (
    <>
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
        padding: '32px 32px 24px',
        borderBottom: '1px solid var(--border-primary)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Breadcrumb items={[
            { label: '首页', path: '/' },
            { label: '帮助中心' },
          ]} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px -4px rgba(139, 92, 246, 0.4)',
            }}>
              <HelpCircle style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                帮助中心
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                了解如何使用开言创作平台
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '24px',
          }}>
            {helpCategories.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid var(--border-primary)',
                  background: 'var(--gradient-primary-light)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'var(--gradient-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                    }}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                        {category.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '8px' }}>
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}>
                        <ChevronRight style={{
                          width: '16px',
                          height: '16px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                          flexShrink: 0,
                        }} />
                        <div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            margin: '0 0 6px 0',
                          }}>
                            {item.question}
                          </h4>
                          <p style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            margin: 0,
                            lineHeight: '1.6',
                          }}>
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '48px',
            padding: '32px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '20px',
            textAlign: 'center',
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
              没有找到答案？
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
              联系我们的支持团队获取帮助
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="mailto:support@example.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
              >
                <Mail style={{ width: '16px', height: '16px' }} />
                发送邮件
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
              >
                <Github style={{ width: '16px', height: '16px' }} />
                GitHub
                <ExternalLink style={{ width: '12px', height: '12px' }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
