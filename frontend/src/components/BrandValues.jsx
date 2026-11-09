
const values = [
  { letter: "I", word: "Instantaneous", description: "Act on your vision." },
  { letter: "S", word: "Special", description: "Embrace what makes you different." },
  { letter: "A", word: "Attractive", description: "Express yourself with confidence." },
  { letter: "N", word: "Nice", description: "Move with kindness and respect." },
  { letter: "U", word: "Unfazed", description: "Stay focused through adversity." },
  { letter: "S", word: "Sweet", description: "Bring positive energy wherever you go." },
  { letter: "I", word: "Innocent", description: "Stay true to your intentions." },
];

function BrandValues() {
  return (
    <section className="bg-[#121212] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
            What We Stand For
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase sm:text-6xl">
            More Than a Name.
            <span className="block text-[#00A3FF]">It's Our Identity.</span>
          </h2>
          <p className="mt-5 leading-7 text-white/60">
            Seven letters. Seven values. One mindset: stay motivated, trust your
            vision, and remain unfazed.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <article
              key={`${value.letter}-${value.word}`}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#FF6B00]/70 hover:bg-white/[0.06]"
            >
              <span className="text-5xl font-black text-[#FF6B00] transition group-hover:text-[#00A3FF]">
                {value.letter}
              </span>
              <h3 className="mt-4 text-xl font-black uppercase">
                {value.word}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                {value.description}
              </p>
              <div className="mt-6 h-1 w-10 rounded-full bg-[#FF6B00]" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandValues;
