import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

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

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/documents', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.data || []);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = () => {
    navigate('/documents/create');
  };

  const handleDocumentClick = (document: Document) => {
    navigate(`/documents/${document.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            title="Error Loading Documents"
            description={error}
            action={{ label: 'Try Again', onClick: fetchDocuments }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-1">Manage your project documents</p>
          </div>
          <Button onClick={handleCreateDocument} className="bg-gradient-to-r from-blue-600 to-purple-600">
            Create Document
          </Button>
        </div>

        {/* Document List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="No Documents Yet"
                description="Create your first document to get started"
                action={{ label: 'Create Document', onClick: handleCreateDocument }}
              />
            </div>
          ) : (
            documents.map((document) => (
              <Card 
                key={document.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleDocumentClick(document)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {document.title}
                  </h3>
                  <Badge variant="default" className="ml-2">
                    {document.type}
                  </Badge>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {document.content.substring(0, 100)}...
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <StatusBadge status={document.status as any} size="small" className="mr-2" />
                    <span className="text-xs text-gray-500">
                      {new Date(document.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    {document.project && (
                      <Badge variant="default" className="text-xs">
                        {document.project.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;