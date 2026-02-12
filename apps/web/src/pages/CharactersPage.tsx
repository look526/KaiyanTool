import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  User,
  Shirt,
  Calendar,
  Hash,
  ImagePlus,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import ImageUpload from '../components/ImageUpload';
import { apiClient, Character } from '../lib/api';
import { useToast } from '../components/ui/Toast';

interface CharacterFormData {
  name: string;
  age: string;
  gender: string;
  appearance: string | undefined;
  referenceImages: string[];
}

interface WardrobeFormData {
  name: string;
  description: string;
  referenceImage: string;
}

export default function CharactersPage() {
  const { id } = useParams<{ id: string }>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const { addToast } = useToast();

  const [characterForm, setCharacterForm] = useState<CharacterFormData>({
    name: '',
    age: '',
    gender: '',
    appearance: '',
    referenceImages: []
  });

  const [wardrobeForm, setWardrobeForm] = useState<WardrobeFormData>({
    name: '',
    description: '',
    referenceImage: ''
  });

  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCharacters(id!);
      setCharacters(data);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleSaveCharacter = async () => {
    if (!characterForm.name || !characterForm.appearance) {
      return;
    }

    try {
      const data = {
        name: characterForm.name,
        age: characterForm.age ? parseInt(characterForm.age) : undefined,
        gender: characterForm.gender || undefined,
        appearance: characterForm.appearance,
        referenceImages: characterForm.referenceImages
      };

      if (editingCharacter) {
        await apiClient.updateCharacter(editingCharacter.id, data);
      } else {
        await apiClient.createCharacter(id!, data);
      }

      await loadCharacters();
      handleCloseCharacterModal();
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  const handleDeleteCharacter = async () => {
    if (!characterToDelete) return;

    try {
      await apiClient.deleteCharacter(characterToDelete);
      await loadCharacters();
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete character:', error);
    }
  };

  const handleAddWardrobe = async () => {
    if (!selectedCharacter || !wardrobeForm.name) {
      return;
    }

    try {
      await apiClient.createWardrobe(selectedCharacter.id, {
        name: wardrobeForm.name,
        description: wardrobeForm.description || undefined,
        images: wardrobeForm.referenceImage ? [wardrobeForm.referenceImage] : undefined
      });

      await loadCharacters();
      handleCloseWardrobeModal();
    } catch (error) {
      console.error('Failed to add wardrobe:', error);
    }
  };

  const handleDeleteWardrobe = async (_characterId: string, wardrobeId: string) => {
    try {
      await apiClient.deleteWardrobe(wardrobeId);
      await loadCharacters();
    } catch (error) {
      console.error('Failed to delete wardrobe:', error);
    }
  };

  const handleOpenCharacterModal = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      setCharacterForm({
        name: character.name,
        age: character.age?.toString() || '',
        gender: character.gender || '',
        appearance: character.appearance,
        referenceImages: character.referenceImages || []
      });
    } else {
      setEditingCharacter(null);
      setCharacterForm({
        name: '',
        age: '',
        gender: '',
        appearance: '',
        referenceImages: []
      });
    }
    setShowCharacterModal(true);
  };

  const handleCloseCharacterModal = () => {
    setShowCharacterModal(false);
    setEditingCharacter(null);
    setCharacterForm({
      name: '',
      age: '',
      gender: '',
      appearance: '',
      referenceImages: []
    });
  };

  const handleOpenWardrobeModal = (character: Character) => {
    setSelectedCharacter(character);
    setWardrobeForm({
      name: '',
      description: '',
      referenceImage: ''
    });
    setShowWardrobeModal(true);
  };

  const handleCloseWardrobeModal = () => {
    setShowWardrobeModal(false);
    setSelectedCharacter(null);
    setWardrobeForm({
      name: '',
      description: '',
      referenceImage: ''
    });
  };

  const handleOpenDeleteModal = (characterId: string) => {
    setCharacterToDelete(characterId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCharacterToDelete(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 style={{ width: '48px', height: '48px', animation: 'spin 1s linear infinite' }} />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to={`/projects/${id}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
            </Link>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}>角色管理</h1>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                共 {characters.length} 个角色
              </div>
            </div>
          </div>

          <Button onClick={() => handleOpenCharacterModal()}>
            <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            添加角色
          </Button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {characters.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
            }}>
              <User style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-tertiary)', fontSize: '16px', marginBottom: '24px' }}>
                暂无角色，点击右上角添加
              </p>
              <Button onClick={() => handleOpenCharacterModal()}>
                <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                添加角色
              </Button>
            </div>
          ) : (
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '20px'
            }}>
              {characters.map((character) => (
                <Card key={character.id} style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                      {character.referenceImages && character.referenceImages.length > 0 ? (
                        <img
                          src={character.referenceImages[0]}
                          alt={character.name}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            backgroundColor: 'var(--bg-hover)',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <User style={{ width: '32px', height: '32px', color: 'white' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          margin: '0 0 4px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {character.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {character.age && (
                            <span style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}>
                              <Calendar style={{ width: '12px', height: '12px' }} />
                              {character.age}岁
                            </span>
                          )}
                          {character.gender && (
                            <span style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                            }}>
                              {character.gender}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleOpenCharacterModal(character)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Edit2 style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(character.id)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    margin: '0 0 16px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {character.appearance}
                  </p>

                  {character.referenceImages && character.referenceImages.length > 1 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        paddingBottom: '4px',
                      }}>
                        {character.referenceImages.slice(1, 5).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`参考图 ${idx + 1}`}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              flexShrink: 0,
                              border: '1px solid var(--border-primary)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{
                    padding: '12px 0',
                    borderTop: '1px solid var(--border-primary)',
                    marginBottom: '12px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shirt style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          服装 ({character.wardrobes?.length || 0})
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenWardrobeModal(character)}
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-primary)',
                          background: 'transparent',
                          border: '1px solid var(--border-primary)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          e.currentTarget.style.borderColor = 'var(--border-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                        }}
                      >
                        添加
                      </button>
                    </div>

                    {character.wardrobes && character.wardrobes.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {character.wardrobes.slice(0, 3).map((wardrobe) => (
                          <div
                            key={wardrobe.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px',
                              backgroundColor: 'var(--bg-hover)',
                              borderRadius: '6px',
                            }}
                          >
                            {wardrobe.referenceImage ? (
                              <img
                                src={wardrobe.referenceImage}
                                alt={wardrobe.name}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-elevated)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Shirt style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                              </div>
                            )}
                            <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>
                              {wardrobe.name}
                            </span>
                            <button
                              onClick={() => handleDeleteWardrobe(character.id, wardrobe.id)}
                              style={{
                                padding: '4px',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                                e.currentTarget.style.color = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                              }}
                            >
                              <X style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        ))}
                        {character.wardrobes.length > 3 && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '4px' }}>
                            还有 {character.wardrobes.length - 3} 套服装
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Hash style={{ width: '12px', height: '12px' }} />
                    <span>出镜 {character._count?.shots || 0} 次</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCharacterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={handleCloseCharacterModal}
        >
          <Card style={{
            padding: '32px',
            maxWidth: '576px',
            width: '100%',
            margin: '24px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                {editingCharacter ? '编辑角色' : '添加角色'}
              </h2>
              <button
                onClick={handleCloseCharacterModal}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  角色名称 *
                </label>
                <input
                  type="text"
                  value={characterForm.name}
                  onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                  placeholder="输入角色名称"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    年龄
                  </label>
                  <input
                    type="number"
                    value={characterForm.age}
                    onChange={(e) => setCharacterForm({ ...characterForm, age: e.target.value })}
                    placeholder="例如：25"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    性别
                  </label>
                  <select
                    value={characterForm.gender}
                    onChange={(e) => setCharacterForm({ ...characterForm, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  外貌描述 *
                </label>
                <textarea
                  value={characterForm.appearance}
                  onChange={(e) => setCharacterForm({ ...characterForm, appearance: e.target.value })}
                  placeholder="描述角色的外貌特征、发型、着装风格等"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  参考图片
                </label>
                <ImageUpload
                  value={characterForm.referenceImages[0] || null}
                  onChange={(url) => {
                    if (url) {
                      setCharacterForm({
                        ...characterForm,
                        referenceImages: [...characterForm.referenceImages, url]
                      });
                    }
                  }}
                  type="character"
                  placeholder="添加角色参考图"
                />
                {characterForm.referenceImages.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '8px',
                  }}>
                    {characterForm.referenceImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img
                          src={img}
                          alt={`参考图 ${idx + 1}`}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid var(--border-primary)',
                          }}
                        />
                        <button
                          onClick={() => {
                            setCharacterForm({
                              ...characterForm,
                              referenceImages: characterForm.referenceImages.filter((_, i) => i !== idx)
                            });
                          }}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            border: '2px solid var(--bg-elevated)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={handleCloseCharacterModal}
                >
                  取消
                </Button>
                <Button
                  style={{ flex: 1 }}
                  onClick={handleSaveCharacter}
                  disabled={!characterForm.name || !characterForm.appearance}
                >
                  {editingCharacter ? '保存' : '添加'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showWardrobeModal && selectedCharacter && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={handleCloseWardrobeModal}
        >
          <Card style={{
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            margin: '24px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  margin: '0 0 4px 0',
                }}>
                  添加服装
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                  角色：{selectedCharacter.name}
                </p>
              </div>
              <button
                onClick={handleCloseWardrobeModal}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  服装名称 *
                </label>
                <input
                  type="text"
                  value={wardrobeForm.name}
                  onChange={(e) => setWardrobeForm({ ...wardrobeForm, name: e.target.value })}
                  placeholder="例如：商务正装"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  描述
                </label>
                <textarea
                  value={wardrobeForm.description}
                  onChange={(e) => setWardrobeForm({ ...wardrobeForm, description: e.target.value })}
                  placeholder="描述服装的样式、颜色、材质等"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>
                  参考图片
                </label>
                <div
                  style={{
                    padding: '20px',
                    border: '2px dashed var(--border-primary)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => document.getElementById('wardrobe-image-input')?.click()}
                >
                  <ImagePlus style={{ width: '32px', height: '32px', marginBottom: '8px', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>点击或拖拽上传图片</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                    支持 JPG、PNG、WebP 格式，最大 5MB
                  </p>
                </div>
                <input
                  id="wardrobe-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const result = await apiClient.uploadImage(file);
                        setWardrobeForm({
                          ...wardrobeForm,
                          referenceImage: result.url
                        });
                      } catch (error) {
                        console.error('上传失败:', error);
                        addToast({
                          type: 'error',
                          title: '上传失败',
                          message: '请稍后重试。',
                        });
                      }
                    }
                  }}
                />
                {wardrobeForm.referenceImage && (
                  <div style={{ marginTop: '12px', position: 'relative', display: 'inline-block' }}>
                    <img
                      src={wardrobeForm.referenceImage}
                      alt="服装参考图"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid var(--border-primary)',
                      }}
                    />
                    <button
                      onClick={() => setWardrobeForm({ ...wardrobeForm, referenceImage: '' })}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        border: '2px solid var(--bg-elevated)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={handleCloseWardrobeModal}
                >
                  取消
                </Button>
                <Button
                  style={{ flex: 1 }}
                  onClick={handleAddWardrobe}
                  disabled={!wardrobeForm.name}
                >
                  添加
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={handleCloseDeleteModal}
        >
          <Card style={{
            padding: '32px',
            maxWidth: '448px',
            width: '100%',
            margin: '24px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '12px',
              margin: '0 0 12px 0',
            }}>确认删除角色</h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              您确定要删除此角色吗？此操作不可撤销，所有相关数据将被永久删除。
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onClick={handleCloseDeleteModal}
              >
                取消
              </Button>
              <Button
                style={{
                  flex: 1,
                  backgroundColor: '#ef4444',
                  borderColor: '#ef4444',
                }}
                onClick={handleDeleteCharacter}
              >
                <Trash2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                删除
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
