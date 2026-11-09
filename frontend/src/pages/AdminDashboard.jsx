
import { useEffect, useState } from "react";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import AdminCustomers from "./AdminCustomers";
import AdminSubscribers from "./AdminSubscribers";
import AdminMarketing from "./AdminMarketing";
import AdminEmailDrafter from "./AdminEmailDrafter";
import AdminProductGenerator from "./AdminProductGenerator";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:4000/api/orders/analytics/products",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load store analytics."
          );
        }

        setAnalytics(data.products || []);
      } catch (error) {
        setAnalyticsError(error.message);
      } finally {
        setAnalyticsLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const tabs = [
    "overview",
    "products",
    "orders",
    "customers",
    "subscribers",
    "marketing",
    "email-drafter",
    "product-generator",
    "mockup-creator",
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <header className="border-b border-white/10 m-10">
        <h1 className="text-2xl font-bold text-[#FF6B00] p-10">
          ISANUSI Admin
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Store management dashboard
        </p>
      </header>

      <nav className="flex flex-wrap gap-3 p-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 capitalize ${
              activeTab === tab
                ? "bg-[#FF6B00] text-white"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {tab.replaceAll("-", " ")}
          </button>
        ))}
      </nav>

      <main className="p-6">
        <h2 className="text-xl font-semibold capitalize">
          {activeTab.replaceAll("-", " ")}
        </h2>

        {activeTab === "overview" && (
          <div className="mt-6">
            {analyticsLoading && (
              <p className="text-gray-400">
                Loading store analytics...
              </p>
            )}

            {analyticsError && (
              <p className="rounded-lg bg-red-500/10 p-4 text-red-400">
                {analyticsError}
              </p>
            )}

            {!analyticsLoading && !analyticsError && (
              <>
                <p className="mb-6 text-gray-400">
                  Track which ISANUSI products are performing best.
                </p>

                {analytics.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <p className="text-gray-400">
                      No paid product sales yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-xl border border-white/10 bg-white/5 p-6">
                      <h3 className="text-lg font-bold text-[#FF6B00]">
                        🔥 Best Selling Products
                      </h3>

                      <div className="mt-5 space-y-4">
                        {analytics.slice(0, 5).map((product, index) => (
                          <div
                            key={product._id}
                            className="flex items-center justify-between border-b border-white/10 pb-3"
                          >
                            <div>
                              <p className="font-semibold">
                                #{index + 1} {product.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                {product.unitsSold} sold
                              </p>
                            </div>

                            <p className="font-bold text-[#FF6B00]">
                              R{Number(product.revenue).toLocaleString("en-ZA")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-xl border border-white/10 bg-white/5 p-6">
                      <h3 className="text-lg font-bold text-red-400">
                        📉 Least Selling Products
                      </h3>

                      <div className="mt-5 space-y-4">
                        {[...analytics]
                          .sort((a, b) => a.unitsSold - b.unitsSold)
                          .slice(0, 5)
                          .map((product) => (
                            <div
                              key={product._id}
                              className="flex items-center justify-between border-b border-white/10 pb-3"
                            >
                              <div>
                                <p className="font-semibold">
                                  {product.name}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {product.unitsSold} sold
                                </p>
                              </div>

                              <p className="font-bold text-red-400">
                                R{Number(product.revenue).toLocaleString("en-ZA")}
                              </p>
                            </div>
                          ))}
                      </div>
                    </section>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "subscribers" && <AdminSubscribers />}
        {activeTab === "marketing" && <AdminMarketing />}
        {activeTab === "email-drafter" && <AdminEmailDrafter />}
        {activeTab === "product-generator" && <AdminProductGenerator />}

        {activeTab === "mockup-creator" && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-[#FF6B00]">
              AI Mockup Creator
            </h3>
            <p className="mt-2 text-gray-400">
              Your AI-powered product mockup studio will be built here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
