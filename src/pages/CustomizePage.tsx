import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '@/services/products';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE, PRINT_AREAS } from '@/types';
import type { Product, DesignImageObject } from '@/types';
import { formatPrice, generateId } from '@/utils/helpers';
import { addToCart } from '@/utils/cart';
import { useDesignState } from '@/hooks/useDesignState';
import DesignCanvas, { generatePreview } from '@/components/customizer/DesignCanvas';
import SideToggle from '@/components/customizer/SideToggle';
import EditorToolbar from '@/components/customizer/EditorToolbar';
import ArtworkUploader from '@/components/customizer/ArtworkUploader';
import TextEditorPanel from '@/components/customizer/TextEditorPanel';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const DEFAULT_TEE_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80';

export default function CustomizePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pageLoaded, setPageLoaded] = useState(false);

  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [designFileName, setDesignFileName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newText, setNewText] = useState('');

  const [isMobile, setIsMobile] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useDesignState();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPageLoaded(true), 50);
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const productId = searchParams.get('productId');
    const color = searchParams.get('color');
    const size = searchParams.get('size');

    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        if (color && product.available_colors.includes(color)) setSelectedColor(color);
        else if (product.available_colors.length > 0) setSelectedColor(product.available_colors[0]);
        if (size && product.available_sizes.includes(size)) setSelectedSize(size);
        else if (product.available_sizes.length > 0) setSelectedSize(product.available_sizes[0]);
        return;
      }
    }

    setSelectedProduct(products[0]);
    if (products[0].available_colors.length > 0) setSelectedColor(products[0].available_colors[0]);
    if (products[0].available_sizes.length > 0) setSelectedSize(products[0].available_sizes[0]);
  }, [products, searchParams]);

  const handleProductChange = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setSelectedColor(product.available_colors[0] || '');
      setSelectedSize(product.available_sizes[0] || '');
    }
  }, [products]);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Unsupported file type. Use PNG or JPG.';
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      return 'File too large. Maximum 10MB.';
    }
    return null;
  }, []);

  const processFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }
    setUploadError(null);
    setDesignFile(file);
    setDesignFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setDesignPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [validateFile]);

  useEffect(() => {
    if (!designPreview) return;
    const img = new window.Image();
    img.onload = () => {
      const printConfig = PRINT_AREAS[activeSide];
      const container = previewContainerRef.current;
      if (!container) return;

      const containerW = container.offsetWidth;
      const containerH = container.offsetHeight;
      const paw = containerW * printConfig.width;
      const pah = containerH * printConfig.height;

      const maxW = paw * 0.65;
      const maxH = pah * 0.65;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);

      const widthNorm = (img.naturalWidth * scale) / paw;
      const heightNorm = (img.naturalHeight * scale) / pah;

      addImageObject({
        type: 'image',
        side: activeSide,
        sourceUrl: designPreview,
        originalFileUrl: designPreview,
        fileName: designFileName,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        x: 0.5,
        y: 0.5,
        width: widthNorm,
        height: heightNorm,
        rotation: 0,
      });
    };
    img.src = designPreview;
  }, [designPreview, activeSide, designFileName]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleRemoveDesign = useCallback(() => {
    setDesignFile(null);
    setDesignPreview(null);
    setDesignFileName('');
  }, []);

  const handleAddText = useCallback(() => {
    if (!newText.trim()) return;
    addTextObject(newText.trim());
    setNewText('');
  }, [newText, addTextObject]);

  const selectedObject = useMemo(() => {
    if (!selectedId) return null;
    return activeObjects.find(o => o.id === selectedId) || null;
  }, [selectedId, activeObjects]);

  const handleResetObject = useCallback(() => {
    if (!selectedObject) return;
    if (selectedObject.type === 'image') {
      const img = new window.Image();
      img.onload = () => {
        const printConfig = PRINT_AREAS[activeSide];
        const container = previewContainerRef.current;
        if (!container) return;
        const paw = container.offsetWidth * printConfig.width;
        const pah = container.offsetHeight * printConfig.height;
        const maxW = paw * 0.65;
        const maxH = pah * 0.65;
        const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
        updateObjectWithHistory(selectedObject.id, {
          x: 0.5,
          y: 0.5,
          width: (img.naturalWidth * scale) / paw,
          height: (img.naturalHeight * scale) / pah,
          rotation: 0,
        });
      };
      img.src = (selectedObject as DesignImageObject).sourceUrl;
    } else {
      updateObjectWithHistory(selectedObject.id, {
        x: 0.5,
        y: 0.5,
        rotation: 0,
        fontSize: 28,
      });
    }
  }, [selectedObject, activeSide, updateObjectWithHistory]);

  const handleAddToCart = useCallback(async () => {
    if (!selectedProduct || !selectedColor || !selectedSize) return;

    const frontPreview = await generatePreview(
      designs, 'front',
      (() => { const img = new window.Image(); img.src = selectedProduct.images?.[0] || DEFAULT_TEE_IMAGE; return img; })(),
      PRINT_AREAS.front, 400, 500
    );
    const backPreview = await generatePreview(
      designs, 'back',
      (() => { const img = new window.Image(); img.src = selectedProduct.images?.[0] || DEFAULT_TEE_IMAGE; return img; })(),
      PRINT_AREAS.back, 400, 500
    );

    const cartItem = {
      id: generateId(),
      product: selectedProduct,
      color: selectedColor,
      size: selectedSize,
      quantity,
      printSide: activeSide,
      designPreview: frontPreview || backPreview || designPreview || null,
      designFile: designFile || null,
      designFileName: designFileName || '',
      customText: '',
      itemPrice: selectedProduct.base_price,
      frontDesign: designs.front.objects.length > 0 ? designs.front.objects : undefined,
      backDesign: designs.back.objects.length > 0 ? designs.back.objects : undefined,
      frontPreviewUrl: frontPreview,
      backPreviewUrl: backPreview,
    } as import('@/types').CartItem;

    addToCart(cartItem);
    navigate('/cart');
  }, [selectedProduct, selectedColor, selectedSize, quantity, activeSide, designs, designPreview, designFile, designFileName, navigate]);

  const canAddToCart = selectedProduct && selectedColor && selectedSize;
  const totalPrice = selectedProduct ? selectedProduct.base_price * quantity : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '0 16px' }}>
        <p style={{ color: 'rgba(0,0,0,0.55)', marginBottom: 16 }}>No products available for customization.</p>
        <button onClick={() => navigate('/shop')} style={{ padding: '10px 24px', background: '#111', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .cl-page { background: #f5f5f2; min-height: 100vh; padding-top: 120px; padding-bottom: 100px; }
        .cl-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(360px, 0.85fr); gap: clamp(24px, 3vw, 48px); align-items: start; width: 100%; }
        .cl-preview-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1; max-height: 720px; background: radial-gradient(circle at center, rgba(255,255,255,0.9), rgba(230,230,225,0.7)); border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .cl-preview-img { width: min(72%, 560px); height: auto; object-fit: contain; filter: drop-shadow(0 28px 35px rgba(0,0,0,0.08)); position: relative; z-index: 1; }
        .cl-panel { background: #ffffff; border-radius: 18px; padding: clamp(24px, 2.5vw, 36px); border: 1px solid rgba(0,0,0,0.08); position: sticky; top: 110px; }
        .cl-panel-header { padding-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,0.1); }
        .cl-panel-label { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(0,0,0,0.6); }
        .cl-panel-title { font-size: clamp(26px, 2.5vw, 38px); font-weight: 650; letter-spacing: -0.04em; line-height: 1.05; color: #0a0a0a; margin-top: 8px; }
        .cl-panel-price { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.55); margin-top: 10px; }
        .cl-section { padding: 24px 0; border-bottom: 1px solid rgba(0,0,0,0.09); }
        .cl-section:last-of-type { border-bottom: none; }
        .cl-section-label { font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(0,0,0,0.42); margin-bottom: 14px; }
        .cl-tee-selector { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .cl-tee-selector::-webkit-scrollbar { display: none; }
        .cl-tee-opt { flex-shrink: 0; width: 64px; height: 76px; background: #f1f1ee; border-radius: 8px; overflow: hidden; border: 1px solid transparent; cursor: pointer; transition: border-color 0.25s ease; padding: 0; }
        .cl-tee-opt.selected { border-color: #111111; }
        .cl-tee-opt img { width: 100%; height: 100%; object-fit: cover; }
        .cl-tee-info { margin-top: 10px; font-size: 11px; line-height: 1.4; }
        .cl-tee-info strong { font-weight: 600; color: #0a0a0a; }
        .cl-tee-info span { color: rgba(0,0,0,0.5); }
        .cl-swatches { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; }
        .cl-swatch { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 1px solid rgba(0,0,0,0.1); padding: 0; transition: outline 0.2s ease, outline-offset 0.2s ease; }
        .cl-swatch.selected { outline: 1px solid #111111; outline-offset: 4px; }
        .cl-color-name { font-size: 11px; font-weight: 600; color: #0a0a0a; margin-top: 10px; }
        .cl-sizes { display: flex; flex-wrap: wrap; gap: 6px; }
        .cl-size-btn { min-width: 46px; height: 42px; border: 1px solid rgba(0,0,0,0.16); background: transparent; border-radius: 6px; font-size: 11px; font-weight: 600; color: #0a0a0a; cursor: pointer; padding: 0 12px; transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
        .cl-size-btn:hover { border-color: #111111; }
        .cl-size-btn.selected { background: #111111; color: #ffffff; border-color: #111111; }
        .cl-size-btn.disabled { opacity: 0.3; cursor: not-allowed; text-decoration: line-through; }
        .cl-qty { display: inline-grid; grid-template-columns: 42px 54px 42px; height: 42px; border: 1px solid rgba(0,0,0,0.14); border-radius: 8px; overflow: hidden; }
        .cl-qty-btn { background: transparent; border: none; cursor: pointer; font-size: 15px; font-weight: 500; color: #0a0a0a; display: flex; align-items: center; justify-content: center; transition: background 0.2s ease; }
        .cl-qty-btn:hover { background: rgba(0,0,0,0.04); }
        .cl-qty-btn:disabled { opacity: 0.25; cursor: not-allowed; }
        .cl-qty-val { display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; border-left: 1px solid rgba(0,0,0,0.08); border-right: 1px solid rgba(0,0,0,0.08); }
        .cl-add-btn { width: 100%; height: 56px; background: #111111; color: #ffffff; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 20px; cursor: pointer; transition: background 0.25s ease; }
        .cl-add-btn:hover { background: #282828; }
        .cl-add-btn:disabled { background: #ccc; cursor: not-allowed; }
        .cl-summary { display: flex; flex-direction: column; gap: 10px; }
        .cl-summary-row { display: flex; justify-content: space-between; align-items: center; }
        .cl-summary-label { font-size: 9px; letter-spacing: 0.12em; color: rgba(0,0,0,0.42); text-transform: uppercase; }
        .cl-summary-value { font-size: 11px; font-weight: 600; color: #0a0a0a; text-align: right; }
        .cl-total-area { padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.09); margin-top: 20px; }
        .cl-total-row { display: flex; justify-content: space-between; align-items: baseline; }
        .cl-total-label { font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(0,0,0,0.45); }
        .cl-total-price { font-size: 30px; font-weight: 700; letter-spacing: -0.04em; color: #0a0a0a; }
        .cl-status { position: absolute; bottom: 16px; left: 16px; z-index: 10; font-size: 9px; font-weight: 600; letter-spacing: 0.14em; display: flex; align-items: center; gap: 6px; }
        .cl-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22a060; }
        .cl-add-text-row { display: flex; gap: 8px; }
        .cl-add-text-input { flex: 1; padding: 10px 12px; font-size: 13px; border: 1px solid rgba(0,0,0,0.15); border-radius: 6px; background: transparent; outline: none; font-family: inherit; }
        .cl-add-text-input:focus { border-color: #111111; }
        .cl-add-text-input::placeholder { color: rgba(0,0,0,0.3); }
        .cl-add-text-btn { padding: 10px 16px; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
        .cl-add-text-btn:hover { background: #282828; }
        .cl-mobile-bar { display: none; }
        .cl-fade-in { opacity: 0; transform: translateY(24px); animation: clFadeUp 0.6s ease forwards; }
        .cl-fade-in.d1 { animation-delay: 100ms; }
        .cl-fade-in.d2 { animation-delay: 180ms; }
        @keyframes clFadeUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1023px) { .cl-grid { grid-template-columns: 1fr; } .cl-panel { position: static; width: 100%; } .cl-page { padding-top: 90px; padding-bottom: 120px; } }
        @media (max-width: 767px) {
          .cl-preview-wrap { aspect-ratio: 1 / 1.08; border-radius: 14px; }
          .cl-preview-img { width: 82%; }
          .cl-panel { background: transparent; border: none; border-radius: 0; padding: 0; }
          .cl-panel-header { border-bottom-color: rgba(0,0,0,0.09); padding-bottom: 18px; }
          .cl-panel-title { font-size: 24px; }
          .cl-section { padding: 20px 0; }
          .cl-swatches { gap: 10px; }
          .cl-swatch { width: 26px; height: 26px; }
          .cl-swatch.selected { outline-offset: 3px; }
          .cl-sizes { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
          .cl-size-btn { width: 100%; min-width: 0; padding: 0; height: 38px; }
          .cl-qty { grid-template-columns: 38px 46px 38px; height: 38px; }
          .cl-mobile-bar { display: flex; position: fixed; left: 10px; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); z-index: 900; height: 64px; background: rgba(17,17,17,0.96); backdrop-filter: blur(12px); border-radius: 12px; padding: 8px 8px 8px 18px; align-items: center; justify-content: space-between; }
          .cl-mob-total-label { font-size: 8px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
          .cl-mob-total-price { font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.03em; }
          .cl-mob-add-btn { height: 48px; padding: 0 20px; background: #ffffff; color: #111111; border: none; border-radius: 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
          .cl-mob-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .cl-total-area { display: none; }
          .cl-add-btn { display: none; }
        }
        @media (max-width: 419px) { .cl-sizes { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 359px) { .cl-swatch { width: 22px; height: 22px; } .cl-swatch.selected { outline-offset: 2px; } .cl-tee-opt { width: 56px; height: 68px; } }
        @media (prefers-reduced-motion: reduce) { .cl-fade-in { opacity: 1; transform: none; animation: none; } }
      `}</style>

      <div className="cl-page">
        <div className="mizfit-container">
          <div className="cl-grid">
            {/* LEFT — PREVIEW */}
            <div className={pageLoaded ? 'cl-fade-in d1' : ''}>
              <div className="cl-preview-wrap" ref={previewContainerRef}>
                <img
                  src={selectedProduct?.images?.[0] || DEFAULT_TEE_IMAGE}
                  alt="T-shirt preview"
                  className="cl-preview-img"
                  draggable={false}
                />
                <SideToggle activeSide={activeSide} onToggle={setActiveSide} />
                <DesignCanvas
                  activeSide={activeSide}
                  objects={activeObjects}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onUpdate={updateObject}
                  onUpdateWithHistory={updateObjectWithHistory}
                  containerRef={previewContainerRef}
                  isMobile={isMobile}
                />
                <div className="cl-status" style={{ color: activeObjects.length > 0 ? '#22a060' : 'rgba(0,0,0,0.35)' }}>
                  {activeObjects.length > 0 && <span className="cl-status-dot" />}
                  {activeObjects.length > 0 ? 'DESIGN ACTIVE' : 'READY FOR YOUR DESIGN'}
                </div>
              </div>

              {/* Mobile Editor Toolbar */}
              {isMobile && (
                <EditorToolbar
                  selectedObject={selectedObject}
                  onCenter={() => selectedId && centerObject(selectedId)}
                  onDuplicate={() => selectedId && duplicateObject(selectedId)}
                  onDelete={() => selectedId && removeObject(selectedId)}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onMoveUp={() => selectedId && moveObjectUp(selectedId)}
                  onMoveDown={() => selectedId && moveObjectDown(selectedId)}
                  onReset={handleResetObject}
                  isMobile={isMobile}
                />
              )}

              {/* Desktop Editor Toolbar */}
              {!isMobile && (
                <EditorToolbar
                  selectedObject={selectedObject}
                  onCenter={() => selectedId && centerObject(selectedId)}
                  onDuplicate={() => selectedId && duplicateObject(selectedId)}
                  onDelete={() => selectedId && removeObject(selectedId)}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onMoveUp={() => selectedId && moveObjectUp(selectedId)}
                  onMoveDown={() => selectedId && moveObjectDown(selectedId)}
                  onReset={handleResetObject}
                  isMobile={isMobile}
                />
              )}
            </div>

            {/* RIGHT — CONFIGURATION */}
            <div className={pageLoaded ? 'cl-fade-in d2' : ''}>
              <div className="cl-panel">
                <div className="cl-panel-header">
                  <p className="cl-panel-label">Customize Your Tee</p>
                  <h2 className="cl-panel-title">{selectedProduct?.name || 'Select a tee'}</h2>
                  <p className="cl-panel-price">{selectedProduct ? formatPrice(selectedProduct.base_price) : ''}</p>
                </div>

                {/* 01 — SELECT TEE */}
                <div className="cl-section">
                  <p className="cl-section-label">01 — Select Tee</p>
                  <div className="cl-tee-selector">
                    {products.slice(0, 6).map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleProductChange(product.id)}
                        className={`cl-tee-opt${selectedProduct?.id === product.id ? ' selected' : ''}`}
                        aria-pressed={selectedProduct?.id === product.id}
                      >
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#e5e5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#999' }}>
                            {product.name?.slice(0, 2)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedProduct && (
                    <div className="cl-tee-info">
                      <strong>{selectedColor}</strong>
                      <span> &middot; {selectedProduct.material} &middot; {selectedProduct.fit_type}</span>
                    </div>
                  )}
                </div>

                {/* 02 — COLOR */}
                <div className="cl-section">
                  <p className="cl-section-label">02 — Color</p>
                  {selectedProduct && selectedProduct.available_colors.length > 0 ? (
                    <>
                      <div className="cl-swatches">
                        {selectedProduct.available_colors.map(color => {
                          const colorMap: Record<string, string> = {
                            'White': '#ffffff', 'Optic White': '#f5f5f5', 'Black': '#1a1a1a', 'Carbon Black': '#0d0d0d',
                            'Navy': '#1e3a5f', 'Navy Blue': '#1e3a5f', 'Gray': '#b0b0b0', 'Heather Grey': '#b0b0b0',
                            'Olive': '#7a8a6e', 'Olive Sage': '#7a8a6e', 'Burgundy': '#6e2c2c', 'Bone': '#e8dcc8',
                            'Washed Brown': '#8b7355', 'Sand Beige': '#d4c5a9', 'Forest Green': '#2d5a27',
                          };
                          return (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`cl-swatch${selectedColor === color ? ' selected' : ''}`}
                              style={{ backgroundColor: colorMap[color] || color }}
                              aria-label={color}
                              title={color}
                            />
                          );
                        })}
                      </div>
                      <p className="cl-color-name">{selectedColor}</p>
                    </>
                  ) : (
                    <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>No color options available</p>
                  )}
                </div>

                {/* 03 — SIZE */}
                <div className="cl-section">
                  <p className="cl-section-label">03 — Size</p>
                  {selectedProduct ? (
                    <div className="cl-sizes">
                      {SIZES.map(size => {
                        const available = selectedProduct.available_sizes.includes(size);
                        return (
                          <button
                            key={size}
                            disabled={!available}
                            onClick={() => setSelectedSize(size)}
                            className={`cl-size-btn${selectedSize === size && available ? ' selected' : ''}${!available ? ' disabled' : ''}`}
                            aria-pressed={selectedSize === size}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Select a base tee first</p>
                  )}
                </div>

                {/* 04 — QUANTITY */}
                <div className="cl-section">
                  <p className="cl-section-label">04 — Quantity</p>
                  <div className="cl-qty">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="cl-qty-btn">−</button>
                    <span className="cl-qty-val">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(99, quantity + 1))} disabled={quantity >= 99} className="cl-qty-btn">+</button>
                  </div>
                </div>

                {/* 05 — UPLOAD ARTWORK */}
                <div className="cl-section">
                  <p className="cl-section-label">05 — Upload Artwork</p>
                  <ArtworkUploader
                    designFileName={designFileName}
                    designPreview={designPreview}
                    isDragOver={isDragOver}
                    uploadError={uploadError}
                    onFileSelect={processFile}
                    onRemove={handleRemoveDesign}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  />
                </div>

                {/* 06 — ADD TEXT */}
                <div className="cl-section">
                  <p className="cl-section-label">06 — Add Text</p>
                  <div className="cl-add-text-row">
                    <input
                      type="text"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value.slice(0, 40))}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddText(); }}
                      placeholder="TYPE YOUR TEXT"
                      maxLength={40}
                      className="cl-add-text-input"
                    />
                    <button onClick={handleAddText} className="cl-add-text-btn" disabled={!newText.trim()}>
                      ADD
                    </button>
                  </div>
                  <p style={{ fontSize: 9, color: 'rgba(0,0,0,0.35)', marginTop: 6 }}>{newText.length}/40</p>
                </div>

                {/* 07 — DESIGN TOOLS */}
                <div className="cl-section">
                  <p className="cl-section-label">07 — Design Tools</p>
                  {selectedObject ? (
                    selectedObject.type === 'text' ? (
                      <TextEditorPanel
                        textObject={selectedObject as any}
                        onUpdate={(changes) => updateObject(selectedObject.id, changes)}
                        onUpdateWithHistory={(changes) => updateObjectWithHistory(selectedObject.id, changes)}
                      />
                    ) : (
                      <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
                        Use the handles to resize, rotate, or drag the artwork.
                      </p>
                    )
                  ) : (
                    <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
                      Select an artwork or text object to edit.
                    </p>
                  )}
                </div>

                {/* ORDER SUMMARY */}
                <div className="cl-section" style={{ borderBottom: 'none' }}>
                  <p className="cl-section-label">Order Summary</p>
                  <div className="cl-summary">
                    <div className="cl-summary-row">
                      <span className="cl-summary-label">Tee</span>
                      <span className="cl-summary-value">{selectedProduct?.name || '—'}</span>
                    </div>
                    <div className="cl-summary-row">
                      <span className="cl-summary-label">Color</span>
                      <span className="cl-summary-value">{selectedColor || '—'}</span>
                    </div>
                    <div className="cl-summary-row">
                      <span className="cl-summary-label">Size</span>
                      <span className="cl-summary-value">{selectedSize || '—'}</span>
                    </div>
                    <div className="cl-summary-row">
                      <span className="cl-summary-label">Sides</span>
                      <span className="cl-summary-value">
                        {designs.front.objects.length > 0 && designs.back.objects.length > 0
                          ? 'Front + Back'
                          : designs.front.objects.length > 0
                          ? 'Front'
                          : designs.back.objects.length > 0
                          ? 'Back'
                          : '—'}
                      </span>
                    </div>
                    <div className="cl-summary-row">
                      <span className="cl-summary-label">Qty</span>
                      <span className="cl-summary-value">{quantity}</span>
                    </div>
                  </div>
                </div>

                {/* TOTAL + ADD TO CART (desktop) */}
                <div className="cl-total-area">
                  <div className="cl-total-row">
                    <span className="cl-total-label">Total</span>
                    <span className="cl-total-price">{formatPrice(totalPrice)}</span>
                  </div>
                  <button onClick={handleAddToCart} disabled={!canAddToCart} className="cl-add-btn">
                    ADD CUSTOM TEE — {formatPrice(totalPrice)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE STICKY BAR */}
        <div className="cl-mobile-bar">
          <div>
            <p className="cl-mob-total-label">Total</p>
            <p className="cl-mob-total-price">{formatPrice(totalPrice)}</p>
          </div>
          <button onClick={handleAddToCart} disabled={!canAddToCart} className="cl-mob-add-btn">
            ADD TO CART
          </button>
        </div>
      </div>
    </>
  );
}
