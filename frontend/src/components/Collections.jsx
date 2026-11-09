import { Link } from "react-router-dom";

const collections = [
  {
    name: "T-Shirts",
    description: "Everyday essentials. Unfazed energy.",
    category: "T-Shirts",
    number: "01",
  },
  {
    name: "Hoodies",
    description: "Comfort with a statement.",
    category: "Hoodies",
    number: "02",
  },
  {
    name: "Accessories",
    description: "Complete your streetwear look.",
    category: "Accessories",
    number: "03",
  },
];

function Collections() {
  return (
    <section className="bg-[#121212] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
          Find Your Style
        </p>

        <div className="mt-3 mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="text-4xl font-black uppercase sm:text-6xl">
            Explore Collections
          </h2>

          <Link
            to="/shop"
            className="font-bold uppercase tracking-wide transition hover:text-[#FF6B00]"
          >
            Shop Everything →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.number}
              to="/shop"
              className="group relative flex min-h-72 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#242424] to-black p-7 transition hover:border-[#FF6B00]"
            >
              <span className="text-sm font-bold text-[#FF6B00]">
                COLLECTION / {collection.number}
              </span>

              <div>
                <h3 className="text-3xl font-black uppercase transition group-hover:text-[#FF6B00]">
                  {collection.name}
                </h3>

                <p className="mt-2 text-white/60">
                  {collection.description}
                </p>

                <span className="mt-6 inline-block text-sm font-bold uppercase tracking-widest">
                  Explore Collection ↗
                </span>
              </div>

              <span className="pointer-events-none absolute -right-3 -top-8 text-9xl font-black text-white/[0.03]">
                {collection.number}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Collections;