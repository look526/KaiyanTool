import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  X,
  Check,
  Crown,
  Eye,
  Edit3,
  Trash2,
  MessageSquare,
  Send,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';

interface TeamMember {
  id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  joinedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  invitedBy?: {
    name: string;
  };
}

interface CollaborationPanelProps {
  projectId: string;
  members: TeamMember[];
  invitations: Invitation[];
  currentUserRole: 'owner' | 'admin' | 'editor' | 'viewer';
  onInvite: (email: string, role: 'admin' | 'editor' | 'viewer') => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateRole: (memberId: string, role: 'admin' | 'editor' | 'viewer' | 'owner') => void;
  onCancelInvitation: (invitationId: string) => void;
  onResendInvitation: (invitationId: string) => void;
}

export function CollaborationPanel({
  projectId,
  members,
  invitations,
  currentUserRole,
  onInvite,
  onRemoveMember,
  onUpdateRole,
  onCancelInvitation,
  onResendInvitation
}: CollaborationPanelProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canInvite = canManageMembers;

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    onInvite(inviteEmail.trim(), inviteRole);
    setShowInviteDialog(false);
    setInviteEmail('');
    setInviteRole('editor');
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-500" />;
      case 'editor':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return '所有者';
      case 'admin':
        return '管理员';
      case 'editor':
        return '编辑者';
      case 'viewer':
        return '查看者';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">团队协作</h3>
            <span className="text-sm text-gray-500">({members.length} 人)</span>
          </div>
          {canInvite && (
            <button
              onClick={() => setShowInviteDialog(true)}
              className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              邀请成员
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${
              activeTab === 'members'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            成员 ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${
              activeTab === 'invitations'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            邀请 ({invitations.filter(i => i.status === 'pending').length})
          </button>
        </div>
      </div>

      {activeTab === 'members' ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
          {members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-medium">
                  {member.user.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.user.name}</span>
                    {getRoleIcon(member.role)}
                  </div>
                  <div className="text-sm text-gray-500">{member.user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(member.joinedAt).toLocaleDateString()}
                </span>

                {canManageMembers && member.role !== 'owner' && (
                  <div className="relative group">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => onUpdateRole(member.id, 'admin')}
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4 text-purple-500" />
                          设为管理员
                        </button>
                      )}
                      {member.role !== 'editor' && (
                        <button
                          onClick={() => onUpdateRole(member.id, 'editor')}
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4 text-blue-500" />
                          设为编辑者
                        </button>
                      )}
                      {member.role !== 'viewer' && (
                        <button
                          onClick={() => onUpdateRole(member.id, 'viewer')}
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                          设为查看者
                        </button>
                      )}
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 flex items-center gap-2"
                      >
                        <UserX className="w-4 h-4" />
                        移除成员
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
          {invitations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无待处理的邀请</p>
            </div>
          ) : (
            invitations.map((invitation) => (
              <div key={invitation.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{getRoleLabel(invitation.role as any)}</span>
                      <span>•</span>
                      <span>
                        {invitation.status === 'pending' ? '等待响应' :
                         invitation.status === 'accepted' ? '已接受' :
                         invitation.status === 'expired' ? '已过期' : '已拒绝'}
                      </span>
                    </div>
                  </div>
                </div>

                {invitation.status === 'pending' && canManageMembers && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onResendInvitation(invitation.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-500"
                      title="重新发送"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCancelInvitation(invitation.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                      title="取消邀请"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showInviteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">邀请成员</h4>
              <button onClick={() => setShowInviteDialog(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">邮箱地址</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="输入邮箱..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">角色</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <option value="admin">管理员 - 完全访问权限</option>
                  <option value="editor">编辑者 - 可编辑内容</option>
                  <option value="viewer">查看者 - 只读权限</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteDialog(false)}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                发送邀请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CommentThreadProps {
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: string;
    user: {
      name: string;
      avatar?: string;
    };
  }>;
  onAddComment: (content: string) => void;
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

export function CommentThread({
  comments,
  onAddComment,
  onResolve,
  onDelete
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="添加评论..."
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[60px] resize-none"
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3 rounded-lg ${
              comment.resolved
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
                  {comment.user.name[0]}
                </div>
                <span className="font-medium text-sm">{comment.user.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!comment.resolved && (
                  <button
                    onClick={() => onResolve(comment.id)}
                    className="p-1 text-gray-400 hover:text-green-500"
                    title="标记为已解决"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(comment.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm">{comment.content}</p>
            {comment.resolved && (
              <div className="mt-2 text-xs text-green-600">
                ✓ 已解决
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
