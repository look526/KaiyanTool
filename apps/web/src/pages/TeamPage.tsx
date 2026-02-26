import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Mail, Crown, Shield, User, Check, X, Users, Settings, Trash2, MoreVertical, UserPlus, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
type MemberStatus = 'active' | 'invited';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  avatarUrl?: string;
}

const roleConfig: Record<MemberRole, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Crown; gradient: string }> = {
  owner: { label: '所有者', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)', icon: Crown, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  admin: { label: '管理员', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.3)', icon: Shield, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  editor: { label: '编辑者', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', icon: User, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  viewer: { label: '查看者', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.15)', borderColor: 'rgba(100, 116, 139, 0.3)', icon: User, gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' },
};

const statusConfig: Record<MemberStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  active: { label: '活跃', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  invited: { label: '已邀请', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' },
};

const createInitials = (name: string, email: string) => {
  const base = name?.trim() || email?.trim() || 'U';
  const parts = base.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
};

const getAvatarColor = (email: string) => {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) % 360;
  }
  return `hsl(${hash}, 55%, 50%)`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kaiyan.teamMembers');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as TeamMember[];
      if (Array.isArray(parsed)) {
        setMembers(parsed);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setMembers((prev) => {
      if (prev.some((member) => member.email === user.email)) {
        return prev;
      }
      const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
      return [
        {
          id: user.id,
          name: user.name || '团队所有者',
          email: user.email,
          role: 'owner',
          status: 'active',
          joinedAt: createdAt.toISOString(),
          avatarUrl: user.avatarUrl || undefined,
        },
        ...prev,
      ];
    });
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kaiyan.teamMembers', JSON.stringify(members));
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, roleFilter, searchQuery]);

  const stats = useMemo(() => {
    const active = members.filter((member) => member.status === 'active').length;
    const invited = members.filter((member) => member.status === 'invited').length;
    return {
      total: members.length,
      active,
      invited,
    };
  }, [members]);

  const handleInvite = () => {
    const form = (document.getElementById('invite-name') as HTMLInputElement);
    const emailInput = (document.getElementById('invite-email') as HTMLInputElement);
    const roleSelect = (document.getElementById('invite-role') as HTMLSelectElement);
    
    const name = form?.value || '';
    const email = emailInput?.value || '';
    const role = (roleSelect?.value || 'editor') as MemberRole;
    
    if (!email.trim()) return;
    const now = new Date().toISOString();
    setMembers((prev) => [
      {
        id: `${email}-${Date.now()}`,
        name: name || email.split('@')[0],
        email: email,
        role: role,
        status: 'invited',
        joinedAt: now,
      },
      ...prev,
    ]);
    setInviteOpen(false);
  };

  const handleRoleChange = (memberId: string, role: MemberRole) => {
    setMembers((prev) =>
      prev.map((member) => (member.id === memberId ? { ...member, role } : member)),
    );
    setShowRoleMenu(null);
  };

  const handleRemove = (memberId: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-page)',
    }}>
      <div style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
            }}>
              <Users style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '22px', 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                margin: 0,
              }}>
                团队成员
              </h1>
              <p style={{ 
                color: 'var(--text-muted)', 
                margin: '2px 0 0',
                fontSize: '13px',
              }}>
                共 {stats.total} 名成员
              </p>
            </div>
          </div>

          <button
            onClick={() => setInviteOpen(true)}
            style={{
              height: '44px',
              padding: '0 20px',
              fontSize: '14px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)';
            }}
          >
            <UserPlus style={{ width: '18px', height: '18px' }} />
            邀请成员
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>总成员</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.total}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Check style={{ width: '20px', height: '20px', color: '#10b981' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>活跃成员</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.active}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Mail style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>待接受邀请</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>{stats.invited}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid var(--border-primary)',
          backdropFilter: 'blur(20px)',
          marginBottom: '20px',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: 'var(--text-muted)',
                }} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索成员..."
                  style={{
                    width: '240px',
                    height: '40px',
                    padding: '0 12px 0 36px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as MemberRole | 'all')}
                style={{
                  height: '40px',
                  padding: '0 32px 0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                <option value="all">全部角色</option>
                <option value="owner">所有者</option>
                <option value="admin">管理员</option>
                <option value="editor">编辑者</option>
                <option value="viewer">查看者</option>
              </select>
            </div>

            <span style={{ 
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}>
              显示 {filteredMembers.length} / {members.length} 位成员
            </span>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border-primary)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
        }}>
          {filteredMembers.length > 0 ? (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
                gap: '16px',
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-secondary)',
              }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>成员</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>状态</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>角色</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>加入时间</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>操作</span>
              </div>

              {filteredMembers.map((member) => {
                const role = roleConfig[member.role];
                const status = statusConfig[member.status];
                const RoleIcon = role.icon;
                const initials = createInitials(member.name, member.email);
                const avatarColor = getAvatarColor(member.email);
                const isHovered = hoveredMember === member.id;
                
                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
                      gap: '16px',
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border-primary)',
                      backgroundColor: isHovered ? 'var(--bg-hover)' : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={() => setHoveredMember(member.id)}
                    onMouseLeave={() => setHoveredMember(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '2px solid var(--border-primary)',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: avatarColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '14px',
                          boxShadow: `0 4px 12px ${avatarColor.replace(')', ', 0.3)').replace('hsl', 'hsla')}`,
                        }}>
                          {initials}
                        </div>
                      )}
                      <div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          {member.name}
                          {member.email === user?.email && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: '600',
                            }}>
                              你
                            </span>
                          )}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}>
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: status.bgColor,
                        border: `1px solid ${status.borderColor}`,
                        color: status.color,
                        fontSize: '11px',
                        fontWeight: '600',
                      }}>
                        {status.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: role.bgColor,
                        border: `1px solid ${role.borderColor}`,
                        color: role.color,
                        fontSize: '11px',
                        fontWeight: '600',
                      }}>
                        <RoleIcon style={{ width: '12px', height: '12px' }} />
                        {role.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}>
                        <Clock style={{ width: '12px', height: '12px' }} />
                        {formatDate(member.joinedAt)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {member.role !== 'owner' && (
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => setShowRoleMenu(showRoleMenu === member.id ? null : member.id)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-primary)',
                              backgroundColor: isHovered ? 'var(--bg-secondary)' : 'transparent',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <MoreVertical style={{ width: '16px', height: '16px' }} />
                          </button>

                          {showRoleMenu === member.id && (
                            <div style={{
                              position: 'absolute',
                              top: 'calc(100% + 6px)',
                              right: 0,
                              backgroundColor: 'var(--bg-card)',
                              borderRadius: '12px',
                              border: '1px solid var(--border-primary)',
                              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                              padding: '6px',
                              minWidth: '140px',
                              zIndex: 100,
                            }}>
                              <div style={{ padding: '8px 10px', fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                更改角色
                              </div>
                              {(['admin', 'editor', 'viewer'] as MemberRole[]).map((r) => (
                                <button
                                  key={r}
                                  onClick={() => handleRoleChange(member.id, r)}
                                  style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: member.role === r ? roleConfig[r].bgColor : 'transparent',
                                    color: member.role === r ? roleConfig[r].color : 'var(--text-primary)',
                                    fontSize: '12px',
                                    fontWeight: member.role === r ? '600' : '400',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {member.role === r && <Check style={{ width: '12px', height: '12px' }} />}
                                  {roleConfig[r].label}
                                </button>
                              ))}
                              <div style={{ 
                                height: '1px', 
                                backgroundColor: 'var(--border-primary)', 
                                margin: '6px 0' 
                              }} />
                              <button
                                onClick={() => handleRemove(member.id)}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#ef4444',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <Trash2 style={{ width: '12px', height: '12px' }} />
                                移除成员
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              padding: '64px 32px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: 'var(--bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Users style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: '0 0 8px',
              }}>
                未找到成员
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                margin: '0 0 24px',
              }}>
                {searchQuery || roleFilter !== 'all' 
                  ? '尝试调整搜索条件或筛选器'
                  : '邀请您的第一位团队成员'
                }
              </p>
              {!searchQuery && roleFilter === 'all' && (
                <button
                  onClick={() => setInviteOpen(true)}
                  style={{
                    height: '44px',
                    padding: '0 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <UserPlus style={{ width: '18px', height: '18px' }} />
                  邀请成员
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {inviteOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={() => setInviteOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '420px',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '24px',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <UserPlus style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <h2 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  margin: 0,
                }}>
                  邀请团队成员
                </h2>
              </div>
              <button
                onClick={() => setInviteOpen(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: 'var(--text-secondary)', 
                  marginBottom: '8px' 
                }}>
                  姓名
                </label>
                <input
                  id="invite-name"
                  placeholder="输入成员姓名"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: 'var(--text-secondary)', 
                  marginBottom: '8px' 
                }}>
                  邮箱地址
                </label>
                <input
                  id="invite-email"
                  type="email"
                  placeholder="example@company.com"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: 'var(--text-secondary)', 
                  marginBottom: '8px' 
                }}>
                  角色
                </label>
                <select
                  id="invite-role"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="admin">管理员</option>
                  <option value="editor">编辑者</option>
                  <option value="viewer">查看者</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  style={{
                    flex: 1,
                    height: '48px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setInviteOpen(false)}
                >
                  取消
                </button>
                <button
                  style={{
                    flex: 1,
                    height: '48px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={handleInvite}
                >
                  发送邀请
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
