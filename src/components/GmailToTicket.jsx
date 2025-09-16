import { useState, useEffect } from "react";
import * as React from "react";

export function GmailToTicket() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [voicemails, setVoicemails] = useState([]);

  // Fetch voicemails function
  const fetchVoicemails = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/voicemails");
      if (!res.ok) throw new Error("Failed to fetch voicemails");
      const data = await res.json();

      // Ensure we handle the data as an array
      const vmArray = Array.isArray(data.voicemails) ? data.voicemails : data;
      setVoicemails(vmArray);
    } catch (err) {
      console.error(err);
      setVoicemails([]);
    }
  };

  // Fetch voicemails on component mount
  useEffect(() => {
    fetchVoicemails();
  }, []);

  const handleRunWorkflow = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5678/webhook-test/28708565-907e-417a-bc13-5c517d165be7",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Workflow request failed");

      const data = await res.json();
      setMessage("Workflow completed successfully!");

      // Wait a short delay to ensure the workflow inserts data
      setTimeout(() => fetchVoicemails(), 500); // 0.5s delay

      if (data.link) window.open(data.link, "_blank");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100 text-center py-5">
      {/* Header */}
      <header className="mb-4">
        <h1 className="display-4 fw-bold mb-3">Upload Voicemails</h1>
        <p className="lead mb-3">
          This demo shows how you can trigger an <strong>automation</strong> workflow to get real-time insights.
        </p>
      </header>

      {/* Button */}
      <div className="mt-4">
        <button
          onClick={handleRunWorkflow}
          disabled={loading}
          className="btn btn-primary btn-lg"
        >
          {loading ? "Running Workflow..." : "Run Workflow"}
        </button>

        {message && <p className="mt-3 text-muted">{message}</p>}
      </div>

      {/* Display voicemails */}
      <div className="mt-5 w-100">
        <h3>Voicemails from Database</h3>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>Region</th>
              <th>Category</th>
              <th>Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {voicemails.length > 0 ? (
              voicemails.map((v) => (
                <tr key={v._id?.$oid || v._id?.toString()}>
                  <td>{v._id?.$oid || v._id?.toString()}</td>
                  <td>{new Date(v.timestamp).toLocaleString()}</td>
                  <td>{v.region}</td>
                  <td>{v.category}</td>
                  <td>{v.sentiment}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>No voicemails found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
