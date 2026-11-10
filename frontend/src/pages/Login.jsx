
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API_URL from "../config/api";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
const successMessage = location.state?.message;

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("The server returned an invalid login response.");
      }

     localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

window.dispatchEvent(new Event("authChanged"));

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/account");
      }
    } catch (error) {
      setError(
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Check that your backend is running."
          : error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-[#FF6B00]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#121212] px-6 py-32 text-white">
      <div className="w-full max-w-md">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
          ISANUSI Clothing
        </p>

        <h1 className="mt-4 text-4xl font-black uppercase">
          Welcome Back.
        </h1>

        <p className="mt-3 text-white/50">
          Sign in to access your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm text-white/70">
            Email address
            <input
              className={inputClass}
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block text-sm text-white/70">
            Password
            <input
              className={inputClass}
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {successMessage && (
  <p
    role="status"
    className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400"
  >
    {successMessage}
  </p>
)}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#FF6B00] px-6 py-4 font-black uppercase transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-[#FF6B00] hover:text-white"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;