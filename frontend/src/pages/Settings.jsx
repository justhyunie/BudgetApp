import { useState } from "react";
import { api } from "../utils/api";

export default function Settings({
  loadData,
  lock,
}) {
  const [apiStatus, setApiStatus] = useState("");
  const [testing, setTesting] = useState(false);

  async function testApi() {
    setTesting(true);
    setApiStatus("");

    try {
      const result = await api("/api/health");

      setApiStatus(
        result?.status === "ok"
          ? "API connection is healthy."
          : "API responded successfully.",
      );
    } catch (error) {
      setApiStatus(
        error.message ||
          "Unable to connect to the API.",
      );
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="page settings-page">
      <header className="page-header">
        <div>
          <div className="section-kicker">
            Configuration
          </div>

          <h1>Settings</h1>

          <p>
            Manage your Budget App environment.
          </p>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Application</h2>

            <p>
              Basic application controls.
            </p>
          </div>
        </div>

        <div className="settings-list">
          <div className="settings-row">
            <div>
              <strong>Refresh Data</strong>

              <span>
                Reload all information from the
                server.
              </span>
            </div>

            <button
              className="secondary-button"
              onClick={loadData}
            >
              Refresh
            </button>
          </div>

          <div className="settings-row">
            <div>
              <strong>API Connection</strong>

              <span>
                Check communication with the
                backend.
              </span>
            </div>

            <button
              className="secondary-button"
              onClick={testApi}
              disabled={testing}
            >
              {testing
                ? "Testing..."
                : "Test API"}
            </button>
          </div>

          {apiStatus && (
            <div className="settings-status">
              {apiStatus}
            </div>
          )}

          <div className="settings-row">
            <div>
              <strong>Lock Application</strong>

              <span>
                Return to the PIN screen.
              </span>
            </div>

            <button
              className="secondary-button"
              onClick={lock}
            >
              Lock
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}