import { createContext, useContext, useState, ReactNode } from 'react';

export interface Course {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  instructor: string;
  duration: string;
  level: string;
  lessons: number;
  students: number;
  rating: number;
  category: string;
  description: string;
  learningOutcomes: string[];
  curriculum: {
    title: string;
    lessons: number;
    duration: string;
  }[];
}

interface CartContextType {
  cartItems: Course[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<Course[]>([]);

  const addToCart = (course: Course) => {
    setCartItems((prev) => {
      if (!prev.find((item) => item.id === course.id)) {
        return [...prev, course];
      }
      return prev;
    });
  };

  const removeFromCart = (courseId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== courseId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (courseId: string) => {
    return cartItems.some((item) => item.id === courseId);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
