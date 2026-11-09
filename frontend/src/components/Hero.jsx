function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#121212] text-white">
      {/* Background glow */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#00A3FF]/10 blur-3xl" />
      <div className="absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 pt-28 pb-16 lg:grid-cols-2">
        
        {/* Left side */}
        <div className="max-w-2xl">
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.35em] text-[#FF6B00]">
            South African Streetwear
          </p>

          <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
            The Future
            <span className="block text-[#FF6B00]">Belongs</span>
            <span className="block">to the Unfazed.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-white/70">
            South African streetwear built for the visionaries, dreamers,
            and relentless achievers.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="rounded-full bg-[#FF6B00] px-7 py-4 font-black uppercase tracking-wide text-white transition hover:bg-[#00A3FF]">
              Shop the Collection
            </button>

            <a
              href="https://wa.me/27677515059"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/30 px-7 py-4 font-black uppercase tracking-wide text-white transition hover:border-[#25D366] hover:text-[#25D366]"
            >
              Order via WhatsApp
            </a>
          </div>

          <div className="mt-10 flex items-center gap-8 text-sm text-white/50">
            <div>
              <span className="block font-black text-white">SA</span>
              South African Born
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div>
              <span className="block font-black text-white">UNFAZED</span>
              Built Different
            </div>
          </div>
        </div>

        {/* Right side visual */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1c1c1c] via-[#121212] to-[#2a1205]">
            
            {/* Orange graphic */}
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#FF6B00] blur-2xl opacity-30" />

            {/* Blue graphic */}
            <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-[#00A3FF] blur-2xl opacity-20" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-bold uppercase tracking-[0.4em] text-white/50">
                ISANUSI
              </p>

              <h2 className="mt-4 text-7xl font-black uppercase leading-none sm:text-8xl">
                UN
                <span className="text-[#FF6B00]">FAZED</span>
              </h2>

              <div className="mt-8 h-px w-24 bg-white/30" />

              <p className="mt-6 max-w-xs text-sm uppercase tracking-[0.2em] text-white/50">
                See what others cannot.
              </p>
            </div>

            <div className="absolute bottom-6 left-6 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              Devland × Soweto
            </div>

            <div className="absolute right-6 top-6 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-black">
              Drop 01
            </div>
          </div>

          {/* Floating accent */}
          <div className="absolute -bottom-5 -right-5 hidden h-20 w-20 rotate-12 items-center justify-center bg-[#FF6B00] font-black uppercase text-black sm:flex">
            Stay
            <br />
            Unfazed
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;