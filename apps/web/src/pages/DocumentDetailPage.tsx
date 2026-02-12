import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/input';

interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
}

const DocumentDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    type: '',
    status: '',
  });

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/documents/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const data = await response.json();
      setDocument(data.data);
      setEditData({
        title: data.data.title,
        content: data.data.content,
        type: data.data.type,
        status: data.data.status,
      });
    } catch (err) {
      setError('Failed to load document');
      console.error('Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocument = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const data = await response.json();
      setDocument(data.data);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update document');
      console.error('Error updating document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      navigate('/documents');
    } catch (err) {
      setError('Failed to delete document');
      console.error('Error deleting document:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            title="Document Not Found"
            description={error || 'The document you are looking for does not exist'}
            action={{ label: 'Back to Documents', onClick: () => navigate('/documents') }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button onClick={() => navigate('/documents')} variant="default" className="mb-4">
              Back to Documents
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Document Details</h1>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button onClick={handleUpdateDocument} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="default">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Edit Document
                </Button>
                <Button onClick={handleDeleteDocument} variant="destructive">
                  Delete Document
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Document Content */}
        <Card className="p-6 mb-6">
          {/* Document Header */}
          <div className="mb-6">
            {isEditing ? (
              <Input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="text-xl font-bold mb-2"
                placeholder="Document Title"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{document.title}</h2>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="default">{document.type}</Badge>
              <StatusBadge status={document.status as any} />
              <Badge variant="default" className="text-xs">
                Updated: {new Date(document.updatedAt).toLocaleDateString()}
              </Badge>
            </div>
            {document.project && (
              <div className="mb-4">
                <Badge variant="default">
                  Project: {document.project.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Document Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Content</h3>
            {isEditing ? (
              <textarea
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg min-h-[300px]"
                placeholder="Document content..."
              />
            ) : (
              <div className="prose max-w-none">
                {document.content.split('\n').map((line, index) => (
                  <p key={index}>{line || <br />}</p>
                ))}
              </div>
            )}
          </div>

          {/* Document Metadata */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-gray-900">{new Date(document.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="text-gray-900">{new Date(document.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DocumentDetailPage;