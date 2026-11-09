
import { useState } from "react";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const text = `Hello ISANUSI Clothing!
Name: ${form.name}
Email: ${form.email}
Subject: ${form.subject}
Message: ${form.message}`;

    window.open(
      `https://wa.me/27677515059?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-[#FF6B00]";

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
          We're Here to Help
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase sm:text-7xl">
          Get in <span className="text-[#FF6B00]">Touch.</span>
        </h1>

        <p className="mt-6 max-w-2xl leading-7 text-white/60">
          Have a question about our collection or an order? Send us a message
          and connect with the ISANUSI team.
        </p>

        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: "name", label: "Your name", type: "text" },
              { name: "email", label: "Email address", type: "email" },
              { name: "subject", label: "Subject", type: "text" },
            ].map((field) => (
              <label key={field.name} className="block text-sm text-white/70">
                {field.label}
                <input
                  className={inputClass}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                />
              </label>
            ))}

            <label className="block text-sm text-white/70">
              Message
              <textarea
                className={inputClass}
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-[#FF6B00] px-6 py-4 font-black uppercase transition hover:bg-white hover:text-black"
            >
              Send via WhatsApp ↗
            </button>

            <p className="text-xs leading-5 text-white/40">
              This opens WhatsApp with your message prepared. You must send
              the message in WhatsApp yourself.
            </p>
          </form>

          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 p-6">
              <h2 className="font-black uppercase text-[#FF6B00]">Email</h2>
              <a
                href="mailto:isanusiclothing24@gmail.com"
                className="mt-3 block break-all text-white/70 hover:text-white"
              >
                isanusiclothing24@gmail.com
              </a>
            </div>

            <div className="rounded-xl border border-white/10 p-6">
              <h2 className="font-black uppercase text-[#FF6B00]">Phone</h2>
              <a
                href="tel:+27677515059"
                className="mt-3 block text-white/70 hover:text-white"
              >
                +27 67 751 5059
              </a>
            </div>

            <div className="rounded-xl border border-white/10 p-6">
              <h2 className="font-black uppercase text-[#FF6B00]">Location</h2>
              <p className="mt-3 text-white/70">Devland, Soweto, South Africa</p>
            </div>

            <a
              href="https://facebook.com/profile.php?id=61553795200449"
              target="_blank"
              rel="noreferrer"
              className="inline-block font-bold text-[#00A3FF] hover:text-white"
            >
              Follow ISANUSI on Facebook ↗
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Contact;
