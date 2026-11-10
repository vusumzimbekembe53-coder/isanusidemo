import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid server response.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/account");
    } catch (error) {
      setError(
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Please try again."
          : error.message
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
          Join the Unfazed.
        </h1>

        <p className="mt-3 text-white/50">
          Create your customer account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm text-white/70">
            Full name
            <input
              className={inputClass}
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

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
              autoComplete="new-password"
              minLength={8}
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block text-sm text-white/70">
            Confirm password
            <input
              className={inputClass}
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              minLength={8}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-bold text-[#FF6B00] hover:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Register;