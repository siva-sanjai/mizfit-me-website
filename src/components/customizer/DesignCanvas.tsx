import { useRef, useState, useEffect, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Group, Rect, Label, Text as KonvaLabelText } from 'react-konva';
import type Konva from 'konva';
import type { DesignItem, DesignImageObject, DesignTextObject, DesignState } from '@/types';
import { PRINT_AREAS } from '@/types';

interface DesignCanvasProps {
  activeSide: 'front' | 'back';
  objects: DesignItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, changes: Partial<DesignItem>) => void;
  onUpdateWithHistory: (id: string, changes: Partial<DesignItem>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
}

function normalizeValue(val: number, total: number): number {
  return total > 0 ? val / total : 0;
}

function denormalizeValue(norm: number, total: number): number {
  return norm * total;
}

function useImageLoader(src: string | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) { setImg(null); return; }
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => setImg(image);
    image.src = src;
    return () => { image.onload = null; };
  }, [src]);
  return img;
}

function DesignImage({
  obj,
  printAreaWidth,
  printAreaHeight,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: {
  obj: DesignImageObject;
  printAreaWidth: number;
  printAreaHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (x: number, y: number, width: number, height: number, rotation: number) => void;
}) {
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const image = useImageLoader(obj.sourceUrl);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const absX = denormalizeValue(obj.x, printAreaWidth) - (obj.width * printAreaWidth) / 2;
  const absY = denormalizeValue(obj.y, printAreaHeight) - (obj.height * printAreaHeight) / 2;
  const absW = obj.width * printAreaWidth;
  const absH = obj.height * printAreaHeight;

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image || undefined}
        x={absX}
        y={absY}
        width={absW}
        height={absH}
        rotation={obj.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          const newX = normalizeValue(e.target.x() + absW / 2, printAreaWidth);
          const newY = normalizeValue(e.target.y() + absH / 2, printAreaHeight);
          onDragEnd(newX, newY);
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const sx = node.scaleX();
          const sy = node.scaleY();
          const newW = Math.max(0.05, normalizeValue(node.width() * sx, printAreaWidth));
          const newH = Math.max(0.05, normalizeValue(node.height() * sy, printAreaHeight));
          const newX = normalizeValue(node.x() + (node.width() * sx) / 2, printAreaWidth);
          const newY = normalizeValue(node.y() + (node.height() * sy) / 2, printAreaHeight);
          node.scaleX(1);
          node.scaleY(1);
          onTransformEnd(newX, newY, newW, newH, node.rotation());
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          keepRatio
          boundBoxFunc={(_oldBox, newBox) => {
            if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) return _oldBox;
            return newBox;
          }}
          borderStroke="#111111"
          anchorStroke="#111111"
          anchorFill="#ffffff"
          anchorSize={9}
          rotateAnchorOffset={24}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotateEnabled
        />
      )}
    </>
  );
}

function DesignTextObj({
  obj,
  printAreaWidth,
  printAreaHeight,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  isMobile,
}: {
  obj: DesignTextObject;
  printAreaWidth: number;
  printAreaHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (x: number, y: number, width: number, height: number, rotation: number) => void;
  isMobile: boolean;
}) {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const absX = denormalizeValue(obj.x, printAreaWidth) - (obj.width * printAreaWidth) / 2;
  const absY = denormalizeValue(obj.y, printAreaHeight) - (obj.height * printAreaHeight) / 2;
  const absW = obj.width * printAreaWidth;
  const fontSize = obj.fontSize;

  return (
    <>
      <KonvaText
        ref={shapeRef}
        x={absX}
        y={absY}
        width={absW}
        text={obj.text}
        fontSize={fontSize}
        fontFamily={obj.fontFamily}
        fontStyle={obj.fontStyle as any}
        fill={obj.fill}
        align={obj.align as any}
        rotation={obj.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          const newX = normalizeValue(e.target.x() + absW / 2, printAreaWidth);
          const newY = normalizeValue(e.target.y() + (shapeRef.current?.height() || 0) / 2, printAreaHeight);
          onDragEnd(newX, newY);
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const sx = node.scaleX();
          const newW = Math.max(30, node.width() * sx);
          const normW = normalizeValue(newW, printAreaWidth);
          const newX = normalizeValue(node.x() + newW / 2, printAreaWidth);
          const newY = normalizeValue(node.y() + node.height() / 2, printAreaHeight);
          node.scaleX(1);
          node.scaleY(1);
          onTransformEnd(newX, newY, normW, obj.height, node.rotation());
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          keepRatio={false}
          boundBoxFunc={(_oldBox, newBox) => {
            if (Math.abs(newBox.width) < 30) return _oldBox;
            return newBox;
          }}
          borderStroke="#111111"
          anchorStroke="#111111"
          anchorFill="#ffffff"
          anchorSize={isMobile ? 14 : 9}
          rotateAnchorOffset={isMobile ? 32 : 24}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotateEnabled
        />
      )}
    </>
  );
}

