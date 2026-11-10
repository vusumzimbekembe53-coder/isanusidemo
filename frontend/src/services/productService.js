
import API_URL from "../config/api";

const PRODUCTS_API = `${API_URL}/api/products`;

export async function getProducts() {
  const response = await fetch(PRODUCTS_API);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();
  return data.products;
}

export async function getProductById(id) {
  const response = await fetch(`${PRODUCTS_API}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const data = await response.json();
  return data.product;
}
