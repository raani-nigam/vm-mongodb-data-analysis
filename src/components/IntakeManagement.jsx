import React, { useEffect, useState } from "react";

export function IntakeManagement() {
  const [voicemails, setVoicemails] = useState([]);
  const [selectedVm, setSelectedVm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const PAGE_SIZE = 5;

  // Utility to create pill styling
  const pill = (text, bgColor, textColor) => (
    <span
      style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: "5px 12px",
        borderRadius: "50px",
        fontWeight: "bold",
        fontSize: "0.95rem",
        marginRight: "8px",
        display: "inline-block",
        marginBottom: "5px",
      }}
    >
      {text}
    </span>
  );

  // Sentiment badge
  const sentimentBadge = (sentiment) => {
    if (!sentiment) sentiment = "Unknown";
    const color =
      sentiment.toLowerCase() === "positive"
        ? "bg-success text-white"
        : sentiment.toLowerCase() === "negative"
        ? "bg-danger text-white"
        : "bg-secondary text-white";

    return (
      <span className={`badge ${color} px-2 py-1`} style={{ fontSize: "0.85rem" }}>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </span>
    );
  };

  const fetchVoicemails = async (search = "", pageNum = 1) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/voicemails?search=${encodeURIComponent(
          search
        )}&page=${pageNum}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();
      const vmArray = Array.isArray(data.voicemails) ? data.voicemails : data;
      setVoicemails(vmArray);
      setTotalPages(data.totalPages || 1);
      setTotalRecords(data.total || vmArray.length);
      setSelectedVm(vmArray[0] || null);
    } catch (err) {
      console.error(err);
      setVoicemails([]);
      setSelectedVm(null);
      setTotalPages(1);
      setTotalRecords(0);
    }
  };

  useEffect(() => {
    fetchVoicemails(searchTerm, page);
  }, [searchTerm, page]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const getCardBackground = (sentiment) => {
    if (!sentiment) return "#f8f9fa";
    return sentiment.toLowerCase() === "positive" ? "#e6f9ec" : "#fceaea";
  };

  const startRecord = (page - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(page * PAGE_SIZE, totalRecords);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Intake Management</h2>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search voicemails..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Displaying range */}
      <p className="text-muted mb-4">
        Displaying {startRecord}-{endRecord} out of {totalRecords} records
      </p>

      {/* Two-column layout */}
      <div className="row" style={{ minHeight: "500px" }}>
        {/* Left column: small voicemail cards */}
        <div className="col-md-6 d-flex flex-column" style={{ gap: "10px" }}>
          {voicemails?.length > 0 ? (
            voicemails.map((vm) => (
              <div
                key={vm._id?.$oid || vm._id?.toString()}
                className="card shadow-sm flex-grow-1"
                style={{
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "15px",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedVm(vm)}
              >
                <div className="card-body">
                  {pill(`Voicemail: ${vm.category}`, "#e0f7fa", "#00796b")}
                  {pill(`Region: ${vm.region}`, "#fff3e0", "#e65100")}
        
                  <div style={{ marginTop: "5px" }}>Sentiment: {sentimentBadge(vm.sentiment)}</div>
                  {vm.text && (
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVm(vm);
                      }}
                    >
                      Expand
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No voicemails found</p>
          )}
        </div>

        {/* Right column: expanded voicemail */}
        <div className="col-md-6 d-flex flex-column">
          <h6
            style={{
              marginBottom: "10px",
              fontWeight: "bold",
              color: "#555",
              padding: "8px 12px",
              borderRadius: "50px",
              backgroundColor: "#f3f4f6",
              display: "inline-block",
            }}
          >
            Expanded View
          </h6>
          {selectedVm ? (
            <div
              className="card shadow-sm flex-grow-1"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                marginTop: "10px",
              }}
            >
              <div className="card-body">
                {pill(`Voicemail: ${selectedVm.category}`, "#e0f7fa", "#00796b")}
                {pill(`Region: ${selectedVm.region}`, "#fff3e0", "#e65100")}

                <p className="text-muted mt-2" style={{ fontSize: "0.85rem" }}>
                  {new Date(selectedVm.timestamp).toLocaleString()}
                </p>

                <p
                  className="card-text mt-3"
                  style={{ whiteSpace: "pre-line", fontStyle: "italic", fontSize: "0.95rem" }}
                >
                  {selectedVm.text || "No text available"}
                </p>

                <div style={{ marginTop: "10px" }}>
                  Sentiment: {sentimentBadge(selectedVm.sentiment)}
                </div>
              </div>
            </div>
          ) : (
            <p>Select a voicemail to see details</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <button
          className="btn btn-outline-primary"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-outline-primary"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
