import React, { useEffect, useState } from 'react';
import { api } from '../../core/api/client';
import { Download, FileJson, FileSpreadsheet, Filter, Search, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
}

interface LogStats {
  byAction: Array<{ action: string; count: number }>;
  byResource: Array<{ resource: string; count: number }>;
  successRate: { total: number; successful: number; rate: number };
  recentErrors: AuditLog[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [successFilter, setSuccessFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [jsonBtnHover, setJsonBtnHover] = useState(false);
  const [csvBtnHover, setCsvBtnHover] = useState(false);
  const [prevBtnHover, setPrevBtnHover] = useState(false);
  const [nextBtnHover, setNextBtnHover] = useState(false);

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '50');
      if (actionFilter) params.append('action', actionFilter);
      if (resourceFilter) params.append('resource', resourceFilter);
      if (successFilter) params.append('success', successFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get<{ logs: AuditLog[]; pagination: Pagination }>(
        `/admin/logs?${params.toString()}`
      );
      setLogs(response.logs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get<LogStats>(`/admin/logs/stats?${params.toString()}`);
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch log stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [actionFilter, resourceFilter, successFilter, startDate, endDate]);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (format === 'csv') {
        window.open(`/admin/logs/export?${params.toString()}`, '_blank');
      } else {
        const response = await api.get<{ logs: AuditLog[] }>(`/admin/logs/export?${params.toString()}`);
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const getActionStyle = (action: string) => {
    if (action.includes('login')) {
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
    }
    if (action.includes('created')) {
      return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    }
    if (action.includes('updated')) {
      return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    }
    if (action.includes('deleted')) {
      return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    }
    return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const statCards = stats ? [
    {
      name: '总操作数',
      value: stats.successRate.total,
      icon: <Filter size={24} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    },
    {
      name: '成功率',
      value: `${stats.successRate.rate}%`,
      icon: <CheckCircle size={24} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      name: '最近错误',
      value: stats.recentErrors.length,
      icon: <XCircle size={24} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    {
      name: '操作类型',
      value: stats.byAction.length,
      icon: <Search size={24} />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: '0 0 4px 0',
          }}>系统日志</h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: 0,
          }}>查看和管理系统操作审计日志</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleExport('json')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: jsonBtnHover ? 'var(--bg-hover)' : 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              transform: jsonBtnHover ? 'translateY(-1px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setJsonBtnHover(true)}
            onMouseLeave={() => setJsonBtnHover(false)}
          >
            <FileJson size={18} />
            导出 JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: csvBtnHover 
                ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: csvBtnHover 
                ? '0 8px 24px rgba(99, 102, 241, 0.4)' 
                : '0 4px 14px rgba(99, 102, 241, 0.3)',
              transform: csvBtnHover ? 'translateY(-1px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setCsvBtnHover(true)}
            onMouseLeave={() => setCsvBtnHover(false)}
          >
            <FileSpreadsheet size={18} />
            导出 CSV
          </button>
        </div>
      </div>

      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {statCards.map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-primary)',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: stat.gradient,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                  }}>{stat.name}</p>
                  <p style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: '1',
                  }}>{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <Filter size={20} style={{ color: 'var(--text-secondary)' }} />
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>筛选条件</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>操作类型</span>
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="输入操作类型..."
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>资源类型</span>
            <input
              type="text"
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              placeholder="输入资源类型..."
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>状态</span>
            <select
              value={successFilter}
              onChange={(e) => setSuccessFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="">全部状态</option>
              <option value="true">成功</option>
              <option value="false">失败</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>开始日期</span>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <Calendar size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>结束日期</span>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <Calendar size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-primary)',
              }}>
                <th style={{
                  padding: '14px 18px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>时间</th>
                <th style={{
                  padding: '14px 18px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>用户</th>
                <th style={{
                  padding: '14px 18px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>操作</th>
                <th style={{
                  padding: '14px 18px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>资源</th>
                <th style={{
                  padding: '14px 18px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>IP地址</th>
                <th style={{
                  padding: '14px 18px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>状态</th>
                <th style={{
                  padding: '14px 18px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>详情</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{
                    padding: '48px 18px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid var(--border-primary)',
                        borderTopColor: '#6366f1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      <style>{`
                        @keyframes spin {
                          from { transform: rotate(0deg); }
                          to { transform: rotate(360deg); }
                        }
                      `}</style>
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    padding: '48px 18px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Search size={32} style={{ color: 'var(--text-tertiary)' }} />
                      <span>暂无日志数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      background: hoveredRow === log.id ? 'var(--bg-hover)' : 'transparent',
                      borderBottom: '1px solid var(--border-secondary)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={() => setHoveredRow(log.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={{
                      padding: '14px 18px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                    }}>
                      {formatDate(log.createdAt)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          margin: '0 0 2px 0',
                        }}>{log.user?.name || '系统'}</p>
                        <p style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          margin: 0,
                        }}>{log.user?.email || '-'}</p>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        ...getActionStyle(log.action),
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div>
                        <p style={{
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                          margin: '0 0 2px 0',
                        }}>{log.resource}</p>
                        {log.resourceId && (
                          <p style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            margin: 0,
                            fontFamily: 'monospace',
                          }}>{log.resourceId.slice(0, 8)}...</p>
                        )}
                      </div>
                    </td>
                    <td style={{
                      padding: '14px 18px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      fontFamily: 'monospace',
                    }}>
                      {log.ipAddress || '-'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {log.success ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#10b981',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}>
                          <CheckCircle size={16} />
                          成功
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#ef4444',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}>
                          <XCircle size={16} />
                          失败
                        </span>
                      )}
                    </td>
                    <td style={{
                      padding: '14px 18px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                    }}>
                      {log.errorMessage && (
                        <span style={{ color: '#ef4444' }}>{log.errorMessage}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
          }}>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: 0,
            }}>
              共 <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{pagination.total}</span> 条日志
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => fetchLogs(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  background: pagination.page === 1 
                    ? 'var(--bg-surface)' 
                    : (prevBtnHover ? 'var(--bg-hover)' : 'var(--bg-surface)'),
                  color: pagination.page === 1 
                    ? 'var(--text-tertiary)' 
                    : 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  opacity: pagination.page === 1 ? '0.5' : '1',
                  transform: !pagination.page && prevBtnHover ? 'translateY(-1px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setPrevBtnHover(true)}
                onMouseLeave={() => setPrevBtnHover(false)}
              >
                <ChevronLeft size={16} />
                上一页
              </button>
              <span style={{
                padding: '8px 14px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
              }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchLogs(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  background: pagination.page === pagination.totalPages 
                    ? 'var(--bg-surface)' 
                    : (nextBtnHover ? 'var(--bg-hover)' : 'var(--bg-surface)'),
                  color: pagination.page === pagination.totalPages 
                    ? 'var(--text-tertiary)' 
                    : 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  opacity: pagination.page === pagination.totalPages ? '0.5' : '1',
                  transform: !pagination.page && nextBtnHover ? 'translateY(-1px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setNextBtnHover(true)}
                onMouseLeave={() => setNextBtnHover(false)}
              >
                下一页
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
