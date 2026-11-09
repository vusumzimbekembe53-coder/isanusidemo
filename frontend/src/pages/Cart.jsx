
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    updateQuantity,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-32 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black uppercase">Your Cart Is Empty</h1>
          <p className="mt-4 text-white/50">
            You haven't added anything to your cart yet.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block rounded-full bg-[#FF6B00] px-8 py-4 font-black uppercase text-white"
          >
            Shop Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-10 text-4xl font-black uppercase">
          Your Shopping Cart
        </h1>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {cartItems.map((item) => {
              const productId = item._id || item.id;
              const availableStock = Math.max(
  0,
  Number(item.stock) - Number(item.reservedStock || 0)
);

const stockLimitReached = item.quantity >= availableStock;

              return (
                <article
                  key={`${productId}-${item.size}-${item.color}`}
                  className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row"
                >
                  <div className="flex h-32 w-full items-center justify-center rounded-xl bg-white/[0.05] sm:w-32">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full rounded-xl object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-black text-white/20">
                        ISANUSI
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-black uppercase">
                        {item.name}
                      </h2>

                      <p className="mt-2 text-sm text-white/50">
                        Colour: {item.color || "Default"}
                      </p>

                      <p className="text-sm text-white/50">
                        Size: {item.size}
                      </p>

                      <p className="mt-2 font-bold text-[#FF6B00]">
                        R{Number(item.price).toLocaleString("en-ZA")}
                      </p>
                      <p className="mt-2 text-sm text-white/40">
  {availableStock > 0
    ? `${availableStock} available`
    : "Currently out of stock"}
</p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center rounded-lg border border-white/20">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(
                              productId,
                              item.size,
                              item.color,
                              item.quantity - 1
                            )
                          }
                          className="px-4 py-2 disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="min-w-10 text-center">
                          {item.quantity}
                        </span>

                        <button
  type="button"
  aria-label="Increase quantity"
  disabled={stockLimitReached}
  onClick={() =>
    updateQuantity(
      productId,
      item.size,
      item.color,
      item.quantity + 1
    )
  }
  className="px-4 py-2 disabled:cursor-not-allowed disabled:opacity-30"
>
  +
</button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            productId,
                            item.size,
                            item.color
                          )
                        }
                        className="text-sm font-bold text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-black uppercase">
              Order Summary
            </h2>

            <div className="mt-6 flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>
                R{cartTotal.toLocaleString("en-ZA")}
              </span>
            </div>

            <div className="mt-4 flex justify-between text-white/60">
              <span>Delivery</span>
              <span>Confirmed at checkout</span>
            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="flex justify-between text-lg font-black">
              <span>Total</span>
              <span>
                R{cartTotal.toLocaleString("en-ZA")}
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-8 block rounded-full bg-[#FF6B00] px-6 py-4 text-center font-black uppercase text-white transition hover:bg-white hover:text-black"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/shop"
              className="mt-5 block text-center text-sm text-white/50 hover:text-white"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;