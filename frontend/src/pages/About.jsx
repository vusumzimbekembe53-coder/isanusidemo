
function About() {
  const values = [
    ["I", "Instantaneous"],
    ["S", "Special"],
    ["A", "Attractive"],
    ["N", "Nice"],
    ["U", "Unfazed"],
    ["S", "Sweet"],
    ["I", "Innocent"],
  ];

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <section className="px-6 pb-24 pt-40">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
            Our Story · Devland × Soweto
          </p>

          <h1 className="mt-6 max-w-5xl text-5xl font-black uppercase leading-tight sm:text-7xl lg:text-8xl">
            We See The Future.
            <span className="block text-[#FF6B00]">We Stay Unfazed.</span>
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-white/60">
            Isanusi traditionally means a seer or diviner — one who sees what
            others cannot. To us, ISANUSI represents people who dare to dream
            of a brighter future, stay motivated, and keep moving through
            adversity.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-24 text-black">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
              Our Mission
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              Wear Your Vision.
            </h2>
          </div>

          <div className="space-y-5 leading-8 text-black/70">
            <p>
              Born in Devland and Soweto, South Africa, ISANUSI Clothing is
              built around ambition, self-expression, and determination.
            </p>
            <p>
              We want every piece to represent more than style. It represents
              the mindset of someone working towards a better future without
              allowing obstacles to define them.
            </p>
            <p className="font-black text-black">
              The future isn't hidden — it's open for everyone to see.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#00A3FF]">
            The ISANUSI Identity
          </p>

          <h2 className="mt-4 text-4xl font-black uppercase sm:text-6xl">
            Seven Letters. One Mindset.
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(([letter, word], index) => (
              <div
                key={`${letter}-${index}`}
                className="rounded-xl border border-white/10 p-6 transition hover:border-[#FF6B00]"
              >
                <span className="text-5xl font-black text-[#FF6B00]">
                  {letter}
                </span>
                <h3 className="mt-3 text-xl font-black uppercase">{word}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
