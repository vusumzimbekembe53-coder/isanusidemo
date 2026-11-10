import { useEffect, useState } from "react";
import API_URL from "../config/api";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const deliveryMethodNames = {
  free_local: "Free Local Delivery",
  paxi_economy: "PAXI Store-to-Store Economy",
  paxi_speed: "PAXI Store-to-Store Speed",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewingProofId, setViewingProofId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      setUpdatingOrderId(orderId);
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderStatus: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update order status.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? data.order : order
        )
      );

      setSuccessMessage(`Order status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function viewPaymentProof(orderId) {
    const proofTab = window.open("about:blank", "_blank");

    try {
      setViewingProofId(orderId);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/proof-of-payment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to retrieve receipt.");
      }

      if (!data.proofUrl) {
        throw new Error("Receipt URL was not returned by the server.");
      }

      if (proofTab) {
        proofTab.location.href = data.proofUrl;
      } else {
        window.location.href = data.proofUrl;
      }
    } catch (err) {
      if (proofTab) proofTab.close();
      setError(err.message);
    } finally {
      setViewingProofId(null);
    }
  }

  async function updatePaymentStatus(orderId, paymentStatus) {
    try {
      setUpdatingPaymentId(orderId);
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/payment-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update payment.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? data.order : order
        )
      );

      setSuccessMessage(data.message || "Payment status updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingPaymentId(null);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <p className="mt-6 text-gray-400">Loading orders...</p>;
  }

  if (error && orders.length === 0) {
    return <p className="mt-6 text-red-400">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="mt-6 text-gray-400">No orders received yet.</p>;
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-gray-400">
          {orders.length} order(s) received
        </p>

        <button
          onClick={fetchOrders}
          className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Refresh Orders
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
          {successMessage}
        </p>
      )}

      {orders.map((order) => (
        <article
          key={order._id}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
        >
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="font-bold text-[#FF6B00]">
                Order #{order._id}
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {new Date(order.createdAt).toLocaleString("en-ZA")}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold">
                R{Number(order.total || 0).toLocaleString("en-ZA")}
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Method:{" "}
                <span className="font-semibold capitalize text-white">
                  {order.paymentMethod === "payfast"
                    ? "PayFast (Historical Order)"
                    : order.paymentMethod === "eft"
                    ? "EFT / Bank Transfer"
                    : "Not specified"}
                </span>
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Payment Status:{" "}
                <span className="font-semibold capitalize text-yellow-400">
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Customer</h3>

              <p className="mt-2 text-sm text-gray-400">
                {order.customer?.name}
              </p>

              <p className="text-sm text-gray-400">
                {order.customer?.email}
              </p>

              <p className="text-sm text-gray-400">
                {order.customer?.phone}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Delivery Address</h3>

              <p className="mt-2 text-sm text-gray-400">
                {order.deliveryAddress?.address},{" "}
                {order.deliveryAddress?.city},{" "}
                {order.deliveryAddress?.province},{" "}
                {order.deliveryAddress?.postalCode}
              </p>

              {order.deliveryAddress?.notes && (
                <p className="mt-2 text-sm text-gray-400">
                  Notes: {order.deliveryAddress.notes}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <h3 className="font-semibold">Delivery Information</h3>

            <p className="mt-2 text-sm text-gray-400">
              Delivery method:{" "}
              <span className="font-semibold text-white">
                {deliveryMethodNames[order.deliveryMethod] ||
                  "Not specified"}
              </span>
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Delivery fee:{" "}
              <span className="font-semibold text-white">
                R{Number(order.deliveryFee || 0).toFixed(2)}
              </span>
            </p>

            {order.deliveryMethod?.startsWith("paxi_") && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-400">
                  Collection point:
                </p>

                <p className="font-semibold text-white">
                  {order.deliveryDetails?.collectionPoint ||
                    "Not provided"}
                </p>

                <p className="text-sm text-gray-400">
                  PAXI point code:
                </p>

                <p className="font-bold tracking-wider text-[#FF6B00]">
                  {order.deliveryDetails?.collectionPointCode ||
                    "Not provided"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <h3 className="font-semibold">Products Ordered</h3>

            <div className="mt-3 space-y-3">
              {(order.items || []).map((item, index) => (
                <div
                  key={`${item.product}-${index}`}
                  className="flex flex-wrap justify-between gap-3 text-sm"
                >
                  <div>
                    <p>{item.name}</p>

                    <p className="text-gray-400">
                      Size: {item.size || "Standard"} | Colour:{" "}
                      {item.color || "Standard"} | Quantity: {item.quantity}
                    </p>
                  </div>

                  <p>
                    R{(item.price * item.quantity).toLocaleString("en-ZA")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <h3 className="font-semibold">Payment Verification</h3>

            <p className="mt-2 text-sm text-gray-400">
              Proof of Payment:{" "}
              <span className="font-semibold text-white">
                {order.paymentDetails?.proofOfPayment
                  ? "Uploaded"
                  : "Not uploaded"}
              </span>
            </p>

            {order.paymentMethod === "eft" &&
              order.paymentDetails?.proofOfPayment && (
                <button
                  type="button"
                  onClick={() => viewPaymentProof(order._id)}
                  disabled={viewingProofId === order._id}
                  className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 disabled:opacity-50"
                >
                  {viewingProofId === order._id
                    ? "Opening receipt..."
                    : "View Proof of Payment"}
                </button>
              )}

            {order.paymentMethod === "eft" &&
              order.paymentStatus === "pending" &&
              order.paymentDetails?.proofOfPayment && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updatePaymentStatus(order._id, "paid")
                    }
                    disabled={updatingPaymentId === order._id}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Confirm Payment
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updatePaymentStatus(order._id, "failed")
                    }
                    disabled={updatingPaymentId === order._id}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject Payment
                  </button>
                </div>
              )}

            {updatingPaymentId === order._id && (
              <p className="mt-2 text-sm text-gray-400">
                Updating payment...
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <label
              htmlFor={`status-${order._id}`}
              className="mb-2 block text-sm font-semibold"
            >
              Update Order Status
            </label>

            <select
              id={`status-${order._id}`}
              value={order.orderStatus}
              disabled={updatingOrderId === order._id}
              onChange={(event) =>
                updateOrderStatus(order._id, event.target.value)
              }
              className="w-full max-w-xs rounded-lg border border-white/10 bg-[#222] px-3 py-2 text-white disabled:opacity-50"
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {updatingOrderId === order._id && (
              <p className="mt-2 text-sm text-gray-400">
                Saving status...
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
