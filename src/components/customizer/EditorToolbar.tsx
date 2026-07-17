import { RotateCcw, AlignCenter, Copy, Trash2, Undo2, Redo2, ArrowUp, ArrowDown } from 'lucide-react';
import type { DesignItem } from '@/types';

interface EditorToolbarProps {
  selectedObject: DesignItem | null;
  onCenter: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onReset?: () => void;
  isMobile: boolean;
}

export default function EditorToolbar({
  selectedObject,
  onCenter,
  onDuplicate,
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onMoveUp,
  onMoveDown,
  onReset,
  isMobile,
}: EditorToolbarProps) {
  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    border: 'none',
    background: 'rgba(17,17,17,0.06)',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background 0.15s',
    flexShrink: 0,
  };

  const btnHoverStyle = 'rgba(17,17,17,0.12)';

  const iconProps = { size: 16, strokeWidth: 1.5, color: '#111111' };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        padding: isMobile ? '8px 0' : '4px 0',
        WebkitOverflowScrolling: 'touch',
      }}
      className="mizfit-editor-toolbar"
    >
      {selectedObject && (
        <>
          <button
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = btnHoverStyle; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(17,17,17,0.06)'; }}
            onClick={onCenter}
            title="Center"
            aria-label="Center design"
          >
            <AlignCenter {...iconProps} />
          </button>
          <button
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = btnHoverStyle; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(17,17,17,0.06)'; }}
            onClick={onDuplicate}
            title="Duplicate"
            aria-label="Duplicate object"
          >
            <Copy {...iconProps} />
          </button>
          <button
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = btnHoverStyle; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(17,17,17,0.06)'; }}
            onClick={onReset}
            title="Reset"
            aria-label="Reset object"
          >
            <RotateCcw {...iconProps} />
          </button>
          {onMoveUp && (
            <button
              style={btnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = btnHoverStyle; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(17,17,17,0.06)'; }}
              onClick={onMoveUp}
              title="Bring Forward"
              aria-label="Bring forward"
            >
              <ArrowUp {...iconProps} />
            </button>
          )}
          {onMoveDown && (
            <button
              style={btnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = btnHoverStyle; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(17,17,17,0.06)'; }}
              onClick={onMoveDown}
              title="Send Backward"
              aria-label="Send backward"
            >
              <ArrowDown {...iconProps} />
            </button>
          )}
          <button
            style={{ ...btnStyle, background: 'rgba(180,30,30,0.08)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(180,30,30,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(180,30,30,0.08)'; }}
            onClick={onDelete}
            title="Delete"
            aria-label="Delete object"
          >
            <Trash2 size={16} strokeWidth={1.5} color="#b41e1e" />
          </button>
        </>
      )}

      <div style={{ flex: 1 }} />

      <button
        style={{ ...btnStyle, opacity: canUndo ? 1 : 0.35 }}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
        aria-label="Undo"
      >
        <Undo2 {...iconProps} />
      </button>
      <button
        style={{ ...btnStyle, opacity: canRedo ? 1 : 0.35 }}
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
        aria-label="Redo"
      >
        <Redo2 {...iconProps} />
      </button>
    </div>
  );
}
