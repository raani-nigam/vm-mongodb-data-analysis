import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { IntakeManagement } from "./components/IntakeManagement";
import { GmailToTicket } from "./components/GmailToTicket";
import { Insights } from "./components/Insights";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [voicemails, setVoicemails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual API endpoint
    fetch("/api/voicemails")
      .then((res) => res.json())
      .then((data) => {
        setVoicemails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch voicemails", err);
        setLoading(false);
      });
  }, []);

  return (
    <Router>
      <div className="d-flex vh-100">
        {/* Sidebar */}
        <div className="bg-light border-end p-3" style={{ width: "220px" }}>
          <h4 className="mb-4">Dashboard</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link className="nav-link" to="/intake">Intake Management</Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to="/gmail-to-ticket">GMail to Ticket</Link>
            </li>
            <li className="nav-item mb-2">
              <Link className="nav-link" to="/insights">Insights</Link>
            </li>
          </ul>
        </div>

        {/* Main content */}
        <div className="flex-grow-1 p-4 overflow-auto">
          <Routes>
            <Route path="/" element={<IntakeManagement />} />
            <Route path="/intake" element={<IntakeManagement />} />
            <Route path="/gmail-to-ticket" element={<GmailToTicket />} />
            <Route
              path="/insights"
              element={loading ? <p>Loading voicemails...</p> : <Insights voicemails={voicemails} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