export default function DesignCanvas({
  activeSide,
  objects,
  selectedId,
  onSelect,
  onUpdateWithHistory,
  containerRef,
  isMobile,
}: DesignCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });

  const printAreaConfig = PRINT_AREAS[activeSide];

  const printAreaWidth = dimensions.width * printAreaConfig.width;
  const printAreaHeight = dimensions.height * printAreaConfig.height;
  const printAreaX = dimensions.width * printAreaConfig.x;
  const printAreaY = dimensions.height * printAreaConfig.y;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  const sortedObjects = useMemo(() =>
    [...objects].sort((a, b) => a.zIndex - b.zIndex),
    [objects]
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
      }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            onSelect(null);
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) {
            onSelect(null);
          }
        }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Layer>
          <Group
            x={printAreaX}
            y={printAreaY}
            clipX={0}
            clipY={0}
            clipWidth={printAreaWidth}
            clipHeight={printAreaHeight}
          >
            {sortedObjects.map((obj) => {
              if (obj.side !== activeSide) return null;

              if (obj.type === 'image') {
                return (
                  <DesignImage
                    key={obj.id}
                    obj={obj as DesignImageObject}
                    printAreaWidth={printAreaWidth}
                    printAreaHeight={printAreaHeight}
                    isSelected={selectedId === obj.id}
                    onSelect={() => onSelect(obj.id)}
                    onDragEnd={(x, y) => onUpdateWithHistory(obj.id, { x, y })}
                    onTransformEnd={(x, y, w, h, r) =>
                      onUpdateWithHistory(obj.id, { x, y, width: w, height: h, rotation: r })
                    }
                  />
                );
              }

              if (obj.type === 'text') {
                return (
                  <DesignTextObj
                    key={obj.id}
                    obj={obj as DesignTextObject}
                    printAreaWidth={printAreaWidth}
                    printAreaHeight={printAreaHeight}
                    isSelected={selectedId === obj.id}
                    onSelect={() => onSelect(obj.id)}
                    onDragEnd={(x, y) => onUpdateWithHistory(obj.id, { x, y })}
                    onTransformEnd={(x, y, w, h, r) =>
                      onUpdateWithHistory(obj.id, { x, y, width: w, height: h, rotation: r })
                    }
                    isMobile={isMobile}
                  />
                );
              }

              return null;
            })}
          </Group>

          {selectedId && (
            <Group x={printAreaX} y={printAreaY}>
              <Rect
                x={0}
                y={0}
                width={printAreaWidth}
                height={printAreaHeight}
                stroke="rgba(17,17,17,0.25)"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
              <Label x={printAreaWidth / 2 - 30} y={-16}>
                <KonvaLabelText
                  text="PRINT AREA"
                  fontSize={7}
                  letterSpacing={1.6}
                  fill="rgba(17,17,17,0.35)"
                  fontFamily="Arial"
                  fontStyle="normal"
                />
              </Label>
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export function generatePreview(
  designs: DesignState,
  side: 'front' | 'back',
  shirtImage: HTMLImageElement,
  printAreaConfig: { x: number; y: number; width: number; height: number },
  shirtWidth: number,
  shirtHeight: number,
): Promise<string | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = shirtWidth;
    canvas.height = shirtHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { resolve(null); return; }

    ctx.drawImage(shirtImage, 0, 0, shirtWidth, shirtHeight);

    const pax = shirtWidth * printAreaConfig.x;
    const pay = shirtHeight * printAreaConfig.y;
    const paw = shirtWidth * printAreaConfig.width;
    const pah = shirtHeight * printAreaConfig.height;

    const sideData = designs[side];
    const sorted = [...sideData.objects].sort((a, b) => a.zIndex - b.zIndex);

    let pending = 0;
    let done = false;

    const checkDone = () => {
      if (!done && pending === 0) {
        done = true;
        resolve(canvas.toDataURL('image/png'));
      }
    };

    if (sorted.length === 0) {
      resolve(canvas.toDataURL('image/png'));
      return;
    }

    for (const obj of sorted) {
      if (obj.type === 'image') {
        const imgObj = obj as DesignImageObject;
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        pending++;
        img.onload = () => {
          const absW = imgObj.width * paw;
          const absH = imgObj.height * pah;
          const absX = pax + imgObj.x * paw - absW / 2;
          const absY = pay + imgObj.y * pah - absH / 2;

          ctx.save();
          ctx.translate(absX + absW / 2, absY + absH / 2);
          ctx.rotate((imgObj.rotation * Math.PI) / 180);
          ctx.drawImage(img, -absW / 2, -absH / 2, absW, absH);
          ctx.restore();
          pending--;
          checkDone();
        };
        img.onerror = () => { pending--; checkDone(); };
        img.src = imgObj.sourceUrl;
      } else if (obj.type === 'text') {
        const textObj = obj as DesignTextObject;
        const absW = textObj.width * paw;
        const absX = pax + textObj.x * paw - absW / 2;
        const absY = pay + textObj.y * pah;

        ctx.save();
        ctx.translate(absX + absW / 2, absY);
        ctx.rotate((textObj.rotation * Math.PI) / 180);
        ctx.font = `${textObj.fontStyle} ${textObj.fontSize}px ${textObj.fontFamily}`;
        ctx.fillStyle = textObj.fill;
        ctx.textAlign = textObj.align as CanvasTextAlign;
        ctx.textBaseline = 'top';

        const lines = textObj.text.split('\n');
        const lineHeight = textObj.fontSize * 1.2;
        const totalTextHeight = lines.length * lineHeight;
        const startY = -totalTextHeight / 2;

        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], -absW / 2, startY + i * lineHeight, absW);
        }
        ctx.restore();
      }
    }

    checkDone();
  });
}

export { denormalizeValue, normalizeValue };
