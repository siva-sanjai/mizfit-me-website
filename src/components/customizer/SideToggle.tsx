interface SideToggleProps {
  activeSide: 'front' | 'back';
  onToggle: (side: 'front' | 'back') => void;
}

export default function SideToggle({ activeSide, onToggle }: SideToggleProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 18,
        left: 18,
        zIndex: 20,
        display: 'flex',
        borderRadius: 6,
        overflow: 'hidden',
        border: '1px solid rgba(17,17,17,0.12)',
      }}
    >
      {(['front', 'back'] as const).map((side) => (
        <button
          key={side}
          onClick={() => onToggle(side)}
          aria-label={`${side === 'front' ? 'Front view' : 'Back view'}`}
          style={{
            padding: '6px 14px',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'inherit',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.18s',
            background: activeSide === side ? '#111111' : 'rgba(255,255,255,0.85)',
            color: activeSide === side ? '#ffffff' : 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {side === 'front' ? 'FRONT' : 'BACK'}
        </button>
      ))}
    </div>
  );
}
