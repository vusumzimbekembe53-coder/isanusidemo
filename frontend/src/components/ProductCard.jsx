import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const image = product.images?.[0];

  return (
    <article className="group">
      <Link to={`/product/${product._id}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#1c1c1c]">

          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black uppercase tracking-tighter text-white/10">
                ISANUSI
              </span>
              <span className="mt-3 text-xs uppercase tracking-widest text-white/30">
                Image coming soon
              </span>
            </div>
          )}

          {product.featured && (
            <div className="absolute left-4 top-4 rounded-full bg-[#FF6B00] px-3 py-1 text-xs font-black uppercase text-white">
              Featured
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="block rounded-full bg-[#FF6B00] py-3 text-center text-sm font-black uppercase text-white">
              View Product
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40">
          {product.category}
        </p>

        <div className="mt-1 flex items-center justify-between gap-4">
          <h3 className="font-bold text-white">
            {product.name}
          </h3>

          <p className="whitespace-nowrap font-black">
            R{Number(product.price).toLocaleString("en-ZA")}
          </p>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;