import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Account() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCustomer() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }

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
          throw new Error(data.message || "Unable to load account.");
        }

        setCustomer(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.dispatchEvent(new Event("authChanged"));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.dispatchEvent(new Event("authChanged"));

        setError(error.message);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    fetchCustomer();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setCustomer(null);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/", { replace: true });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] p-10 pt-32 text-white">
        Loading your account...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
          ISANUSI Clothing
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase">
          My Account
        </h1>

        {error && (
          <p className="mt-6 text-red-400">{error}</p>
        )}

        {!customer ? (
          <div className="mt-10 rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-black uppercase">
              Welcome to ISANUSI
            </h2>

            <p className="mt-3 text-white/60">
              Sign in to manage your profile, addresses and orders.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-full bg-[#FF6B00] px-7 py-3 font-bold"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 rounded-2xl border border-white/10 p-8">
              <h2 className="text-2xl font-black uppercase">
                Welcome, {customer.name}!
              </h2>

              <p className="mt-3 text-white/60">
                {customer.email}
              </p>

              <button
                onClick={handleLogout}
                className="mt-6 rounded-full border border-white/20 px-6 py-3 font-bold hover:border-[#FF6B00]"
              >
                Sign Out
              </button>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Link
                to="/orders"
                className="rounded-xl border border-white/10 p-6 hover:border-[#FF6B00]"
              >
                <h2 className="text-xl font-black uppercase">
                  My Orders
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  View your purchases and order status.
                </p>
              </Link>
<Link
  to="/profile"
  className="rounded-xl border border-white/10 p-6 transition hover:border-[#FF6B00]"
>
  <h2 className="text-xl font-black uppercase">
    My Profile
  </h2>

  <p className="mt-2 text-sm text-white/50">
    Update your personal details, contact information and delivery address.
  </p>
</Link>


            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Account;