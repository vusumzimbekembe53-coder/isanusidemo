import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import ProductCard from "./ProductCard";

function FeaturedProducts() {
 const [featuredProducts, setFeaturedProducts] = useState([]);

useEffect(() => {
  getProducts()
    .then((products) =>
      setFeaturedProducts(products.filter((product) => product.featured))
    )
    .catch((error) => console.error("Failed to load featured products:", error));
}, []);

  return (
    <section className="bg-white px-6 py-24 text-black">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
              Drop 01
            </p>

            <h2 className="mt-3 text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Signature Streetwear Drops
            </h2>
          </div>

          <Link
            to="/shop"
            className="font-black uppercase tracking-wide underline underline-offset-4 hover:text-[#FF6B00]"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;