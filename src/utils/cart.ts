import type { CartItem } from '@/types';

const CART_KEY = 'mizfit_cart';

export function getCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  cart.push(item);
  saveCart(cart);
}

export function removeFromCart(itemId: string): void {
  const cart = getCart().filter(item => item.id !== itemId);
  saveCart(cart);
}

export function updateCartItemQuantity(itemId: string, quantity: number): void {
  const cart = getCart().map(item =>
    item.id === itemId ? { ...item, quantity } : item
  );
  saveCart(cart);
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
