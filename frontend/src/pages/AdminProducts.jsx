import { useEffect, useState } from "react";
import API_URL from "../config/api";

const PRODUCTS_API = `${API_URL}/api/products`;
const MAX_IMAGES = 5;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "T-Shirts",
    sizes: "",
    colors: "",
    stock: "0",
    featured: false,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const previews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  async function loadProducts() {
    setLoading(true);

    try {
      const response = await fetch(PRODUCTS_API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products");
      }

      setProducts(data.products || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setImages([]);
    setSelectedFiles([]);
    setMessage("");
  }

  function editProduct(product) {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: product.category || "T-Shirts",
      sizes: (product.sizes || []).join(", "),
      colors: (product.colors || []).join(", "),
      stock: String(product.stock ?? 0),
      featured: Boolean(product.featured),
    });

    setImages(product.images || []);
    setSelectedFiles([]);
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageSelection(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      setMessage("Only JPG, PNG and WebP images are allowed.");
    }

    const oversizedFiles = validFiles.filter(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      setMessage("Each image must be 5 MB or smaller.");
    }

    const acceptedFiles = validFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024
    );

    const availableSlots =
      MAX_IMAGES - images.length - selectedFiles.length;

    if (availableSlots <= 0) {
      setMessage("A product can have a maximum of 5 images.");
      return;
    }

    if (acceptedFiles.length > availableSlots) {
      setMessage("You can add a maximum of 5 images per product.");
    }

    setSelectedFiles((previous) => [
      ...previous,
      ...acceptedFiles.slice(0, availableSlots),
    ]);
  }

  function removeExistingImage(index) {
    setImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  function removeSelectedImage(index) {
    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  async function uploadSelectedImages(token) {
    if (selectedFiles.length === 0) return [];

    const imageData = new FormData();

    selectedFiles.forEach((file) => {
      imageData.append("images", file);
    });

    const response = await fetch(`${PRODUCTS_API}/upload-images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: imageData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Image upload failed.");
    }

    return (data.images || []).map((image) => image.url);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in as an admin first.");
      return;
    }

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setMessage("A product can have a maximum of 5 images.");
      return;
    }

    setUploading(true);

    try {
      const uploadedImages = await uploadSelectedImages(token);

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        sizes: form.sizes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        colors: form.colors
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        images: [...images, ...uploadedImages],
      };

      const response = await fetch(
        editingId ? `${PRODUCTS_API}/${editingId}` : PRODUCTS_API,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save product");
      }

      const successMessage = editingId
        ? "Product updated successfully."
        : "Product added successfully.";

      resetForm();
      setMessage(successMessage);
      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in as an admin first.");
      return;
    }

    try {
      const response = await fetch(`${PRODUCTS_API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete product");
      }

      setMessage("Product deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/15 bg-[#1b1b1b] p-3 text-white outline-none focus:border-[#FF6B00]";

  return (
    <div className="min-h-screen bg-[#121212] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-[#FF6B00]">
          Product Management
        </h1>

        <p className="mb-6 text-gray-400">
          Add, update and manage your store products and images.
        </p>

        {message && (
          <p role="status" className="mb-4 rounded-lg bg-white/10 p-3">
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-10 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-5 md:grid-cols-2"
        >
          <h2 className="text-xl font-semibold md:col-span-2">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          <input
            className={inputClass}
            name="name"
            placeholder="Product name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            className={inputClass}
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price (R)"
            value={form.price}
            onChange={handleChange}
            required
          />

          <textarea
            className={inputClass}
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <select
            className={inputClass}
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {[
              "T-Shirts",
              "Hoodies",
              "Caps",
              "Jackets",
              "Jerseys",
              "Pants",
              "Accessories",
            ].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            className={inputClass}
            name="sizes"
            placeholder="Sizes, e.g. S, M, L, XL"
            value={form.sizes}
            onChange={handleChange}
          />

          <input
            className={inputClass}
            name="colors"
            placeholder="Colours, e.g. Black, White"
            value={form.colors}
            onChange={handleChange}
          />

          <input
            className={inputClass}
            name="stock"
            type="number"
            min="0"
            step="1"
            placeholder="Stock quantity"
            value={form.stock}
            onChange={handleChange}
            required
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
            />
            Featured product
          </label>

          <div className="space-y-3 md:col-span-2">
            <label className="block font-semibold">
              Product Images
            </label>

            <p className="text-sm text-gray-400">
              Select up to 5 images. JPG, PNG or WebP. Maximum 5 MB per image.
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={images.length + selectedFiles.length >= MAX_IMAGES}
              onChange={handleImageSelection}
              className="w-full rounded-lg border border-white/15 bg-[#1b1b1b] p-3 text-sm"
            />

            {(images.length > 0 || imagePreviews.length > 0) && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {images.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="h-32 w-full rounded-lg border border-white/10 object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-700 px-2 py-1 text-xs"
                    >
                      Remove
                    </button>

                    <p className="mt-1 text-xs text-gray-400">
                      Saved image
                    </p>
                  </div>
                ))}

                {imagePreviews.map((preview, index) => (
                  <div key={preview} className="relative">
                    <img
                      src={preview}
                      alt={`New product image ${index + 1}`}
                      className="h-32 w-full rounded-lg border border-[#FF6B00]/50 object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-700 px-2 py-1 text-xs"
                    >
                      Remove
                    </button>

                    <p className="mt-1 text-xs text-[#FF6B00]">
                      New image
                    </p>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              {images.length + selectedFiles.length} / {MAX_IMAGES} images selected
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              className="rounded-lg bg-[#FF6B00] px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={uploading}
            >
              {uploading
                ? "Uploading and Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="rounded-lg bg-white/10 px-5 py-3"
                onClick={resetForm}
                disabled={uploading}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <h2 className="mb-4 text-xl font-semibold">
          Existing Products
        </h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400">No products found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="mb-4 h-52 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-52 items-center justify-center rounded-lg bg-white/5 text-sm text-gray-500">
                    No product image
                  </div>
                )}

                <h3 className="font-semibold">{product.name}</h3>

                <p className="mt-1 text-sm text-gray-400">
                  {product.category}
                </p>

                <p className="mt-2 text-lg font-bold text-[#FF6B00]">
                  R{Number(product.price).toFixed(2)}
                </p>

                <p className="text-sm text-gray-400">
                  Stock: {product.stock}
                </p>

                <p className="text-sm text-gray-400">
                  {product.featured ? "Featured" : "Not featured"}
                </p>

                <p className="text-sm text-gray-400">
                  Images: {product.images?.length || 0}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    className="rounded-lg bg-white/10 px-4 py-2"
                    onClick={() => editProduct(product)}
                  >
                    Edit
                  </button>

                  <button
                    className="rounded-lg bg-red-700 px-4 py-2"
                    onClick={() => deleteProduct(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}