import { useEffect, useState } from "react";

import API_URL from "../config/api";

export default function AdminMarketing() {
  const [subscribers, setSubscribers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [results, setResults] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  const token = localStorage.getItem("token");

  // Load active subscribers and campaign history
  useEffect(() => {
    async function loadMarketingData() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [subscriberResponse, campaignResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/subscribers`, { headers }),
            fetch(`${API_URL}/api/marketing/campaigns`, { headers }),
          ]);

        const subscriberData = await subscriberResponse.json();
        const campaignData = await campaignResponse.json();

        if (!subscriberResponse.ok) {
          throw new Error(
            subscriberData.message || "Unable to load subscribers."
          );
        }

        if (!campaignResponse.ok) {
          throw new Error(
            campaignData.message || "Unable to load campaign history."
          );
        }

        setSubscribers(
          (subscriberData.subscribers || []).filter(
            (subscriber) => subscriber.status === "active"
          )
        );

        setCampaigns(campaignData.campaigns || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadMarketingData();
  }, [token]);

  function toggleSubscriber(email) {
    setSelectedEmails((previous) =>
      previous.includes(email)
        ? previous.filter((item) => item !== email)
        : [...previous, email]
    );
  }

  function selectAll() {
    setSelectedEmails((previous) =>
      previous.length === subscribers.length
        ? []
        : subscribers.map((subscriber) => subscriber.email)
    );
  }

  // Send campaign
  async function handleSendCampaign() {
    setError("");
    setSuccess("");
    setResults(null);

    if (!subject.trim() || !heading.trim() || !message.trim()) {
      setError("Please complete the subject, heading and message.");
      return;
    }

    if (selectedEmails.length === 0) {
      setError("Please select at least one subscriber.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this campaign to ${selectedEmails.length} subscriber(s)?`
    );

    if (!confirmed) return;

    try {
      setSending(true);

      const response = await fetch(`${API_URL}/api/marketing/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          heading,
          message,
          subscriberEmails: selectedEmails,
          sendToAllActive: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Campaign sending failed.");
      }

      setResults(data);

      setSuccess(data.message || "Campaign processing completed.");

      setSubject("");
      setHeading("");
      setMessage("");
      setSelectedEmails([]);

      // Refresh campaign history
      await loadCampaignHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  // Refresh campaign history
  async function loadCampaignHistory() {
    try {
      const response = await fetch(
        `${API_URL}/api/marketing/campaigns`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load campaign history.");
      }

      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mt-6 space-y-8">

      {/* Header */}
      <div>
        <h3 className="text-xl font-bold">Marketing Campaigns</h3>
        <p className="mt-1 text-sm text-gray-400">
          Create and send campaigns to confirmed subscribers.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg bg-green-500/10 p-3 text-green-400">
          {success}
        </p>
      )}

      {/* Delivery Results */}
      {results && (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Total Recipients</p>
            <h3 className="mt-2 text-2xl font-bold">
              {results.totalRecipients}
            </h3>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Successful</p>
            <h3 className="mt-2 text-2xl font-bold text-green-400">
              {results.successful}
            </h3>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Failed</p>
            <h3 className="mt-2 text-2xl font-bold text-red-400">
              {results.failed}
            </h3>
          </div>
        </section>
      )}

      {/* Recipients */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-bold">Select Recipients</h4>
            <p className="text-sm text-gray-400">
              {subscribers.length} active subscribers available
            </p>
          </div>

          <button
            type="button"
            onClick={selectAll}
            disabled={loading || subscribers.length === 0 || sending}
            className="rounded-lg bg-[#FF6B00] px-4 py-2 text-sm font-bold disabled:opacity-50"
          >
            {selectedEmails.length === subscribers.length &&
            subscribers.length > 0
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-gray-400">Loading subscribers...</p>
        ) : subscribers.length === 0 ? (
          <p className="mt-4 text-gray-400">
            No confirmed subscribers available.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {subscribers.map((subscriber) => (
              <label
                key={subscriber._id}
                className="flex cursor-pointer items-center gap-3 rounded-lg bg-black/30 p-3"
              >
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(subscriber.email)}
                  onChange={() => toggleSubscriber(subscriber.email)}
                  disabled={sending}
                  className="accent-[#FF6B00]"
                />

                <span className="text-sm">{subscriber.email}</span>
              </label>
            ))}
          </div>
        )}

        <p className="mt-4 text-sm text-[#FF6B00]">
          Selected recipients: {selectedEmails.length}
        </p>
      </section>

      {/* Campaign Editor */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h4 className="font-bold">Create Campaign</h4>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm text-gray-400">Email Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
              placeholder="New ISANUSI drop is here!"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Campaign Heading</label>
            <input
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              disabled={sending}
              placeholder="The next drop has arrived."
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Email Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              rows={6}
              placeholder="Write your campaign message..."
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-gray-400">Campaign Preview</p>

            <h3 className="mt-3 text-xl font-black text-[#FF6B00]">
              {heading || "Your campaign heading"}
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/70">
              {message || "Your campaign message will appear here."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSendCampaign}
            disabled={
              sending ||
              loading ||
              selectedEmails.length === 0 ||
              subscribers.length === 0
            }
            className="w-full rounded-lg bg-[#FF6B00] px-6 py-4 font-black uppercase transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending Campaign..." : "Send Campaign"}
          </button>
        </div>
      </section>

      {/* Campaign History */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-bold">Campaign History</h4>

          <button
            type="button"
            onClick={loadCampaignHistory}
            className="text-sm text-[#FF6B00] hover:underline"
          >
            Refresh
          </button>
        </div>

        {campaigns.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">
            No campaigns have been sent yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="rounded-lg border border-white/10 bg-black/30 p-4"
              >
                <h5 className="font-bold">{campaign.subject}</h5>

                <p className="mt-1 text-sm text-gray-400">
                  {new Date(campaign.createdAt).toLocaleString("en-ZA")}
                </p>

                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span>
                    Recipients: {campaign.totalRecipients}
                  </span>

                  <span className="text-green-400">
                    Sent: {campaign.successful}
                  </span>

                  <span className="text-red-400">
                    Failed: {campaign.failed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}