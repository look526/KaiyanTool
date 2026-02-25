import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Mail, Crown, Shield, User, Check, X, Users, Settings, Trash2, MoreVertical } from 'lucide-react';
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

const roleConfig: Record<MemberRole, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Crown }> = {
  owner: { label: 'Owner', color: 'var(--accent)', bgColor: 'var(--accent-bg)', borderColor: 'var(--accent-border)', icon: Crown },
  admin: { label: 'Admin', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)', icon: Shield },
  editor: { label: 'Editor', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', icon: User },
  viewer: { label: 'Viewer', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)', borderColor: 'rgba(100, 116, 139, 0.2)', icon: User },
};

const statusConfig: Record<MemberStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  active: { label: 'Active', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  invited: { label: 'Invited', color: 'var(--accent)', bgColor: 'var(--accent-bg)', borderColor: 'var(--accent-border)' },
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
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kaiyan.teamMembers');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as TeamMember[];
      if (Array.isArray(parsed)) {
        setMembers(parsed);
      }
    } catch {
      // Ignore invalid local cache.
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
          name: user.name || 'Team Owner',
          email: user.email,
          role: 'owner',
          status: 'active',
          joinedAt: createdAt.toISOString(),
          avatarUrl: user.avatarUrl,
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
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'var(--bg-base)',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-primary)',
        padding: '20px 24px',
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--accent-border)',
            }}>
              <Users style={{ width: '22px', height: '22px', color: 'var(--accent)' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                Team Members
              </h1>
              <p style={{ 
                color: 'var(--text-tertiary)', 
                margin: '2px 0 0',
                fontSize: '13px',
              }}>
                {stats.total} member{stats.total !== 1 ? 's' : ''} in your team
              </p>
            </div>
          </div>

          <button
            onClick={() => setInviteOpen(true)}
            style={{
              height: '38px',
              padding: '0 16px',
              fontSize: '14px',
              fontWeight: '500',
              background: 'var(--accent)',
              color: 'var(--accent-on)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Invite
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                color: 'var(--text-tertiary)',
              }} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  width: '220px',
                  padding: '8px 10px 8px 32px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as MemberRole | 'all')}
              style={{
                height: '34px',
                padding: '0 28px 0 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <span style={{ 
            color: 'var(--text-tertiary)',
            fontSize: '12px',
          }}>
            {filteredMembers.length} of {members.length} members
          </span>
        </div>

        {/* Members List */}
        <div style={{ 
          backgroundColor: 'var(--bg-surface)', 
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}>
          {filteredMembers.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--bg-elevated)',
                  }}>
                    Member
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--bg-elevated)',
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--bg-elevated)',
                  }}>
                    Role
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--bg-elevated)',
                  }}>
                    Joined
                  </th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'right', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--bg-elevated)',
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const role = roleConfig[member.role];
                  const status = statusConfig[member.status];
                  const RoleIcon = role.icon;
                  const initials = createInitials(member.name, member.email);
                  const avatarColor = getAvatarColor(member.email);
                  
                  return (
                    <tr
                      key={member.id}
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: avatarColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '13px',
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
                              gap: '6px',
                            }}>
                              {member.name}
                              {member.email === user?.email && (
                                <span style={{
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  backgroundColor: 'var(--accent-bg)',
                                  color: 'var(--accent)',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                }}>
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: 'var(--text-tertiary)',
                              marginTop: '1px',
                            }}>
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: status.bgColor,
                          border: `1px solid ${status.borderColor}`,
                          color: status.color,
                          fontSize: '11px',
                          fontWeight: '600',
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: role.bgColor,
                          border: `1px solid ${role.borderColor}`,
                          color: role.color,
                          fontSize: '11px',
                          fontWeight: '600',
                        }}>
                          <RoleIcon style={{ width: '11px', height: '11px' }} />
                          {role.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '12px',
                          color: 'var(--text-tertiary)',
                        }}>
                          {formatDate(member.joinedAt)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {member.role !== 'owner' && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={() => setShowRoleMenu(showRoleMenu === member.id ? null : member.id)}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-primary)',
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-secondary)',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Settings style={{ width: '12px', height: '12px' }} />
                              </button>

                              {showRoleMenu === member.id && (
                                <div style={{
                                  position: 'absolute',
                                  top: 'calc(100% + 4px)',
                                  right: 0,
                                  backgroundColor: 'var(--bg-surface)',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-primary)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  padding: '4px',
                                  minWidth: '120px',
                                  zIndex: 100,
                                }}>
                                  {(['admin', 'editor', 'viewer'] as MemberRole[]).map((r) => (
                                    <button
                                      key={r}
                                      onClick={() => handleRoleChange(member.id, r)}
                                      style={{
                                        width: '100%',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: member.role === r ? 'var(--accent-bg)' : 'transparent',
                                        color: member.role === r ? 'var(--accent)' : 'var(--text-primary)',
                                        fontSize: '12px',
                                        fontWeight: member.role === r ? '600' : '400',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                      }}
                                    >
                                      {roleConfig[r].label}
                                    </button>
                                  ))}
                                  <div style={{ 
                                    height: '1px', 
                                    backgroundColor: 'var(--border-subtle)', 
                                    margin: '4px 0' 
                                  }} />
                                  <button
                                    onClick={() => handleRemove(member.id)}
                                    style={{
                                      width: '100%',
                                      padding: '6px 10px',
                                      borderRadius: '4px',
                                      border: 'none',
                                      backgroundColor: 'transparent',
                                      color: '#ef4444',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <Trash2 style={{ width: '12px', height: '12px' }} />
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <Users style={{ width: '22px', height: '22px', color: 'var(--text-tertiary)' }} />
              </div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: '0 0 4px',
              }}>
                No members found
              </h3>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                margin: '0',
              }}>
                {searchQuery || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Invite your first team member'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--overlay-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setInviteOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '380px',
              width: '100%',
              margin: '24px',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '16px' 
            }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                margin: 0,
              }}>
                Invite Team Member
              </h2>
              <button
                onClick={() => setInviteOpen(false)}
                style={{
                  padding: '4px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: 'var(--text-secondary)', 
                  marginBottom: '4px' 
                }}>
                  Full Name
                </label>
                <input
                  id="invite-name"
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: 'var(--text-secondary)', 
                  marginBottom: '4px' 
                }}>
                  Email Address
                </label>
                <input
                  id="invite-email"
                  placeholder="john@company.com"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: 'var(--text-secondary)', 
                  marginBottom: '4px' 
                }}>
                  Role
                </label>
                <select
                  id="invite-role"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  style={{
                    flex: 1,
                    height: '36px',
                    fontSize: '13px',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    flex: 1,
                    height: '36px',
                    fontSize: '13px',
                    fontWeight: '500',
                    background: 'var(--accent)',
                    color: 'var(--accent-on)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onClick={handleInvite}
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
