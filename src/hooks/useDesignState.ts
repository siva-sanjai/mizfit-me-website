import { useState, useCallback, useRef } from 'react';
import type { DesignState, DesignItem, DesignSide, DesignTextObject, DesignImageObject } from '@/types';

const MAX_HISTORY = 30;

const createEmptySide = (): DesignSide => ({ objects: [] });

const createEmptyDesign = (): DesignState => ({
  front: createEmptySide(),
  back: createEmptySide(),
});

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useDesignState() {
  const [designs, setDesigns] = useState<DesignState>(createEmptyDesign);
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const historyRef = useRef<DesignState[]>([createEmptyDesign()]);
  const historyIndexRef = useRef(0);

  const pushHistory = useCallback((state: DesignState) => {
    const hist = historyRef.current;
    const idx = historyIndexRef.current;
    const next = hist.slice(0, idx + 1);
    next.push(JSON.parse(JSON.stringify(state)));
    if (next.length > MAX_HISTORY) next.shift();
    historyRef.current = next;
    historyIndexRef.current = next.length - 1;
  }, []);

  const updateDesign = useCallback((updater: (prev: DesignState) => DesignState, recordHistory = true) => {
    setDesigns(prev => {
      const next = updater(prev);
      if (recordHistory) pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const addImageObject = useCallback((obj: Omit<DesignImageObject, 'id' | 'zIndex'>) => {
    let newId = '';
    updateDesign(prev => {
      const side = prev[activeSide];
      const maxZ = side.objects.reduce((m, o) => Math.max(m, o.zIndex), 0);
      newId = generateId();
      const newItem: DesignImageObject = { ...obj, id: newId, zIndex: maxZ + 1 };
      return {
        ...prev,
        [activeSide]: { objects: [...side.objects, newItem] },
      };
    });
    return newId;
  }, [activeSide, updateDesign]);

  const addTextObject = useCallback((text: string, options?: Partial<Pick<DesignTextObject, 'fontSize' | 'fill' | 'fontFamily' | 'fontStyle' | 'align'>>) => {
    let id = '';
    updateDesign(prev => {
      const side = prev[activeSide];
      const maxZ = side.objects.reduce((m, o) => Math.max(m, o.zIndex), 0);
      id = generateId();
      const newItem: DesignTextObject = {
        id,
        type: 'text',
        side: activeSide,
        x: 0.5,
        y: 0.5,
        width: 0.5,
        height: 0.1,
        rotation: 0,
        zIndex: maxZ + 1,
        text,
        fontSize: options?.fontSize ?? 28,
        fontFamily: options?.fontFamily ?? 'Arial',
        fill: options?.fill ?? '#111111',
        fontStyle: options?.fontStyle ?? 'normal',
        align: options?.align ?? 'center',
        naturalWidth: 0,
        naturalHeight: 0,
      };
      return {
        ...prev,
        [activeSide]: { objects: [...side.objects, newItem] },
      };
    });
    return id;
  }, [activeSide, updateDesign]);

  const updateObject = useCallback((id: string, changes: Partial<DesignItem>) => {
    updateDesign(prev => {
      const side = prev[activeSide];
      return {
        ...prev,
        [activeSide]: {
          objects: side.objects.map(o => o.id === id ? { ...o, ...changes } : o),
        },
      };
    }, false);
  }, [activeSide, updateDesign]);

  const updateObjectWithHistory = useCallback((id: string, changes: Partial<DesignItem>) => {
    updateDesign(prev => {
      const side = prev[activeSide];
      return {
        ...prev,
        [activeSide]: {
          objects: side.objects.map(o => o.id === id ? { ...o, ...changes } : o),
        },
      };
    });
  }, [activeSide, updateDesign]);

  const removeObject = useCallback((id: string) => {
    updateDesign(prev => {
      const side = prev[activeSide];
      return {
        ...prev,
        [activeSide]: {
          objects: side.objects.filter(o => o.id !== id),
        },
      };
    });
    setSelectedId(null);
  }, [activeSide, updateDesign]);

  const duplicateObject = useCallback((id: string) => {
    updateDesign(prev => {
      const side = prev[activeSide];
      const obj = side.objects.find(o => o.id === id);
      if (!obj) return prev;
      const maxZ = side.objects.reduce((m, o) => Math.max(m, o.zIndex), 0);
      const clone = {
        ...JSON.parse(JSON.stringify(obj)),
        id: generateId(),
        x: Math.min(obj.x + 0.05, 0.9),
        y: Math.min(obj.y + 0.05, 0.9),
        zIndex: maxZ + 1,
      };
      return {
        ...prev,
        [activeSide]: { objects: [...side.objects, clone] },
      };
    });
  }, [activeSide, updateDesign]);

  const centerObject = useCallback((id: string) => {
    updateDesign(prev => {
      const side = prev[activeSide];
      return {
        ...prev,
        [activeSide]: {
          objects: side.objects.map(o => o.id === id ? { ...o, x: 0.5, y: 0.5 } : o),
        },
      };
    });
  }, [activeSide, updateDesign]);

  const moveObjectUp = useCallback((id: string) => {
    updateDesign(prev => {
      const side = prev[activeSide];
      const sorted = [...side.objects].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(o => o.id === id);
      if (idx < sorted.length - 1) {
        const temp = sorted[idx].zIndex;
        sorted[idx] = { ...sorted[idx], zIndex: sorted[idx + 1].zIndex };
        sorted[idx + 1] = { ...sorted[idx + 1], zIndex: temp };
      }
      return { ...prev, [activeSide]: { objects: sorted } };
    });
  }, [activeSide, updateDesign]);

  const moveObjectDown = useCallback((id: string) => {
    updateDesign(prev => {
      const side = prev[activeSide];
      const sorted = [...side.objects].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(o => o.id === id);
      if (idx > 0) {
        const temp = sorted[idx].zIndex;
        sorted[idx] = { ...sorted[idx], zIndex: sorted[idx - 1].zIndex };
        sorted[idx - 1] = { ...sorted[idx - 1], zIndex: temp };
      }
      return { ...prev, [activeSide]: { objects: sorted } };
    });
  }, [activeSide, updateDesign]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      setDesigns(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
      setSelectedId(null);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      setDesigns(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
      setSelectedId(null);
    }
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const activeObjects = designs[activeSide].objects;

  return {
    designs,
    activeSide,
    setActiveSide,
    selectedId,
    setSelectedId,
    activeObjects,
    addImageObject,
    addTextObject,
    updateObject,
    updateObjectWithHistory,
    removeObject,
    duplicateObject,
    centerObject,
    moveObjectUp,
    moveObjectDown,
    undo,
    redo,
    canUndo,
    canRedo,
    setDesigns,
  };
}
