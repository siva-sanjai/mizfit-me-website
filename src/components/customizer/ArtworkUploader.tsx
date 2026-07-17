import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES } from '@/types';

interface ArtworkUploaderProps {
  designFileName: string;
  designPreview: string | null;
  isDragOver: boolean;
  uploadError: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function ArtworkUploader({
  designFileName,
  designPreview,
  isDragOver,
  uploadError,
  onFileSelect,
  onRemove,
  onDragOver,
  onDragLeave,
  onDrop,
}: ArtworkUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div>
      {designPreview ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          border: '1px solid rgba(17,17,17,0.1)',
          borderRadius: 6,
          background: 'rgba(17,17,17,0.02)',
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 4,
            overflow: 'hidden',
            flexShrink: 0,
            background: '#f5f5f3',
          }}>
            <img src={designPreview} alt="Design" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {designFileName}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', margin: 0 }}>Uploaded</p>
          </div>
          <button
            onClick={onRemove}
            style={{
              width: 28,
              height: 28,
              border: 'none',
              background: 'rgba(17,17,17,0.06)',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Remove artwork"
          >
            <X size={14} color="#111" strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '20px 16px',
            border: `1px dashed ${isDragOver ? '#111' : 'rgba(17,17,17,0.2)'}`,
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
            background: isDragOver ? 'rgba(17,17,17,0.03)' : 'transparent',
          }}
          role="button"
          aria-label="Upload artwork"
          tabIndex={0}
        >
          <Upload size={20} color="rgba(0,0,0,0.35)" strokeWidth={1.5} style={{ marginBottom: 6 }} />
          <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', margin: 0 }}>
            Drag & drop or <span style={{ textDecoration: 'underline' }}>browse</span>
          </p>
          <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', margin: '4px 0 0' }}>PNG, JPG up to 10MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label="Upload artwork file"
      />

      {uploadError && (
        <p style={{ fontSize: 11, color: '#b41e1e', marginTop: 6 }}>{uploadError}</p>
      )}
    </div>
  );
}
