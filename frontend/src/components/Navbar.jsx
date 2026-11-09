import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const { cartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    function loadUser() {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }

    loadUser();

    window.addEventListener("authChanged", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("authChanged", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setOpen(false);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/", { replace: true });
  }

  const closeMenu = () => setOpen(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-2xl font-black tracking-wider"
        >
          ISANUSI
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="hover:text-orange-500 transition">
            Home
          </Link>

          <Link to="/shop" className="hover:text-orange-500 transition">
            Shop
          </Link>

          <Link to="/about" className="hover:text-orange-500 transition">
            Our Story
          </Link>

          <Link to="/contact" className="hover:text-orange-500 transition">
            Contact
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-5">
          {!user ? (
            <Link
              to="/login"
              className="hover:text-orange-500 transition"
            >
              Login
            </Link>
          ) : (
            <>
              {user.role === "admin" ? (
                <Link
                  to="/admin"
                  className="hover:text-orange-500 transition"
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="hover:text-orange-500 transition"
                >
                  My Account
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="hover:text-orange-500 transition"
              >
                Logout
              </button>
            </>
          )}

          <Link
            to="/cart"
            className="font-bold transition hover:text-[#FF6B00]"
          >
            Cart ({cartCount})
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-6 py-6 space-y-5 bg-black">
          <Link to="/" onClick={closeMenu} className="block">
            Home
          </Link>

          <Link to="/shop" onClick={closeMenu} className="block">
            Shop
          </Link>

          <Link to="/about" onClick={closeMenu} className="block">
            Our Story
          </Link>

          <Link to="/contact" onClick={closeMenu} className="block">
            Contact
          </Link>

          {!user ? (
            <Link to="/login" onClick={closeMenu} className="block">
              Login
            </Link>
          ) : (
            <>
              {user.role === "admin" ? (
                <Link to="/admin" onClick={closeMenu} className="block">
                  Admin Dashboard
                </Link>
              ) : (
                <Link to="/account" onClick={closeMenu} className="block">
                  My Account
                </Link>
              )}

              <button onClick={handleLogout} className="block">
                Logout
              </button>
            </>
          )}

          <Link to="/cart" onClick={closeMenu} className="block">
            Cart ({cartCount})
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;