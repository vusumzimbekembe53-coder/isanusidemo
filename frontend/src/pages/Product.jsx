import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import { useCart } from "../context/CartContext";

function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setSelectedSize("");
      setSelectedColor("");
      setSelectedImage(0);
      setQuantity(1);

      try {
        const data = await getProductById(id);

        if (!cancelled) {
          setProduct(data);

          if (data.colors?.length === 1) {
            setSelectedColor(data.colors[0]);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load this product. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] px-6 pt-32 text-center text-white">
        Loading product...
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#121212] px-6 pt-32 text-white">
        <h1 className="text-3xl font-black">
          {error ? "Something went wrong" : "Product not found"}
        </h1>

        <p className="mt-3 text-white/60">
          {error || "This product may no longer be available."}
        </p>

        <Link to="/shop" className="mt-6 inline-block text-[#FF6B00]">
          Return to Shop
        </Link>
      </main>
    );
  }

  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const images = product.images || [];
  const availableStock = Number(product.stock) || 0;

  function handleAddToCart() {
    if (sizes.length > 0 && !selectedSize) {
      alert("Please select a size first.");
      return;
    }

    if (colors.length > 1 && !selectedColor) {
      alert("Please select a colour first.");
      return;
    }

    if (quantity > availableStock) {
      alert(`Only ${availableStock} item(s) currently available.`);
      return;
    }

    const size = selectedSize || "One Size";
    const color = selectedColor || colors[0] || "Default";

    const added = addToCart(product, size, color, quantity);

if (added) {
  alert(`${product.name} added to cart!`);
} else {
  alert("Unable to add this product. Please check available stock.");
}
  }

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-32 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">

        {/* PRODUCT IMAGE GALLERY */}
        <div>
          <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04] p-6 sm:p-10">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={`${product.name} - Image ${selectedImage + 1}`}
                className="max-h-[550px] w-full rounded-xl object-contain"
              />
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FF6B00]">
                  ISANUSI Clothing
                </p>

                <p className="mt-5 text-5xl font-black uppercase">
                  {selectedColor || colors[0] || "ISANUSI"}
                </p>

                <p className="mt-3 text-white/40">
                  Product image coming soon
                </p>
              </div>
            )}
          </div>

          {/* IMAGE THUMBNAILS */}
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    selectedImage === index
                      ? "border-[#FF6B00]"
                      : "border-white/10 hover:border-white/50"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCT DETAILS */}
        <div className="flex flex-col justify-center">
          <Link
            to="/shop"
            className="mb-8 text-sm text-white/50 hover:text-[#FF6B00]"
          >
            ← Back to collection
          </Link>

          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FF6B00]">
            {product.category}
          </p>

          <h1 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-5 text-2xl font-bold">
            R{Number(product.price).toLocaleString("en-ZA")}
          </p>

          <p className="mt-6 leading-7 text-white/60">
            {product.description}
          </p>

          {/* COLOUR SELECTION */}
          {colors.length > 0 && (
            <div className="mt-8">
              <label className="mb-3 block text-sm font-bold uppercase">
                Select colour
              </label>

              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-lg border px-4 py-3 font-bold transition ${
                      selectedColor === color
                        ? "border-[#FF6B00] bg-[#FF6B00] text-white"
                        : "border-white/20 hover:border-white"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIZE SELECTION */}
          {sizes.length > 0 && (
            <div className="mt-8">
              <label className="mb-3 block text-sm font-bold uppercase">
                Select size
              </label>

              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 rounded-lg border px-4 py-3 font-bold transition ${
                      selectedSize === size
                        ? "border-[#FF6B00] bg-[#FF6B00] text-white"
                        : "border-white/20 hover:border-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="mt-8">
            <label className="mb-3 block text-sm font-bold uppercase">
              Quantity
            </label>

            <div className="flex w-fit items-center rounded-lg border border-white/20">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((current) => current - 1)}
                className="px-4 py-3 disabled:opacity-30"
              >
                −
              </button>

              <span className="min-w-10 text-center">
                {quantity}
              </span>

              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= availableStock}
                onClick={() =>
                  setQuantity((current) =>
                    Math.min(current + 1, availableStock)
                  )
                }
                className="px-4 py-3 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <p className="mt-2 text-sm text-white/40">
              {availableStock > 0
                ? `${availableStock} available`
                : "Currently out of stock"}
            </p>
          </div>

          {/* ADD TO CART */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={availableStock < 1}
            className="mt-8 w-full rounded-full bg-[#FF6B00] px-6 py-4 font-black uppercase transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {availableStock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Product;