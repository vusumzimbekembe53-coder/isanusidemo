
import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config/api";

function Footer() {
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!consent) {
      setMessage("Please agree to receive marketing emails.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, consent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Subscription failed.");
      }

      setMessage(data.message);
      setEmail("");
      setConsent(false);
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-black px-6 pb-8 pt-16 text-white">
      <div className="mx-auto mb-16 max-w-7xl rounded-2xl border border-white/10 bg-[#121212] p-8 md:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FF6B00]">
            Join the unfazed
          </p>

          <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl">
            Stay ahead of the next drop.
          </h2>

          <p className="mt-4 text-sm leading-7 text-white/60">
            Be the first to discover new collections, exclusive offers
            and updates from ISANUSI Clothing.
          </p>

          <form onSubmit={handleSubscribe} className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black px-5 py-4 text-sm text-white outline-none transition focus:border-[#FF6B00]"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#FF6B00] px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Please wait..." : "Subscribe"}
              </button>
            </div>

            <label className="mt-5 flex items-start gap-3 text-left text-xs leading-5 text-white/50">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-[#FF6B00]"
              />

              <span>
                I agree to receive marketing emails from ISANUSI Clothing,
                including new drops, promotions and brand updates. I can
                unsubscribe at any time.
              </span>
            </label>

            {message && (
              <p
                role="status"
                className="mt-4 text-sm font-semibold text-[#FF6B00]"
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="text-3xl font-black tracking-tight">
            ISANUSI<span className="text-[#FF6B00]">.</span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-7 text-white/60">
            South African streetwear built for the visionaries, dreamers, and
            relentless achievers. Stay unfazed.
          </p>

          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#00A3FF]">
            Born in Devland × Soweto
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#FF6B00]">
            Explore
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-white/60">
            <li><Link className="hover:text-white" to="/">Home</Link></li>
            <li><Link className="hover:text-white" to="/shop">Shop Collection</Link></li>
            <li><Link className="hover:text-white" to="/about">Our Story</Link></li>
            <li><Link className="hover:text-white" to="/contact">Contact Us</Link></li>
            <li><Link className="hover:text-white" to="/account">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#FF6B00]">
            Get in Touch
          </h3>

          <ul className="mt-5 space-y-4 text-sm text-white/60">
            <li>
              <span className="block text-white">Email</span>
              <a href="mailto:isanusiclothing24@gmail.com" className="break-all hover:text-white">
                isanusiclothing24@gmail.com
              </a>
            </li>

            <li>
              <span className="block text-white">Phone</span>
              <a href="tel:+27677515059" className="hover:text-white">
                +27 67 751 5059
              </a>
            </li>

            <li>
              <span className="block text-white">Location</span>
              Devland, Soweto, South Africa
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#FF6B00]">
            Connect With Us
          </h3>

          <p className="mt-5 text-sm leading-6 text-white/60">
            Have a question about an order or a product? Get in touch with us.
          </p>

          <a
            href="https://wa.me/27677515059"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-black text-black transition hover:scale-105"
          >
            Order on WhatsApp ↗
          </a>

          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold">
            <a
              href="https://facebook.com/profile.php?id=61553795200449"
              target="_blank"
              rel="noreferrer"
              className="text-white/60 hover:text-[#00A3FF]"
            >
              Facebook ↗
            </a>

            <a
              href="https://www.instagram.com/isanusi_clothing/"
              target="_blank"
              rel="noreferrer"
              className="text-white/60 hover:text-[#00A3FF]"
            >
              Instagram ↗
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-7xl border-t border-white/10 pt-6">
        <div className="flex flex-col gap-3 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} ISANUSI Clothing. All rights reserved.</p>
          <p>VISIONARY BY NATURE. UNFAZED BY DESIGN.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
