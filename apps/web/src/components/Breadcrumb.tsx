import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const routeLabels: Record<string, string> = {
  '/': '首页',
  '/projects': '我的项目',
  '/projects/new': '创建项目',
  '/team': '团队管理',
  '/documents': '文档管理',
  '/documents/create': '创建文档',
  '/settings': '设置',
  '/settings/ai': 'AI 服务提供商',
  '/settings/models': '模型配置',
};

const Breadcrumb: React.FC<{ items?: BreadcrumbItem[] }> = ({ items }) => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const breadcrumbs: BreadcrumbItem[] = [{ label: '首页', path: '/' }];

    let currentPath = '';
    for (const part of pathParts) {
      currentPath += `/${part}`;
      const label = routeLabels[currentPath] || getDynamicLabel(part);
      breadcrumbs.push({
        label,
        path: currentPath,
      });
    }

    return breadcrumbs;
  };

  const getDynamicLabel = (part: string): string => {
    if (part.match(/^[a-f0-9-]{36}$/i) || part.match(/^[a-f0-9]{24}$/i)) {
      return '详情';
    }
    const decoded = decodeURIComponent(part);
    return decoded.charAt(0).toUpperCase() + decoded.slice(1);
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav aria-label="面包屑导航" style={{ marginBottom: '24px' }}>
      <ol style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        listStyle: 'none',
        padding: 0,
        margin: 0,
        flexWrap: 'wrap',
      }}>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isFirst && (
                <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              )}
              {isLast ? (
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  {isFirst && <Home style={{ width: '14px', height: '14px' }} />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path || '#'}
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-tertiary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                >
                  {isFirst && <Home style={{ width: '14px', height: '14px' }} />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
