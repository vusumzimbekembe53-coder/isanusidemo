import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000/api/auth";

const emptyAddress = {
  street: "",
  suburb: "",
  city: "",
  province: "",
  postalCode: "",
};

function Profile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: emptyAddress,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          address: {
            ...emptyAddress,
            ...(data.user.address || {}),
          },
        });

        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("authChanged"));
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("authChanged"));
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleAddressChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      address: {
        ...previous.address,
        [name]: value,
      },
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setForm({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        address: {
          ...emptyAddress,
          ...(data.user.address || {}),
        },
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));

      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handlePasswordInput(e) {
    const { name, value } = e.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handlePasswordChange(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Your new passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change password.");
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage("Your password has been changed successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] px-6 pt-32 text-white">
        Loading your profile...
      </main>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-white/10 bg-[#1c1c1c] px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]";

  const labelClass =
    "text-xs font-bold uppercase tracking-wider text-white/60";

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/account"
          className="text-sm font-bold text-[#FF6B00] hover:text-white"
        >
          ← Back to My Account
        </Link>

        <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
          ISANUSI Clothing
        </p>

        <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
          My Profile
        </h1>

        <p className="mt-3 text-white/50">
          Manage your personal information and delivery details.
        </p>

        {message && (
          <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* PERSONAL INFORMATION */}
        <form
          onSubmit={handleSave}
          className="mt-10 rounded-2xl border border-white/10 bg-[#181818] p-6 sm:p-8"
        >
          <h2 className="text-xl font-black uppercase">
            Personal Information
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Full Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </label>

            <label className={labelClass}>
              Email Address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </label>

            <label className={labelClass}>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 0712345678"
              />
            </label>
          </div>

          {/* DELIVERY ADDRESS */}
          <div className="mt-10 border-t border-white/10 pt-8">
            <h2 className="text-xl font-black uppercase">
              Delivery Address
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                Street Address
                <input
                  name="street"
                  value={form.address.street}
                  onChange={handleAddressChange}
                  className={inputClass}
                  placeholder="House number and street"
                />
              </label>

              <label className={labelClass}>
                Suburb
                <input
                  name="suburb"
                  value={form.address.suburb}
                  onChange={handleAddressChange}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                City
                <input
                  name="city"
                  value={form.address.city}
                  onChange={handleAddressChange}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Province
                <input
                  name="province"
                  value={form.address.province}
                  onChange={handleAddressChange}
                  className={inputClass}
                  placeholder="e.g. Gauteng"
                />
              </label>

              <label className={labelClass}>
                Postal Code
                <input
                  name="postalCode"
                  value={form.address.postalCode}
                  onChange={handleAddressChange}
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-8 rounded-full bg-[#FF6B00] px-8 py-3 font-black uppercase text-white transition hover:bg-white hover:text-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* CHANGE PASSWORD */}
        <form
          onSubmit={handlePasswordChange}
          className="mt-8 rounded-2xl border border-white/10 bg-[#181818] p-6 sm:p-8"
        >
          <h2 className="text-xl font-black uppercase">
            Change Password
          </h2>

          <p className="mt-2 text-sm text-white/50">
            Choose a new password with at least 8 characters.
          </p>

          <div className="mt-6 grid gap-5">
            <label className={labelClass}>
              Current Password
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordInput}
                className={inputClass}
                required
              />
            </label>

            <label className={labelClass}>
              New Password
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordInput}
                className={inputClass}
                minLength={8}
                required
              />
            </label>

            <label className={labelClass}>
              Confirm New Password
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordInput}
                className={inputClass}
                minLength={8}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="mt-8 rounded-full border border-[#FF6B00] px-8 py-3 font-black uppercase text-[#FF6B00] transition hover:bg-[#FF6B00] hover:text-white disabled:opacity-50"
          >
            {changingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Profile;