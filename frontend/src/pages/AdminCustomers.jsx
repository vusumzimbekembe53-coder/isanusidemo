import { useEffect, useState } from "react";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch(
          "http://localhost:4000/api/auth/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load customers.");
        }

        setCustomers(data.users || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [token]);

  async function viewOrders(customer) {
    setSelectedCustomer(customer);
    setOrders([]);
    setOrdersLoading(true);

    try {
      const response = await fetch(
        `http://localhost:4000/api/auth/users/${customer._id}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function formatPrice(amount) {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  }

  if (loading) {
    return <p className="mt-6 text-gray-400">Loading customers...</p>;
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Registered Customers</h3>
          <p className="text-sm text-gray-400">
            Total customers: {customers.length}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#FF6B00] sm:w-72"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-red-400">
          {error}
        </p>
      )}

      {filteredCustomers.length === 0 ? (
        <p className="text-gray-400">No customers found.</p>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white">
                    {customer.name}
                  </h4>

                  <p className="mt-1 text-sm text-gray-400">
                    {customer.email}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Phone: {customer.phone || "Not provided"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Joined:{" "}
                    {new Date(customer.createdAt).toLocaleDateString("en-ZA")}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    {[
                      customer.address?.street,
                      customer.address?.suburb,
                      customer.address?.city,
                      customer.address?.province,
                      customer.address?.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No saved address"}
                  </p>
                </div>

                <button
                  onClick={() => viewOrders(customer)}
                  className="rounded-lg bg-[#FF6B00] px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  View Orders
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCustomer && (
        <div className="rounded-xl border border-[#FF6B00]/40 bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">
                {selectedCustomer.name}'s Orders
              </h3>
              <p className="text-sm text-gray-400">
                {selectedCustomer.email}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedCustomer(null);
                setOrders([]);
              }}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
            >
              Close
            </button>
          </div>

          {ordersLoading ? (
            <p className="mt-4 text-gray-400">Loading order history...</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-gray-400">
              This customer has not placed any orders yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-lg bg-black/30 p-4"
                >
                  <p className="break-all text-sm font-semibold">
                    Order #{order._id}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-ZA")}
                  </p>

                  <p className="mt-2 text-sm">
                    Status:{" "}
                    <span className="capitalize text-[#FF6B00]">
                      {order.orderStatus}
                    </span>
                  </p>

                  <p className="text-sm">
                    Payment:{" "}
                    <span className="capitalize">
                      {order.paymentStatus}
                    </span>
                  </p>

                  <p className="mt-2 font-semibold">
                    {formatPrice(order.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}