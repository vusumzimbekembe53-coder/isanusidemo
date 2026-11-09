import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const FREE_DELIVERY_AREAS = [
  "devland",
  "freedom park",
  "diepkloof",
  "chiawelo",
  "dhlamini",
  "nancefield",
  "eldorado park",
  "naturena",
  "meredale",
  "southgate",
];

const DELIVERY_OPTIONS = [
  {
    value: "free_local",
    name: "Free Local Delivery",
    price: 0,
    description:
      "Available for selected areas around Devland and nearby communities.",
  },
  {
    value: "paxi_economy",
    name: "PAXI Economy",
    price: 59.95,
    description:
      "Store-to-store delivery. Estimated 7–9 business days.",
  },
  {
    value: "paxi_speed",
    name: "PAXI Speed",
    price: 109.95,
    description:
      "Store-to-store delivery. Estimated 3–5 business days.",
  },
];

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    suburb: "",
    city: "",
    province: "Gauteng",
    postalCode: "",
    deliveryNotes: "",
    collectionPoint: "",
    collectionPointCode: "",
  });

  const [deliveryMethod, setDeliveryMethod] =
    useState("paxi_economy");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  const normalizedSuburb = form.suburb.trim().toLowerCase();

  const qualifiesForFreeDelivery =
    FREE_DELIVERY_AREAS.includes(normalizedSuburb);

  // Automatically switch to PAXI if the customer
  // enters an area outside the free delivery zone.
  useEffect(() => {
    if (
      deliveryMethod === "free_local" &&
      !qualifiesForFreeDelivery
    ) {
      setDeliveryMethod("paxi_economy");
    }
  }, [deliveryMethod, qualifiesForFreeDelivery]);

  const selectedDeliveryOption = useMemo(
    () =>
      DELIVERY_OPTIONS.find(
        (option) => option.value === deliveryMethod
      ),
    [deliveryMethod]
  );

  const estimatedTotal =
    cartTotal + (selectedDeliveryOption?.price || 0);

  // LOAD SAVED CUSTOMER DETAILS
  useEffect(() => {
    async function loadCustomerDetails() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:4000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load customer details."
          );
        }

        const user = data.user;

        const nameParts = (user.name || "")
          .trim()
          .split(/\s+/);

        const firstName = nameParts.shift() || "";
        const lastName = nameParts.join(" ");

        setForm((previous) => ({
          ...previous,
          firstName,
          lastName,
          email: user.email || "",
          phone: user.phone || "",
          address: [
            user.address?.street,
            user.address?.suburb,
          ]
            .filter(Boolean)
            .join(", "),
          suburb: user.address?.suburb || "",
          city: user.address?.city || "",
          province: user.address?.province || "Gauteng",
          postalCode: user.address?.postalCode || "",
        }));
      } catch (error) {
        console.error(
          "Checkout profile loading error:",
          error.message
        );
      }
    }

    loadCustomerDetails();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in before placing your order.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (
      deliveryMethod === "free_local" &&
      !qualifiesForFreeDelivery
    ) {
      setError(
        "Free local delivery is not available for the selected suburb."
      );
      return;
    }

    if (deliveryMethod !== "free_local") {
      if (!form.collectionPoint.trim()) {
        setError("Please enter your preferred PAXI collection point.");
        return;
      }

      if (!/^P\d{4}$/.test(
        form.collectionPointCode.trim().toUpperCase()
      )) {
        setError(
          "Please enter a valid PAXI point code, for example P6320."
        );
        return;
      }
    }

    try {
      setLoading(true);

      const orderItems = cartItems.map((item) => ({
        productId: item._id || item.id,
        size: item.size || "",
        color: item.color || "",
        quantity: item.quantity,
      }));

      // Create EFT order. The backend calculates the final delivery fee.
      const response = await fetch(
        "http://localhost:4000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: orderItems,
            paymentMethod: "eft",
            deliveryMethod,
            customer: {
              phone: form.phone.trim(),
            },
            deliveryAddress: {
              address: form.address.trim(),
              suburb: form.suburb.trim(),
              city: form.city.trim(),
              province: form.province.trim(),
              postalCode: form.postalCode.trim(),
              notes: form.deliveryNotes.trim(),
            },
            deliveryDetails: {
              collectionPoint:
                deliveryMethod === "free_local"
                  ? ""
                  : form.collectionPoint.trim(),
              collectionPointCode:
                deliveryMethod === "free_local"
                  ? ""
                  : form.collectionPointCode.trim().toUpperCase(),
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to place your order."
        );
      }

      setSuccessOrder(data.order);
      clearCart();
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ORDER SUCCESS PAGE
  if (successOrder) {
    const deliveryNames = {
      free_local: "Free Local Delivery",
      paxi_economy: "PAXI Economy",
      paxi_speed: "PAXI Speed",
    };

    return (
      <main className="min-h-screen bg-[#121212] px-6 pt-32 pb-20 text-white">
        <div className="mx-auto max-w-2xl rounded-xl border border-white/10 p-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
            ISANUSI Clothing
          </p>

          <h1 className="mt-5 text-4xl font-black uppercase">
            Order Received!
          </h1>

          <p className="mt-4 text-white/60">
            Your order has been successfully submitted.
          </p>

          <div className="mt-8 rounded-lg bg-white/[0.05] p-5">
            <p className="text-sm text-white/50">
              Order Number
            </p>

            <p className="mt-2 break-all font-bold text-[#FF6B00]">
              {successOrder._id}
            </p>

            <p className="mt-5 text-sm text-white/50">
              Order Total
            </p>

            <p className="mt-1 text-2xl font-black">
              R
              {Number(successOrder.total).toLocaleString("en-ZA", {
                minimumFractionDigits: 2,
              })}
            </p>

            <p className="mt-5 text-sm text-white/50">
              Delivery Method
            </p>

            <p className="mt-1 font-bold">
              {deliveryNames[successOrder.deliveryMethod] || "Delivery"}
            </p>

            {successOrder.deliveryDetails?.collectionPoint && (
              <>
                <p className="mt-5 text-sm text-white/50">
                  PAXI Collection Point
                </p>

                <p className="mt-1 font-bold">
                  {successOrder.deliveryDetails.collectionPoint}
                </p>

                <p className="mt-4 text-sm text-white/50">
                  PAXI Point Code
                </p>

                <p className="mt-1 font-bold text-[#FF6B00]">
                  {successOrder.deliveryDetails.collectionPointCode}
                </p>
              </>
            )}

            <p className="mt-5 text-sm text-white/50">
              Payment Status
            </p>

            <p className="mt-1 font-bold capitalize text-yellow-400">
              {successOrder.paymentStatus}
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-[#FF6B00]/30 bg-[#FF6B00]/10 p-5 text-left">
            <h2 className="text-lg font-bold text-[#FF6B00]">
              EFT Payment Instructions
            </h2>

            <p className="mt-2 text-sm text-white/60">
              Upload your proof of payment from the My Orders page.
              Your order will remain pending until payment is verified.
            </p>

            <div className="mt-5 space-y-3 rounded-lg bg-black/30 p-4">
              <div>
                <p className="text-xs text-white/40">Bank</p>
                <p className="font-semibold">
                  TEMPORARY — TO BE UPDATED
                </p>
              </div>

              <div>
                <p className="text-xs text-white/40">
                  Account Holder
                </p>
                <p className="font-semibold">
                  ISANUSI Clothing (Placeholder)
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-white/40">
                  Payment Reference
                </p>

                <p className="break-all font-bold text-[#FF6B00]">
                  {successOrder._id}
                </p>
              </div>

              <div>
                <p className="text-xs text-white/40">Amount</p>

                <p className="text-xl font-black">
                  R
                  {Number(successOrder.total).toLocaleString("en-ZA", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-yellow-400">
              Do not transfer money using placeholder bank details.
            </p>
          </div>

          <Link
            to="/shop"
            className="mt-8 inline-block rounded-full bg-[#FF6B00] px-8 py-4 font-black uppercase text-black"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#121212] px-6 pt-32 text-white">
        <h1 className="text-4xl font-black uppercase">
          Your cart is empty
        </h1>

        <Link
          to="/shop"
          className="mt-6 inline-block text-[#FF6B00]"
        >
          Shop Collection →
        </Link>
      </main>
    );
  }

  const fields = [
    {
      name: "firstName",
      label: "First name",
      required: true,
    },
    {
      name: "lastName",
      label: "Last name",
      required: true,
    },
    {
      name: "email",
      label: "Email address",
      type: "email",
      required: true,
    },
    {
      name: "phone",
      label: "Phone number",
      type: "tel",
      required: true,
    },
    {
      name: "address",
      label: "Street address",
      required: true,
    },
    {
      name: "suburb",
      label: "Suburb / Area",
      required: true,
    },
    {
      name: "city",
      label: "City / Town",
      required: true,
    },
    {
      name: "province",
      label: "Province",
      required: true,
    },
    {
      name: "postalCode",
      label: "Postal code",
      required: true,
    },
  ];

  const inputClass =
    "mt-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-[#FF6B00]";

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
          ISANUSI Clothing
        </p>

        <h1 className="mt-3 text-5xl font-black uppercase">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-12 grid gap-10 lg:grid-cols-[1fr_350px]"
        >
          <section>
            <h2 className="mb-6 text-xl font-black uppercase">
              Delivery Details
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((field) => (
                <label
                  key={field.name}
                  className="text-sm text-white/70"
                >
                  {field.label}

                  <input
                    className={inputClass}
                    name={field.name}
                    type={field.type || "text"}
                    value={form[field.name]}
                    onChange={handleChange}
                    required={field.required}
                  />
                </label>
              ))}
            </div>

            <label className="mt-5 block text-sm text-white/70">
              Delivery notes (optional)

              <textarea
                className={inputClass}
                name="deliveryNotes"
                rows={3}
                value={form.deliveryNotes}
                onChange={handleChange}
                placeholder="Any helpful delivery instructions?"
              />
            </label>

            {/* DELIVERY METHOD */}
            <div className="mt-10">
              <h2 className="mb-5 text-xl font-black uppercase">
                Delivery Method
              </h2>

              <div className="space-y-4">
                {DELIVERY_OPTIONS.map((option) => {
                  const isFreeOption =
                    option.value === "free_local";

                  const isDisabled =
                    isFreeOption && !qualifiesForFreeDelivery;

                  return (
                    <label
                      key={option.value}
                      className={`flex gap-4 rounded-xl border p-5 transition ${
                        isDisabled
                          ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50"
                          : "cursor-pointer"
                      } ${
                        deliveryMethod === option.value
                          ? "border-[#FF6B00] bg-[#FF6B00]/10"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={option.value}
                        checked={deliveryMethod === option.value}
                        disabled={isDisabled}
                        onChange={(event) =>
                          setDeliveryMethod(event.target.value)
                        }
                        className="mt-1 accent-[#FF6B00]"
                      />

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold">
                            {option.name}
                          </p>

                          <p className="font-black text-[#FF6B00]">
                            {option.price === 0
                              ? "FREE"
                              : `R${option.price.toFixed(2)}`}
                          </p>
                        </div>

                        <p className="mt-1 text-sm text-white/50">
                          {option.description}
                        </p>

                        {isFreeOption &&
                          !qualifiesForFreeDelivery && (
                            <p className="mt-2 text-xs text-yellow-400">
                              Enter a qualifying suburb to unlock free
                              local delivery.
                            </p>
                          )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {qualifiesForFreeDelivery && (
                <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
                  Great news! Your suburb qualifies for free local
                  delivery.
                </div>
              )}

              {/* PAXI COLLECTION DETAILS */}
              {deliveryMethod !== "free_local" && (
                <div className="mt-5 space-y-4">
                  <label className="block text-sm text-white/70">
                    Preferred PAXI Collection Point

                    <input
                      className={inputClass}
                      name="collectionPoint"
                      value={form.collectionPoint}
                      onChange={handleChange}
                      required
                      placeholder="Example: PEP Vosloorus Phumula Market"
                    />
                  </label>

                  <label className="block text-sm text-white/70">
                    PAXI Point Code

                    <input
                      className={inputClass}
                      name="collectionPointCode"
                      value={form.collectionPointCode}
                      onChange={handleChange}
                      required
                      placeholder="Example: P6320"
                      maxLength={5}
                      style={{ textTransform: "uppercase" }}
                    />

                    <span className="mt-2 block text-xs text-white/40">
                      Enter the five-character PAXI code for your
                      selected collection point.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* PAYMENT METHOD: EFT ONLY */}
            <div className="mt-10">
              <h2 className="mb-5 text-xl font-black uppercase">
                Payment Method
              </h2>

              <div className="rounded-xl border border-[#FF6B00] bg-[#FF6B00]/10 p-5">
                <div className="flex gap-4">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="mt-1 accent-[#FF6B00]"
                  />

                  <div>
                    <p className="font-bold">
                      EFT / Bank Transfer
                    </p>

                    <p className="mt-1 text-sm text-white/50">
                      Pay directly into the ISANUSI bank account.
                      Upload your proof of payment after placing your
                      order.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </p>
            )}
          </section>

          {/* ORDER SUMMARY */}
          <aside className="h-fit rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-black uppercase">
              Your Order
            </h2>

            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item._id || item.id}-${item.size}-${item.color}`}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-bold">{item.name}</p>

                    <p className="mt-1 text-white/50">
                      Size: {item.size || "Standard"}
                    </p>

                    <p className="text-white/50">
                      Colour: {item.color || "Standard"}
                    </p>

                    <p className="text-white/50">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <span className="whitespace-nowrap">
                    R
                    {(item.price * item.quantity).toLocaleString(
                      "en-ZA"
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
              <div className="flex justify-between">
                <span>Subtotal</span>

                <span>
                  R{cartTotal.toLocaleString("en-ZA")}
                </span>
              </div>

              <div className="flex justify-between text-sm text-white/60">
                <span>
                  {selectedDeliveryOption?.name || "Delivery"}
                </span>

                <span>
                  R
                  {(selectedDeliveryOption?.price || 0).toLocaleString(
                    "en-ZA",
                    { minimumFractionDigits: 2 }
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-black">
                <span>Total</span>

                <span className="text-[#FF6B00]">
                  R
                  {estimatedTotal.toLocaleString("en-ZA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-white/40">
              Final delivery pricing is securely calculated by the
              server when your order is placed.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#FF6B00] px-5 py-4 font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;