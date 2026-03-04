import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../api/client';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    (async () => {
      const all = [];
      let page = 1;
      let lastPage = 1;

      try {
        while (page <= lastPage) {
          const data = await api.getFavorites(token, page);
          const items = data.data || [];
          all.push(...items);
          lastPage = data.meta?.last_page ?? data.last_page ?? 1;
          page++;
        }
      } catch {
      }

      setFavorites(all);
      setIsLoading(false);
    })();
  }, [token]);

  const favoriteProductIds = useMemo(
    () => new Set(favorites.map((f) => f.product?.id ?? f.product_id)),
    [favorites],
  );

  const isFavorite = useCallback(
    (productId) => favoriteProductIds.has(productId),
    [favoriteProductIds],
  );

  const toggleFavorite = useCallback(
    async (product) => {
      const productId = product.id;
      const existing = favorites.find((f) => (f.product?.id ?? f.product_id) === productId);

      if (existing) {
        setFavorites((prev) => prev.filter((item) => item.id !== existing.id));

        try {
          await api.removeFavorite(token, existing.id);
        } catch {
          setFavorites((prev) => [...prev, existing]);
        }
      } else {
        const tempId = `temp_${productId}_${Date.now()}`;
        const optimistic = { id: tempId, product_id: productId, product };
        setFavorites((prev) => [...prev, optimistic]);

        try {
          const data = await api.addFavorite(token, productId);
          const apiRecord = data.data || data;
          setFavorites((prev) => prev.map((item) =>
            item.id === tempId
              ? { ...optimistic, ...apiRecord, product_id: productId, product }
              : item,
          ));
        } catch {
          setFavorites((prev) => prev.filter((item) => item.id !== tempId));
        }
      }
    },
    [favorites, token],
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isLoading, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
