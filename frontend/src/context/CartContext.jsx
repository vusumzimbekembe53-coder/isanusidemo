import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

function getSavedCart() {
  try {
    const savedCart = localStorage.getItem("isanusi-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
}

function getProductId(product) {
  return product._id || product.id;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getSavedCart);

  useEffect(() => {
    localStorage.setItem("isanusi-cart", JSON.stringify(cartItems));
  }, [cartItems]);

 function addToCart(product, size, color, quantity) {
  const productId = getProductId(product);
  const availableStock = Math.max(
    0,
    Number(product.stock) - Number(product.reservedStock || 0)
  );

  if (!productId || availableStock < 1) {
    return false;
  }

  setCartItems((currentItems) => {
    const existingItem = currentItems.find(
      (item) =>
        getProductId(item) === productId &&
        item.size === size &&
        item.color === color
    );

    const currentQuantity = existingItem
      ? existingItem.quantity
      : 0;

    const newQuantity = Math.min(
      currentQuantity + Math.max(1, Number(quantity) || 1),
      availableStock
    );

    if (existingItem) {
      return currentItems.map((item) =>
        getProductId(item) === productId &&
        item.size === size &&
        item.color === color
          ? { ...item, quantity: newQuantity, stock: product.stock,
              reservedStock: product.reservedStock }
          : item
      );
    }

    return [
      ...currentItems,
      {
        ...product,
        id: productId,
        size,
        color,
        quantity: newQuantity,
      },
    ];
  });

  return true;
}

  function removeFromCart(id, size, color) {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            getProductId(item) === id &&
            item.size === size &&
            item.color === color
          )
      )
    );
  }

 function updateQuantity(id, size, color, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) return;

  setCartItems((currentItems) =>
    currentItems.map((item) => {
      if (
        getProductId(item) !== id ||
        item.size !== size ||
        item.color !== color
      ) {
        return item;
      }

      const availableStock = Math.max(
        0,
        Number(item.stock) - Number(item.reservedStock || 0)
      );

      return {
        ...item,
        quantity: Math.min(quantity, availableStock),
      };
    }).filter((item) => item.quantity > 0)
  );
}

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}