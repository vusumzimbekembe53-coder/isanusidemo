import { useState } from "react";

const categories = [
  "Hoodies",
  "T-Shirts",
  "Caps",
  "Pants",
  "Jackets",
  "Accessories",
];

const styles = [
  "Minimalist",
  "Bold",
  "Premium",
  "Streetwear",
  "Futuristic",
];

const nameIdeas = {
  Hoodies: ["Unfazed", "Visionary", "Legacy", "Limitless"],
  "T-Shirts": ["Origins", "No Limits", "Beyond", "Perspective"],
  Caps: ["The Vision", "Icon", "Crown", "Focus"],
  Pants: ["Movement", "Elevation", "Urban Flow", "Momentum"],
  Jackets: ["Dominion", "Rebel", "Ascend", "Frontier"],
  Accessories: ["Essence", "Signature", "Identity", "Symbol"],
};

export default function AdminProductGenerator() {
  const [category, setCategory] = useState("Hoodies");
  const [style, setStyle] = useState("Streetwear");
  const [features, setFeatures] = useState("");
  const [audience, setAudience] = useState("Streetwear enthusiasts");

  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState("");

  function generateProduct() {
    if (!features.trim()) {
      setStatus("Please describe the product features first.");
      return;
    }

    const ideas = nameIdeas[category].map(
      (name) => `ISANUSI ${name}`
    );

    const chosenName = ideas[0];

    setNames(ideas);
    setSelectedName(chosenName);

    setDescription(
      `${chosenName} is designed for ${audience.toLowerCase()} who embrace individuality and confidence. ` +
      `Featuring a ${style.toLowerCase()} aesthetic, this ${category.toLowerCase()} piece combines style and identity.\n\n` +
      `Product features:\n${features
        .split(",")
        .map((feature) => `• ${feature.trim()}`)
        .join("\n")}\n\n` +
      `The Future Belongs to the Unfazed.`
    );

    setTagline(
      `Make your statement. Stay ${style === "Minimalist" ? "timeless" : "unfazed"}.`
    );

    setSeoTitle(
      `${chosenName} | ISANUSI Clothing`
    );

    setMetaDescription(
      `Discover the ${chosenName} ${category.toLowerCase()} by ISANUSI Clothing. ${features}. Shop South African streetwear for the unfazed.`
    );

    setStatus("Product content generated. Review and edit it below.");
  }

  function selectName(name) {
    setSelectedName(name);
    setSeoTitle(`${name} | ISANUSI Clothing`);
  }

  async function copyContent() {
    const content = [
      `Product name: ${selectedName}`,
      `Description:\n${description}`,
      `Tagline: ${tagline}`,
      `SEO title: ${seoTitle}`,
      `Meta description: ${metaDescription}`,
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(content);
      setStatus("Product content copied successfully.");
    } catch {
      setStatus("Unable to copy. Please copy the content manually.");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">
          Product & Name Generator
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Generate product names, descriptions and SEO content
          for your store.
        </p>
      </div>

      <div className="grid gap-5 rounded-xl border border-white/10 bg-[#1b1b1b] p-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm">
            Product category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm">
            Product style
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
          >
            {styles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm">
            Target audience
          </label>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. Young creatives and streetwear enthusiasts"
            className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm">
            Product features
          </label>
          <textarea
            rows="4"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder="e.g. Heavyweight cotton, oversized fit, orange embroidered logo, adjustable hood"
            className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
          />
          <p className="mt-2 text-xs text-gray-500">
            Separate individual features with commas.
          </p>
        </div>

        <button
          onClick={generateProduct}
          className="rounded-lg bg-[#FF6B00] px-5 py-3 font-semibold text-black hover:bg-orange-400 md:col-span-2"
        >
          Generate Product Content
        </button>
      </div>

      {status && (
        <p className="text-sm text-gray-300">{status}</p>
      )}

      {names.length > 0 && (
        <div className="space-y-5 rounded-xl border border-white/10 bg-[#1b1b1b] p-5">
          <div>
            <h3 className="text-lg font-semibold">
              Product name suggestions
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {names.map((name) => (
                <button
                  key={name}
                  onClick={() => selectName(name)}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    selectedName === name
                      ? "border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]"
                      : "border-white/10 bg-[#121212] text-white"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Selected product name
            </label>
            <input
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Product description
            </label>
            <textarea
              rows="7"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Marketing tagline
            </label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              SEO title
            </label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              SEO meta description
            </label>
            <textarea
              rows="3"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
            />
          </div>

          <button
            onClick={copyContent}
            className="rounded-lg border border-[#FF6B00] px-5 py-3 font-semibold text-[#FF6B00] hover:bg-[#FF6B00] hover:text-black"
          >
            Copy Product Content
          </button>
        </div>
      )}
    </div>
  );
}