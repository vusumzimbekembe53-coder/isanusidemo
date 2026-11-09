import { useState } from "react";

const emailTypes = [
  { value: "customer-update", label: "Customer update" },
  { value: "delay", label: "Order delay / apology" },
  { value: "refund", label: "Refund / payment enquiry" },
  { value: "supplier", label: "Supplier enquiry" },
  { value: "partnership", label: "Partnership proposal" },
  { value: "follow-up", label: "Customer follow-up" },
  { value: "promotion", label: "Promotion / new product" },
];

const tones = [
  "Professional",
  "Friendly",
  "Persuasive",
  "Apologetic",
];

const subjects = {
  "customer-update": "An Update Regarding Your Order",
  delay: "An Apology Regarding Your Order Delay",
  refund: "Update Regarding Your Payment / Refund",
  supplier: "Business Enquiry",
  partnership: "Partnership Opportunity",
  "follow-up": "Following Up With You",
  promotion: "Something New From ISANUSI",
};

function generateEmail({ type, tone, recipient, details }) {
  const name = recipient.trim() || "there";
  const greeting = `Hello ${name},`;

  const openings = {
    Professional: "I hope you are doing well.",
    Friendly: "I hope you're having a great day!",
    Persuasive: "We would love to share something valuable with you.",
    Apologetic: "We sincerely apologise for any inconvenience caused.",
  };

  const closings = {
    Professional: "Please let us know if you have any questions.",
    Friendly: "Feel free to reach out if there's anything we can help with.",
    Persuasive: "We would be delighted to hear from you.",
    Apologetic: "Thank you for your patience and understanding.",
  };

  const messages = {
    "customer-update": `We are contacting you with an update regarding your order.\n\n${details}`,
    delay: `We would like to apologise for the delay with your order.\n\n${details}\n\nWe appreciate your patience and are working to resolve this as soon as possible.`,
    refund: `We are writing to provide an update regarding your payment or refund enquiry.\n\n${details}`,
    supplier: `We are interested in learning more about your products and services.\n\n${details}\n\nWe would appreciate the opportunity to discuss this further.`,
    partnership: `We would like to explore a potential business partnership with you.\n\n${details}\n\nWe believe there may be an opportunity for us to work together.`,
    "follow-up": `We are following up regarding our previous communication.\n\n${details}`,
    promotion: `We are excited to share an update from ISANUSI Clothing.\n\n${details}\n\nThank you for being part of our journey.`,
  };

  return {
    subject: subjects[type],
    body: `${greeting}\n\n${openings[tone]}\n\n${messages[type]}\n\n${closings[tone]}\n\nKind regards,\nISANUSI Clothing`,
  };
}

export default function AdminEmailDrafter() {
  const [type, setType] = useState("customer-update");
  const [tone, setTone] = useState("Professional");
  const [recipient, setRecipient] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [details, setDetails] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  function handleGenerate() {
    if (!details.trim()) {
      setStatus("Please describe what you want to communicate.");
      return;
    }

    const draft = generateEmail({
      type,
      tone,
      recipient,
      details,
    });

    setSubject(draft.subject);
    setBody(draft.body);
    setStatus("Draft generated. You can edit it below.");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        `To: ${recipientEmail}\nSubject: ${subject}\n\n${body}`
      );
      setStatus("Email copied to clipboard.");
    } catch {
      setStatus("Unable to copy. Please select and copy the text manually.");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Email Drafter</h2>
        <p className="mt-1 text-sm text-gray-400">
          Create professional business emails without struggling
          with the wording.
        </p>
      </div>

      <div className="grid gap-5 rounded-xl border border-white/10 bg-[#1b1b1b] p-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm">Email purpose</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
          >
            {emailTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm">Writing tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
          >
            {tones.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm">
            Recipient name
          </label>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="e.g. John"
            className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">
            Recipient email
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="customer@example.com"
            className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm">
            What do you want to communicate?
          </label>
          <textarea
            rows="4"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Explain the situation in your own words..."
            className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
          />
        </div>

        <button
          onClick={handleGenerate}
          className="rounded-lg bg-[#FF6B00] px-5 py-3 font-semibold text-black hover:bg-orange-400 md:col-span-2"
        >
          Generate Email
        </button>
      </div>

      {status && (
        <p className="text-sm text-gray-300">{status}</p>
      )}

      {(subject || body) && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-[#1b1b1b] p-5">
          <h3 className="text-lg font-semibold">Your email draft</h3>

          <div>
            <label className="mb-2 block text-sm">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Email message</label>
            <textarea
              rows="14"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-white"
            />
          </div>

          <button
            onClick={handleCopy}
            className="rounded-lg border border-[#FF6B00] px-5 py-3 font-semibold text-[#FF6B00] hover:bg-[#FF6B00] hover:text-black"
          >
            Copy Email
          </button>
        </div>
      )}
    </div>
  );
}