import { useState, useEffect } from 'react';
import type { DesignTextObject } from '@/types';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TextEditorPanelProps {
  textObject: DesignTextObject;
  onUpdate: (changes: Partial<DesignTextObject>) => void;
  onUpdateWithHistory: (changes: Partial<DesignTextObject>) => void;
}

const COLORS = ['#111111', '#ffffff', '#c0392b', '#2980b9', '#27ae60'];

export default function TextEditorPanel({ textObject, onUpdate, onUpdateWithHistory }: TextEditorPanelProps) {
  const [text, setText] = useState(textObject.text);
  const [fontSize, setFontSize] = useState(textObject.fontSize);
  const [fill, setFill] = useState(textObject.fill);
  const [align, setAlign] = useState(textObject.align);

  useEffect(() => {
    setText(textObject.text);
    setFontSize(textObject.fontSize);
    setFill(textObject.fill);
    setAlign(textObject.align);
  }, [textObject.id, textObject.text, textObject.fontSize, textObject.fill, textObject.align]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>TEXT</label>
        <input
          type="text"
          value={text}
          maxLength={40}
          onChange={(e) => {
            setText(e.target.value);
            onUpdate({ text: e.target.value } as any);
          }}
          onBlur={() => onUpdateWithHistory({ text } as any)}
          placeholder="TYPE YOUR TEXT"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>FONT SIZE</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            style={stepBtnStyle}
            onClick={() => {
              const next = Math.max(10, fontSize - 2);
              setFontSize(next);
              onUpdate({ fontSize: next } as any);
            }}
          >
            −
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 28, textAlign: 'center' }}>{fontSize}</span>
          <button
            style={stepBtnStyle}
            onClick={() => {
              const next = Math.min(120, fontSize + 2);
              setFontSize(next);
              onUpdate({ fontSize: next } as any);
            }}
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label style={labelStyle}>COLOR</label>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setFill(c); onUpdate({ fill: c } as any); }}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: fill === c ? '2px solid #111111' : '1px solid rgba(17,17,17,0.15)',
                background: c,
                cursor: 'pointer',
                transition: 'border 0.15s',
              }}
              aria-label={`Color ${c}`}
            />
          ))}
          <label style={{ position: 'relative', cursor: 'pointer' }}>
            <input
              type="color"
              value={fill}
              onChange={(e) => { setFill(e.target.value); onUpdate({ fill: e.target.value } as any); }}
              style={{ position: 'absolute', opacity: 0, width: 24, height: 24, cursor: 'pointer' }}
            />
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '1px solid rgba(17,17,17,0.15)',
              background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)`,
              cursor: 'pointer',
            }} />
          </label>
        </div>
      </div>

      <div>
        <label style={labelStyle}>ALIGNMENT</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {([
            { value: 'left', Icon: AlignLeft },
            { value: 'center', Icon: AlignCenter },
            { value: 'right', Icon: AlignRight },
          ] as const).map(({ value, Icon }) => (
            <button
              key={value}
              onClick={() => { setAlign(value); onUpdate({ align: value } as any); }}
              style={{
                ...stepBtnStyle,
                width: 36,
                background: align === value ? '#111111' : 'rgba(17,17,17,0.06)',
                color: align === value ? '#fff' : '#111111',
              }}
              aria-label={`Align ${value}`}
            >
              <Icon size={14} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(0,0,0,0.4)',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 13,
  fontFamily: 'inherit',
  border: 'none',
  borderBottom: '1px solid rgba(17,17,17,0.15)',
  background: 'transparent',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const stepBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  border: 'none',
  borderRadius: 4,
  background: 'rgba(17,17,17,0.06)',
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 500,
  color: '#111111',
  transition: 'background 0.15s',
};
