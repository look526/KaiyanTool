import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Mail, Crown, Shield, User, Check, X, Users } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Card } from '../components/ui/card';
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
}

const roleConfig: Record<MemberRole, { label: string; color: string; icon: typeof Crown }> = {
  owner: { label: 'Owner', color: '#f59e0b', icon: Crown },
  admin: { label: 'Admin', color: '#6366f1', icon: Shield },
  editor: { label: 'Editor', color: '#10b981', icon: User },
  viewer: { label: 'Viewer', color: '#6b7280', icon: User },
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
  return `hsl(${hash}, 70%, 45%)`;
};

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'editor' as MemberRole,
  });

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
    if (!inviteForm.email.trim()) return;
    const now = new Date().toISOString();
    setMembers((prev) => [
      {
        id: `${inviteForm.email}-${Date.now()}`,
        name: inviteForm.name || inviteForm.email.split('@')[0],
        email: inviteForm.email,
        role: inviteForm.role,
        status: 'invited',
        joinedAt: now,
      },
      ...prev,
    ]);
    setInviteForm({ name: '', email: '', role: 'editor' });
    setInviteOpen(false);
  };

  const handleRoleChange = (memberId: string, role: MemberRole) => {
    setMembers((prev) =>
      prev.map((member) => (member.id === memberId ? { ...member, role } : member)),
    );
  };

  const handleRemove = (memberId: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '72px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Team Management
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Manage members, roles, and invitations
            </span>
          </div>

          <button
            onClick={() => setInviteOpen(true)}
            style={{
              height: '38px',
              padding: '0 18px',
              fontSize: '14px',
              fontWeight: '600',
              background: 'var(--accent)',
              color: 'var(--accent-on)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Invite Member
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            {[
              { label: 'Total Members', value: stats.total, icon: Users },
              { label: 'Active', value: stats.active, icon: Check },
              { label: 'Invited', value: stats.invited, icon: Mail },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--accent-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {item.value}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card style={{ padding: '18px' }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              marginBottom: '18px',
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
                    placeholder="Search by name or email"
                    style={{
                      width: '260px',
                      padding: '10px 14px 10px 36px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as MemberRole | 'all')}
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                >
                  <option value="all">All roles</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Showing {filteredMembers.length} of {members.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredMembers.map((member) => {
                const role = roleConfig[member.role];
                const RoleIcon = role.icon;
                const initials = createInitials(member.name, member.email);
                const avatarColor = getAvatarColor(member.email);
                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '14px',
                        backgroundColor: avatarColor,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {member.name}
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            backgroundColor: member.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                            color: member.status === 'active' ? '#10b981' : '#3b82f6',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}>
                            {member.status === 'active' ? 'Active' : 'Invited'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        backgroundColor: `${role.color}15`,
                        color: role.color,
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        <RoleIcon style={{ width: '14px', height: '14px' }} />
                        {role.label}
                      </div>

                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as MemberRole)}
                        disabled={member.role === 'owner'}
                        style={{
                          height: '34px',
                          padding: '0 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-primary)',
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          cursor: member.role === 'owner' ? 'not-allowed' : 'pointer',
                          opacity: member.role === 'owner' ? 0.6 : 1,
                        }}
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>

                      <button
                        onClick={() => handleRemove(member.id)}
                        disabled={member.role === 'owner'}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: member.role === 'owner' ? 'var(--text-muted)' : '#ef4444',
                          cursor: member.role === 'owner' ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (member.role !== 'owner') {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div style={{
                  padding: '40px 24px',
                  textAlign: 'center',
                  color: 'var(--text-tertiary)',
                  fontSize: '14px',
                }}>
                  No members match your filters.
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      {inviteOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setInviteOpen(false)}
        >
          <Card
            style={{ padding: '28px', maxWidth: '460px', width: '100%', margin: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Invite new member
              </h2>
              <button
                onClick={() => setInviteOpen(false)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Full name
                </label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="Jane Doe"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Email address
                </label>
                <input
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="jane@company.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as MemberRole })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button
                  style={{
                    flex: 1,
                    height: '38px',
                    padding: '0 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: 'transparent',
                    color: 'var(--text-tertiary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    flex: 1,
                    height: '38px',
                    padding: '0 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: 'var(--accent)',
                    color: 'var(--accent-on)',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: inviteForm.email.trim() ? 'pointer' : 'not-allowed',
                    opacity: inviteForm.email.trim() ? 1 : 0.6,
                  }}
                  onClick={handleInvite}
                  disabled={!inviteForm.email.trim()}
                >
                  Send Invite
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
