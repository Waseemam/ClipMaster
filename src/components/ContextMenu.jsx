import React, { useEffect, useRef } from 'react';

export function ContextMenu({ position, items, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] bg-app-bg-primary border border-border/50 rounded-lg shadow-lg py-1"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.separator ? (
            <div className="h-px bg-border/30 my-1" />
          ) : (
            <button
              onClick={() => {
                item.onClick();
                onClose();
              }}
              disabled={item.disabled}
              className={`
                w-full px-4 py-2 text-left text-sm flex items-center gap-3
                transition-colors
                ${item.disabled
                  ? 'text-app-text-muted cursor-not-allowed opacity-50'
                  : item.danger
                  ? 'text-destructive hover:bg-destructive/10'
                  : 'text-app-text-primary hover:bg-app-bg-tertiary'
                }
              `}
            >
              {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-app-text-muted ml-auto">{item.shortcut}</span>
              )}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
