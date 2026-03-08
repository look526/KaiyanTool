import React, { useState } from 'react';
import { Edit2, Trash2, X, User, Shirt, Hash, Calendar } from 'lucide-react';
import { Character } from '../lib/api';

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
  onAddWardrobe: (character: Character) => void;
  onDeleteWardrobe: (characterId: string, wardrobeId: string) => void;
  isDark: boolean;
  colors: {
    bgSecondary: string;
    bgGlassHover: string;
    border: string;
    borderHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
  };
  accentColor: string;
  accentLight: string;
}

export function CharacterCard({
  character,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAddWardrobe,
  onDeleteWardrobe,
  isDark,
  colors,
  accentColor,
  accentLight,
}: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditHovered, setIsEditHovered] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const [isAddWardrobeHovered, setIsAddWardrobeHovered] = useState(false);

  return (
    <div
      style={{
        background: colors.bgSecondary,
        borderRadius: '18px',
        padding: '20px',
        border: isSelected ? `2px solid ${accentColor}` : `1px solid ${colors.border}`,
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        transform: isHovered && !isSelected ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered && !isSelected ? `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px ${accentColor}10` : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
          <button
            onClick={() => onSelect(character.id)}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              border: isSelected ? 'none' : `2px solid ${colors.border}`,
              background: isSelected ? accentColor : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {isSelected && <X style={{ width: '12px', height: '12px', color: 'white' }} />}
          </button>
          {character.reference_images && character.reference_images.length > 0 ? (
            <img
              src={character.reference_images[0]}
              alt={character.name}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentLight} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{character.name}</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {character.age && (
                <span style={{ fontSize: '12px', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar style={{ width: '12px', height: '12px' }} />
                  {character.age}岁
                </span>
              )}
              {character.gender && (
                <span style={{ fontSize: '12px', color: colors.textMuted }}>{character.gender}</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onEdit(character)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: isEditHovered ? colors.bgGlassHover : 'transparent',
              color: isEditHovered ? accentColor : colors.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={() => setIsEditHovered(true)}
            onMouseLeave={() => setIsEditHovered(false)}
          >
            <Edit2 style={{ width: '16px', height: '16px' }} />
          </button>
          <button
            onClick={() => onDelete(character.id)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: isDeleteHovered ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              color: isDeleteHovered ? '#ef4444' : colors.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      <p style={{
        fontSize: '13px',
        color: colors.textSecondary,
        lineHeight: '1.6',
        margin: '0 0 16px 0',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {character.appearance}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: colors.textMuted }}>
          <Shirt style={{ width: '14px', height: '14px' }} />
          <span>服装 ({character.wardrobes?.length || 0})</span>
        </div>
        <button
          onClick={() => onAddWardrobe(character)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: isAddWardrobeHovered ? `1px solid ${accentColor}` : `1px solid ${colors.border}`,
            background: isAddWardrobeHovered ? `${accentColor}10` : 'transparent',
            color: isAddWardrobeHovered ? accentColor : colors.textSecondary,
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={() => setIsAddWardrobeHovered(true)}
          onMouseLeave={() => setIsAddWardrobeHovered(false)}
        >
          添加
        </button>
      </div>

      {character.wardrobes && character.wardrobes.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {character.wardrobes.slice(0, 2).map((wardrobe) => (
            <div
              key={wardrobe.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: colors.bgGlassHover,
                borderRadius: '10px',
              }}
            >
              {wardrobe.referenceImage ? (
                <img
                  src={wardrobe.referenceImage}
                  alt={wardrobe.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: colors.bgSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Shirt style={{ width: '16px', height: '16px', color: colors.textMuted }} />
                </div>
              )}
              <span style={{ fontSize: '13px', color: colors.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wardrobe.name}</span>
              <button
                onClick={() => onDeleteWardrobe(character.id, wardrobe.id)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.textMuted;
                }}
              >
                <X style={{ width: '12px', height: '12px' }} />
              </button>
            </div>
          ))}
          {character.wardrobes.length > 2 && (
            <div style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center' }}>
              还有 {character.wardrobes.length - 2} 套服装
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: colors.textMuted }}>
        <Hash style={{ width: '12px', height: '12px' }} />
        <span>出镜 {character._count?.shots || 0} 次</span>
      </div>
    </div>
  );
}
