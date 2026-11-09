import { useEffect, useState } from "react";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchSubscribers() {
      try {
        const response = await fetch(
          "http://localhost:4000/api/subscribers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load subscribers.");
        }

        setSubscribers(data.subscribers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscribers();
  }, [token]);

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = subscribers.filter(
    (subscriber) => subscriber.status === "active"
  ).length;

  const pendingCount = subscribers.filter(
    (subscriber) => subscriber.status === "pending"
  ).length;

  const unsubscribedCount = subscribers.filter(
    (subscriber) => subscriber.status === "unsubscribed"
  ).length;

  function getStatusClass(status) {
    if (status === "active") {
      return "bg-green-500/10 text-green-400";
    }

    if (status === "pending") {
      return "bg-yellow-500/10 text-yellow-400";
    }

    return "bg-red-500/10 text-red-400";
  }

  if (loading) {
    return <p className="mt-6 text-gray-400">Loading subscribers...</p>;
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Newsletter Subscribers</h3>
          <p className="text-sm text-gray-400">
            Total subscribers: {subscribers.length}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#FF6B00] sm:w-72"
        />
      </div>

      {/* Statistics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-sm text-gray-400">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-400">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-sm text-gray-400">Pending Confirmation</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-gray-400">Unsubscribed</p>
          <p className="mt-1 text-2xl font-bold text-red-400">
            {unsubscribedCount}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-red-400">
          {error}
        </p>
      )}

      {/* Subscriber list */}
      {filteredSubscribers.length === 0 ? (
        <p className="text-gray-400">No subscribers found.</p>
      ) : (
        <div className="space-y-3">
          {filteredSubscribers.map((subscriber) => (
            <div
              key={subscriber._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <div>
                <p className="font-semibold text-white">
                  {subscriber.email}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Subscribed:{" "}
                  {new Date(subscriber.createdAt).toLocaleDateString("en-ZA")}
                </p>

                {subscriber.confirmedAt && (
                  <p className="mt-1 text-xs text-gray-500">
                    Confirmed:{" "}
                    {new Date(subscriber.confirmedAt).toLocaleDateString(
                      "en-ZA"
                    )}
                  </p>
                )}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                  subscriber.status
                )}`}
              >
                {subscriber.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}