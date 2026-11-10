import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_URL from "../config/api";

function ConfirmSubscription() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasConfirmed = useRef(false);

  const [message, setMessage] = useState("Confirming your subscription...");

  useEffect(() => {
    if (hasConfirmed.current) return;
    hasConfirmed.current = true;

    const confirmSubscription = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setMessage("Invalid confirmation link.");
        return;
      }

      try {
        

        const response = await fetch(
          `${API_URL}/api/subscribers/confirm`,
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
          throw new Error(data.message || "Confirmation failed.");
        }

        navigate("/login", {
          replace: true,
          state: {
            message: data.message,
          },
        });
      } catch (error) {
        setMessage(error.message);
      }
    };

    confirmSubscription();
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#121212] px-6 text-center text-white">
      <div>
        <h1 className="text-2xl font-black text-[#FF6B00]">
          ISANUSI Clothing
        </h1>

        <p className="mt-4 text-white/70">{message}</p>
      </div>
    </div>
  );
}

export default ConfirmSubscription;