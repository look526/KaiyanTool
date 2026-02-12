import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Search, Trash2, Crown, Shield, Eye, Mail, Loader2, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

interface Member {
  userId: string;
  projectId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  };
}

interface SearchUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

const ROLE_LABELS = {
  owner: '所有者',
  editor: '编辑者',
  viewer: '查看者',
};

const ROLE_ICONS = {
  owner: Crown,
  editor: Shield,
  viewer: Eye,
};

export default function ProjectMembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [newMemberRole, setNewMemberRole] = useState<'editor' | 'viewer'>('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const mutedTextColor = theme === 'dark' ? '#a1a1aa' : '#64748b';
  const cardBg = theme === 'dark' ? '#18181b' : '#ffffff';
  const borderColor = theme === 'dark' ? '#27272a' : '#e2e8f0';
  const inputBg = theme === 'dark' ? '#18181b' : '#f8fafc';

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length >= 2) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setSearchResults(data);
        } catch (err) {
          console.error('搜索用户失败:', err);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadMembers = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取成员列表失败');
      }

      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser || !projectId) return;

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: newMemberRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '添加成员失败');
      }

      setShowAddMember(false);
      setSelectedUser(null);
      setSearchQuery('');
      setSearchResults([]);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加成员失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return;

    if (!confirm('确定要移除此成员吗？')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('移除成员失败');
      }

      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : '移除成员失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'editor' | 'viewer') => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/projects/${projectId}/members/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新角色失败');
      }

      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新角色失败');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = members.find(m => m.userId === user?.id)?.role === 'owner';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#09090b' : '#f8fafc',
      padding: '20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            style={{ marginBottom: '20px' }}
          >
            ← 返回
          </Button>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: textColor,
            marginBottom: '8px',
            margin: '0 0 8px 0',
          }}>
            项目成员
          </h1>
          <p style={{ color: mutedTextColor, margin: 0 }}>
            管理项目成员和权限
          </p>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
            borderRadius: '12px',
            color: '#ef4444',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            {error}
          </div>
        )}

        {isOwner && (
          <div style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            {!showAddMember ? (
              <Button
                onClick={() => setShowAddMember(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  justifyContent: 'center',
                  height: '48px',
                }}
              >
                <UserPlus style={{ width: '20px', height: '20px' }} />
                添加成员
              </Button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: mutedTextColor,
                    pointerEvents: 'none',
                  }}>
                    <Search style={{ width: '18px', height: '18px' }} />
                  </div>
                  <input
                    type="text"
                    placeholder="搜索用户（邮箱或用户名）"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 46px',
                      fontSize: '15px',
                      backgroundColor: inputBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '12px',
                      color: textColor,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    autoFocus
                  />
                </div>

                {searchResults.length > 0 && !selectedUser && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10,
                  }}>
                    {searchResults.map((searchUser) => (
                      <div
                        key={searchUser.id}
                        onClick={() => {
                          setSelectedUser(searchUser);
                          setSearchQuery(searchUser.email);
                          setSearchResults([]);
                        }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          borderBottom: `1px solid ${borderColor}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#27272a' : '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {searchUser.avatarUrl ? (
                          <img
                            src={searchUser.avatarUrl}
                            alt={searchUser.name || searchUser.email}
                            style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                          />
                        ) : (
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                          }}>
                            {(searchUser.name || searchUser.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ color: textColor, fontWeight: '500', fontSize: '14px' }}>
                            {searchUser.name || searchUser.email}
                          </div>
                          <div style={{ color: mutedTextColor, fontSize: '12px' }}>
                            {searchUser.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedUser && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: inputBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    {selectedUser.avatarUrl ? (
                      <img
                        src={selectedUser.avatarUrl}
                        alt={selectedUser.name || selectedUser.email}
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                      />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                      }}>
                        {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: textColor, fontWeight: '500' }}>
                        {selectedUser.name || selectedUser.email}
                      </div>
                      <div style={{ color: mutedTextColor, fontSize: '13px' }}>
                        {selectedUser.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchQuery('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: mutedTextColor,
                        cursor: 'pointer',
                        padding: '8px',
                        fontSize: '20px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: textColor,
                    marginBottom: '8px',
                  }}>
                    角色
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as 'editor' | 'viewer')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      backgroundColor: inputBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '12px',
                      color: textColor,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="viewer">查看者</option>
                    <option value="editor">编辑者</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddMember(false);
                      setSelectedUser(null);
                      setSearchQuery('');
                    }}
                    style={{ flex: 1, height: '44px' }}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={!selectedUser || loading}
                    style={{ flex: 1, height: '44px' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 style={{ width: '18px', height: '18px', marginRight: '8px' }} className="animate-spin" />
                        添加中...
                      </>
                    ) : (
                      '添加'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {loading && members.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              color: mutedTextColor,
            }}>
              <Loader2 style={{ width: '40px', height: '40px', marginRight: '12px' }} className="animate-spin" />
              加载中...
            </div>
          ) : members.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '60px',
              color: mutedTextColor,
            }}>
              <User style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.5 }} />
              <p>暂无成员</p>
            </div>
          ) : (
            <div>
              {members.map((member) => {
                const RoleIcon = ROLE_ICONS[member.role];
                const isCurrentUser = member.userId === user?.id;

                return (
                  <div
                    key={`${member.projectId}-${member.userId}`}
                    style={{
                      padding: '20px 24px',
                      borderBottom: `1px solid ${borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    {member.user.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.name || member.user.email}
                        style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                      />
                    ) : (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '18px',
                      }}>
                        {(member.user.name || member.user.email)[0].toUpperCase()}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          color: textColor,
                          fontWeight: '600',
                          fontSize: '16px',
                        }}>
                          {member.user.name || member.user.email}
                        </span>
                        {isCurrentUser && (
                          <span style={{
                            backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}>
                            我
                          </span>
                        )}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: mutedTextColor,
                        fontSize: '14px',
                      }}>
                        <Mail style={{ width: '14px', height: '14px' }} />
                        {member.user.email}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 16px',
                      backgroundColor: inputBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '8px',
                    }}>
                      <RoleIcon style={{ width: '16px', height: '16px', color: '#6366f1' }} />
                      <span style={{
                        color: textColor,
                        fontWeight: '500',
                        fontSize: '14px',
                      }}>
                        {ROLE_LABELS[member.role]}
                      </span>
                    </div>

                    {isOwner && !isCurrentUser && (
                      <div style={{ position: 'relative' }}>
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.userId, e.target.value as 'editor' | 'viewer')}
                          style={{
                            padding: '8px 32px 8px 12px',
                            fontSize: '14px',
                            backgroundColor: inputBg,
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            color: textColor,
                            outline: 'none',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23${theme === 'dark' ? 'a1a1aa' : '64748b'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 8px center',
                            backgroundSize: '16px',
                          }}
                        >
                          <option value="viewer">查看者</option>
                          <option value="editor">编辑者</option>
                        </select>
                      </div>
                    )}

                    {(isOwner && !isCurrentUser) || isCurrentUser ? (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={loading}
                        style={{
                          padding: '8px',
                          background: 'none',
                          border: 'none',
                          color: theme === 'dark' ? '#ef4444' : '#dc2626',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: loading ? 0.5 : 1,
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 style={{ width: '18px', height: '18px' }} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
