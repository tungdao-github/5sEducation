import { createContext, useContext, useState, ReactNode } from 'react';
import { Course } from './CartContext';

interface WishlistContextType {
  wishlistItems: Course[];
  addToWishlist: (course: Course) => void;
  removeFromWishlist: (courseId: string) => void;
  isInWishlist: (courseId: string) => boolean;
  toggleWishlist: (course: Course) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Course[]>(() => {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  });

  const save = (items: Course[]) => {
    setWishlistItems(items);
    localStorage.setItem('wishlist', JSON.stringify(items));
  };

  const addToWishlist = (course: Course) => {
    if (!wishlistItems.find(i => i.id === course.id)) {
      save([...wishlistItems, course]);
    }
  };

  const removeFromWishlist = (courseId: string) => {
    save(wishlistItems.filter(i => i.id !== courseId));
  };

  const isInWishlist = (courseId: string) => wishlistItems.some(i => i.id === courseId);

  const toggleWishlist = (course: Course) => {
    if (isInWishlist(course.id)) removeFromWishlist(course.id);
    else addToWishlist(course);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
