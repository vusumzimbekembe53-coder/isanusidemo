import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API_URL from "../config/api";


export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const hasSubmitted = useRef(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    async function unsubscribe() {
      const token = searchParams.get("token");

      if (!token) {
        setMessage("Invalid unsubscribe link.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/subscribers/unsubscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to unsubscribe.");
        }

        setSuccess(true);
        setMessage(data.message);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    unsubscribe();
  }, [searchParams]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#121212] px-6 text-center text-white">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-black text-[#FF6B00]">
          ISANUSI
        </h1>

        {loading ? (
          <p className="mt-6 text-gray-400">
            Processing your unsubscribe request...
          </p>
        ) : (
          <>
            <div className="mt-6 text-4xl">
              {success ? "✓" : "!"}
            </div>

            <h2 className="mt-4 text-xl font-bold">
              {success ? "You're unsubscribed" : "Unable to unsubscribe"}
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-400">
              {message}
            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-[#FF6B00] px-6 py-3 font-bold text-white hover:bg-orange-600"
            >
              Return to Store
            </Link>
          </>
        )}
      </div>
    </div>
  );
}