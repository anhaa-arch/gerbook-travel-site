import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { ShoppingCart, CheckCircle2 } from "lucide-react"

export type CartItemType = "PRODUCT" | "CAMP" | "TRAVEL";

export interface CartItem {
  id: string; // Using string globally
  type: CartItemType;
  name: string;
  seller?: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  // For Camps/Travel
  startDate?: string;
  endDate?: string;
  guests?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (clientId: string) => void;
  updateQuantity: (clientId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("malchin_cart")
    if (stored) {
      try {
        setCartItems(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse cart storage", e);
      }
    }
    setIsLoaded(true);
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("malchin_cart", JSON.stringify(cartItems))
    }
  }, [cartItems, isLoaded])

  // Get unique client ID for items (especially camps with dates)
  const getClientId = (item: CartItem) => {
    if (item.type === "CAMP" || item.type === "TRAVEL") {
      return `${item.id}-${item.startDate}-${item.endDate}`;
    }
    return item.id;
  };

  const addToCart = useCallback((item: CartItem) => {
    // Standardize type to uppercase
    const type = item.type.toUpperCase() as CartItemType;

    // Requirements: Camps and Travels should NOT be added to cart
    if (type === "CAMP" || type === "TRAVEL") {
      console.warn(`Attempted to add ${type} to cart. This is now disabled in favor of direct booking.`);
      return;
    }

    console.log(`🛒 Adding to cart: ${item.name} (${type})`);

    setCartItems((prev) => {
      const clientId = getClientId(item);
      const existingIndex = prev.findIndex((i) => {
        const existingClientId = getClientId(i);
        return existingClientId === clientId;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity
        };
        return updated;
      }
      return [...prev, item];
    });

    // Premium Notification
    toast({
      title: "Сагсанд амжилттай нэмэгдлээ",
      description: (
        <div className="flex items-center gap-3 mt-1">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-100 flex-shrink-0 bg-white">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-emerald-900">{item.name}</p>
            <p className="text-xs text-emerald-700 font-medium">{item.price.toLocaleString()}₮ × {item.quantity}</p>
          </div>
        </div>
      ),
      variant: "success",
    });
  }, []);

  const removeFromCart = useCallback((clientId: string) => {
    setCartItems((prev) => prev.filter((i) => getClientId(i) !== clientId));
  }, []);

  const updateQuantity = useCallback((clientId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(clientId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => getClientId(i) === clientId ? { ...i, quantity } : i)
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      itemCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}