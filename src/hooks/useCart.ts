import { useState, useCallback, useEffect } from 'react';
import type { CartItem } from '@/types';
import { getCart, saveCart, removeFromCart as removeItem, updateCartItemQuantity as updateQuantity, clearCart as clearItems, getCartTotal, getCartCount } from '@/utils/cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  const refresh = useCallback(() => {
    const cartItems = getCart();
    setItems(cartItems);
    setCount(getCartCount());
    setTotal(getCartTotal());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback((item: CartItem) => {
    const cart = getCart();
    cart.push(item);
    saveCart(cart);
    refresh();
  }, [refresh]);

  const removeItemById = useCallback((id: string) => {
    removeItem(id);
    refresh();
  }, [refresh]);

  const updateQuantityById = useCallback((id: string, qty: number) => {
    updateQuantity(id, qty);
    refresh();
  }, [refresh]);

  const clear = useCallback(() => {
    clearItems();
    refresh();
  }, [refresh]);

  return { items, count, total, addItem, removeItem: removeItemById, updateQuantity: updateQuantityById, clear, refresh };
}
