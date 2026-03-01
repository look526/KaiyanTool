import React, { useEffect, useState } from 'react';
import { api } from '../../core/api/client';
import { 
  UserPlus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, 
  Mail, Shield, Crown
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  projectCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '20');
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const response = await api.get<{ users: User[]; pagination: Pagination }>(
        `/api/admin/users?${params.toString()}`
      );
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/api/admin/users', newUser);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', name: '', role: 'user' });
      fetchUsers(1);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/api/admin/users/${userId}`, { role });
      fetchUsers(pagination.page);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/api/admin/users/${userId}`);
      fetchUsers(pagination.page);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'user':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'var(--border-primary)' };
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' };
      case 'enterprise':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'var(--border-primary)' };
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '管理员';
      case 'super_admin': return '超级管理员';
      default: return '用户';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'pro': return '专业版';
      case 'enterprise': return '企业版';
      default: return '免费版';
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    height: '44px',
    padding: '0 36px 0 14px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: '8px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          用户管理
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 122, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
          }}
        >
          <UserPlus size={18} />
          创建用户
        </button>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索用户名或邮箱..."
                style={{ ...inputStyle, paddingLeft: '44px', height: '44px' }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0 20px',
                height: '44px',
                background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              搜索
            </button>
          </form>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="">所有角色</option>
            <option value="admin">管理员</option>
            <option value="super_admin">超级管理员</option>
            <option value="user">普通用户</option>
          </select>
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
            <thead style={{ background: 'var(--bg-secondary)' }}>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>用户</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>角色</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>计划</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>项目数</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>注册时间</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>最后登录</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>操作</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid var(--border-primary)' }}>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    加载中...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    暂无用户数据
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleStyle = getRoleBadgeColor(user.role);
                  const planStyle = getPlanBadgeColor(user.plan);
                  return (
                    <tr 
                      key={user.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}>
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                              {user.name || '未设置'}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '100px',
                          background: roleStyle.bg,
                          color: roleStyle.color,
                          border: `1px solid ${roleStyle.border}`,
                        }}>
                          {user.role === 'admin' || user.role === 'super_admin' ? <Shield size={12} /> : null}
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '100px',
                          background: planStyle.bg,
                          color: planStyle.color,
                          border: `1px solid ${planStyle.border}`,
                        }}>
                          {user.plan === 'enterprise' ? <Crown size={12} /> : null}
                          {getPlanLabel(user.plan)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {user.projectCount}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('zh-CN') : '从未登录'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-primary)',
                              fontSize: '14px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                          >
                            <Edit2 size={14} />
                            编辑
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '14px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              共 {pagination.total} 个用户
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: pagination.page === 1 ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === 1 ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronLeft size={16} />
                上一页
              </button>
              <span style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: pagination.page === pagination.totalPages ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                下一页
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '20px',
            padding: '28px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
              创建新用户
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>邮箱 *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={inputStyle}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label style={labelStyle}>密码 *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  style={inputStyle}
                  placeholder="至少6位"
                />
              </div>
              <div>
                <label style={labelStyle}>用户名</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  style={inputStyle}
                  placeholder="可选"
                />
              </div>
              <div>
                <label style={labelStyle}>角色</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{ ...inputStyle, paddingRight: '36px', cursor: 'pointer' }}
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
              >
                取消
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUser.email || !newUser.password}
                style={{
                  padding: '10px 20px',
                  background: !newUser.email || !newUser.password 
                    ? 'var(--text-tertiary)' 
                    : 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  cursor: !newUser.email || !newUser.password ? 'not-allowed' : 'pointer',
                  opacity: !newUser.email || !newUser.password ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '20px',
            padding: '28px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
              编辑用户
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>邮箱</label>
                <input
                  type="text"
                  value={selectedUser.email}
                  disabled
                  style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <div>
                <label style={labelStyle}>角色</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  style={{ ...inputStyle, paddingRight: '36px', cursor: 'pointer' }}
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
              >
                取消
              </button>
              <button
                onClick={() => handleUpdateRole(selectedUser.id, selectedUser.role)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '20px',
            padding: '28px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              确认删除
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              确定要删除用户 <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.name || selectedUser.email}</strong> 吗？此操作不可撤销。
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
