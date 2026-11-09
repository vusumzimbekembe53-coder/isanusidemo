import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [uploadMessages, setUploadMessages] = useState({});

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please sign in to view your orders.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/orders/my-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your orders.");
      }

      setOrders(data.orders || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFileChange = (orderId, file) => {
    setUploadMessages((prev) => ({
      ...prev,
      [orderId]: "",
    }));

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadMessages((prev) => ({
        ...prev,
        [orderId]: "Only PDF, JPG and PNG files are allowed.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadMessages((prev) => ({
        ...prev,
        [orderId]: "File size must not exceed 5 MB.",
      }));
      return;
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [orderId]: file,
    }));
  };

  const handleProofUpload = async (orderId) => {
    const file = selectedFiles[orderId];
    const token = localStorage.getItem("token");

    if (!file) {
      setUploadMessages((prev) => ({
        ...prev,
        [orderId]: "Please select a file first.",
      }));
      return;
    }

    const formData = new FormData();
    formData.append("proof", file);

    setUploading((prev) => ({
      ...prev,
      [orderId]: true,
    }));

    setUploadMessages((prev) => ({
      ...prev,
      [orderId]: "",
    }));

    try {
      const response = await fetch(
        `http://localhost:4000/api/orders/${orderId}/proof-of-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setSelectedFiles((prev) => ({
        ...prev,
        [orderId]: null,
      }));

      setUploadMessages((prev) => ({
        ...prev,
        [orderId]: data.message || "Proof uploaded successfully.",
      }));

      await fetchOrders();
    } catch (err) {
      setUploadMessages((prev) => ({
        ...prev,
        [orderId]: err.message,
      }));
    } finally {
      setUploading((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
          ISANUSI Clothing
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase">
          My Orders
        </h1>

        {loading ? (
          <p className="mt-10 text-white/60">
            Loading your orders...
          </p>
        ) : error ? (
          <div className="mt-10 rounded-xl border border-red-500/30 p-6">
            <p className="text-red-400">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 p-10 text-center">
            <h2 className="text-2xl font-black uppercase">
              No orders yet
            </h2>

            <p className="mt-3 text-white/50">
              Your purchases and order updates will appear here.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-block rounded-full bg-[#FF6B00] px-7 py-3 font-bold"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-xl border border-white/10 p-6"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <h2 className="font-black">
                    Order #{order._id}
                  </h2>

                  <span className="capitalize text-[#FF6B00]">
                    {order.orderStatus}
                  </span>
                </div>

                <p className="mt-3 text-sm text-white/50">
                  {new Date(order.createdAt).toLocaleDateString("en-ZA")}
                </p>

                <div className="mt-5 space-y-2">
                  {order.items.map((item, index) => (
                    <p key={index} className="text-sm text-white/70">
                      {item.name} × {item.quantity}
                    </p>
                  ))}
                </div>

                <p className="mt-5 font-bold">
                  Total: R{Number(order.total).toLocaleString("en-ZA")}
                </p>

                <p className="mt-2 text-sm text-white/60">
                  Payment method:{" "}
                  <span className="uppercase">{order.paymentMethod}</span>
                </p>

                <p className="mt-2 text-sm text-white/60">
                  Payment status:{" "}
                  <span className="capitalize text-yellow-400">
                    {order.paymentStatus}
                  </span>
                </p>

                <p className="mt-2 text-sm text-white/60">
                  Proof of payment:{" "}
                  {order.paymentDetails?.proofOfPayment
                    ? "Uploaded — awaiting verification"
                    : "Not uploaded"}
                </p>

                {order.paymentMethod === "eft" &&
                  order.paymentStatus === "pending" && (
                    <div className="mt-6 border-t border-white/10 pt-6">
                      {!order.paymentDetails?.proofOfPayment && (
                        <>
                          <label className="mb-3 block text-sm font-bold">
                            Upload proof of payment
                          </label>

                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileChange(order._id, e.target.files[0])
                            }
                            className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#FF6B00] file:px-5 file:py-2 file:font-bold file:text-black"
                          />

                          <p className="mt-2 text-xs text-white/40">
                            Accepted formats: PDF, JPG and PNG. Maximum size: 5 MB.
                          </p>

                          {selectedFiles[order._id] && (
                            <p className="mt-3 text-sm text-white/60">
                              Selected: {selectedFiles[order._id].name}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() => handleProofUpload(order._id)}
                            disabled={
                              !selectedFiles[order._id] ||
                              uploading[order._id]
                            }
                            className="mt-4 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {uploading[order._id]
                              ? "Uploading..."
                              : "Upload Proof of Payment"}
                          </button>
                        </>
                      )}

                      {uploadMessages[order._id] && (
                        <p className="mt-4 text-sm text-[#FF6B00]">
                          {uploadMessages[order._id]}
                        </p>
                      )}
                    </div>
                  )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;