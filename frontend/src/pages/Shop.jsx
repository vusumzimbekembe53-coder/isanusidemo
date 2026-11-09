import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

function Shop() {
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts =
    category === "All"
      ? products
      : products.filter((product) => product.category === category);

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
            ISANUSI
          </p>

          <h1 className="mt-3 text-5xl font-black uppercase sm:text-7xl">
            Shop Collection
          </h1>

          <p className="mt-5 max-w-xl text-white/60">
            Discover the latest ISANUSI pieces. Built for the visionaries,
            dreamers and the unfazed.
          </p>
        </div>

        {loading && (
          <p className="py-16 text-center text-white/60">
            Loading the ISANUSI collection...
          </p>
        )}

        {!loading && error && (
          <div className="py-16 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 font-bold text-[#FF6B00]"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="py-16 text-center text-white/60">
            No products are available right now.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="mb-12 flex flex-wrap gap-3">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full border px-5 py-2 text-sm font-bold uppercase tracking-wide transition ${
                    category === item
                      ? "border-[#FF6B00] bg-[#FF6B00] text-white"
                      : "border-white/20 text-white/60 hover:border-white hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mb-6 text-sm text-white/40">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Shop;