
function OurStory() {
  return (
    <section className="bg-white px-6 py-24 text-black">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-2xl bg-[#121212] p-8 text-center text-white">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#FF6B00]/30 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.4em] text-[#FF6B00]">
              Born in South Africa
            </p>
            <h2 className="mt-5 text-6xl font-black uppercase sm:text-7xl">
              Stay
              <span className="block text-[#FF6B00]">Unfazed.</span>
            </h2>
            <p className="mt-5 text-sm uppercase tracking-widest text-white/50">
              Devland × Soweto
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
            More Than Clothing
          </p>

          <h2 className="mt-4 text-4xl font-black uppercase leading-tight sm:text-5xl">
            The Meaning Behind ISANUSI
          </h2>

          <p className="mt-6 leading-8 text-black/70">
            Isanusi traditionally means a seer or diviner — one who sees
            what others cannot.
          </p>

          <p className="mt-4 leading-8 text-black/70">
            To us, ISANUSI represents those who dare to dream of a brighter
            future, stay motivated, and remain unfazed in the face of
            adversity. Born in Devland and Soweto, South Africa, our
            clothing is a badge of honour for those turning vision into
            reality.
          </p>

          <p className="mt-4 font-bold">
            The future isn't hidden — it's open for everyone to see.
          </p>
        </div>                      
      </div>
    </section>
  );
}

export default OurStory;
