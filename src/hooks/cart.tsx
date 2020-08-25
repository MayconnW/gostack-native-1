import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMarketPlace:products');

      if (data) {
        setProducts([...JSON.parse(data)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    setProducts(data => {
      const dataArray = data.filter(item => item.id !== product.id);

      if (data.length === dataArray.length) {
        dataArray.push({ ...product, quantity: 1 });
        AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(dataArray),
        );
        return dataArray;
      }

      const result = data.map(item => ({
        ...item,
        quantity: item.id === product.id ? item.quantity + 1 : product.quantity,
      }));

      AsyncStorage.setItem('@GoMarketPlace:products', JSON.stringify(result));

      return result;
    });
  }, []);

  const increment = useCallback(async id => {
    setProducts(data => {
      const result = data.map(item => ({
        ...item,
        quantity: item.id === id ? item.quantity + 1 : item.quantity,
      }));

      AsyncStorage.setItem('@GoMarketPlace:products', JSON.stringify(result));

      return result;
    });
  }, []);

  const decrement = useCallback(async id => {
    setProducts(data => {
      const result = data.map(item => ({
        ...item,
        quantity: item.id === id ? item.quantity - 1 : item.quantity,
      }));

      AsyncStorage.setItem('@GoMarketPlace:products', JSON.stringify(result));

      return result;
    });
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
