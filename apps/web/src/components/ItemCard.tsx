import React, { useState } from 'react';
import { Edit2, Trash2, Square, CheckSquare } from 'lucide-react';

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    type: 'prop' | 'clothing' | 'accessory';
    image?: string;
    description?: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  getTypeInfo: (type: string) => any;
}

export function ItemCard({
  item,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  getTypeInfo,
}: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditHovered, setIsEditHovered] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const [isCheckboxHovered, setIsCheckboxHovered] = useState(false);

  const typeInfo = getTypeInfo(item.type);
  const TypeIcon = typeInfo.icon;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: isSelected ? '2px solid #f97316' : '1px solid var(--border-primary)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? 'var(--shadow-lg)' : 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {item.image ? (
        <div style={{
          aspectRatio: '16/9',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            gap: '8px',
          }}>
            <div
              onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isSelected ? '#f97316' : isCheckboxHovered ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setIsCheckboxHovered(true)}
              onMouseLeave={() => setIsCheckboxHovered(false)}
            >
              {isSelected ? (
                <CheckSquare style={{ width: '16px', height: '16px', color: 'white' }} />
              ) : (
                <Square style={{ width: '16px', height: '16px', color: 'white' }} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          aspectRatio: '16/9',
          background: typeInfo.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <TypeIcon style={{ width: '48px', height: '48px', color: typeInfo.color }} />
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
          }}>
            <div
              onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isSelected ? '#f97316' : isCheckboxHovered ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setIsCheckboxHovered(true)}
              onMouseLeave={() => setIsCheckboxHovered(false)}
            >
              {isSelected ? (
                <CheckSquare style={{ width: '16px', height: '16px', color: 'white' }} />
              ) : (
                <Square style={{ width: '16px', height: '16px', color: 'white' }} />
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {item.name}
            </h3>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '6px',
              backgroundColor: typeInfo.bgColor,
              border: `1px solid ${typeInfo.borderColor}`,
              color: typeInfo.color,
              fontSize: '11px',
              fontWeight: '600',
            }}>
              <TypeIcon style={{ width: '12px', height: '12px' }} />
              {typeInfo.name}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: isEditHovered ? 'var(--bg-hover)' : 'transparent',
                color: isEditHovered ? '#f97316' : 'var(--text-muted)',
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
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: isDeleteHovered ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                color: isDeleteHovered ? '#ef4444' : 'var(--text-muted)',
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

        {item.description && (
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
