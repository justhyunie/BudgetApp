import { useState } from "react";

import { api } from "../../utils/api";
import { money } from "../../utils/formatting";
import WealthAccountModal from "./WealthAccountModal";

export default function WealthAccounts({
  accounts = [],
  setAccounts,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const assetAccounts = accounts.filter(
    (account) => account.type !== "liability",
  );

  const liabilityAccounts = accounts.filter(
    (account) => account.type === "liability",
  );

  function openAdd() {
    setError("");
    setModalOpen(true);
  }

  async function updateAccount(id, value) {
    try {
      const updated = await api(
        `/api/accounts/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            balance: Number(value),
          }),
        },
      );

      setAccounts((current) =>
        current.map((account) =>
          account.id === id
            ? updated
            : account,
        ),
      );

      setError("");
    } catch (error) {
      console.error(error);
      setError(
        error.message ||
          "Failed to update account.",
      );
    }
  }

  async function deleteAccount(account) {
    if (
      !window.confirm(
        `Delete "${account.name}"?`,
      )
    ) {
      return;
    }

    try {
      await api(
        `/api/accounts/${account.id}`,
        {
          method: "DELETE",
        },
      );

      setAccounts((current) =>
        current.filter(
          (item) => item.id !== account.id,
        ),
      );

      setError("");
    } catch (error) {
      console.error(error);
      setError(
        error.message ||
          "Failed to delete account.",
      );
    }
  }

  async function saveAccount(formData) {
    try {
      const created = await api(
        "/api/accounts",
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
      );

      setAccounts((current) => [
        ...current,
        created,
      ]);

      setModalOpen(false);
      setError("");
    } catch (error) {
      console.error(error);
      setError(
        error.message ||
          "Failed to create account.",
      );
    }
  }

  function renderAccount(account) {
    const liability =
      account.type === "liability";

    const balance = Math.abs(
      Number(account.balance) || 0,
    );

    return (
      <div
        className="wealth-account"
        key={account.id}
      >
        <div className="wealth-account-info">
          <strong>{account.name}</strong>

          <span>
            {liability
              ? "Liability"
              : "Asset"}
          </span>
        </div>

        <div
          className={`wealth-account-value ${
            liability ? "liability" : ""
          }`}
        >
          {liability ? "-" : ""}
          {money(balance)}
        </div>

        <input
          className="wealth-account-input"
          type="number"
          min="0"
          step="0.01"
          value={account.balance ?? ""}
          onChange={(event) =>
            updateAccount(
              account.id,
              event.target.value,
            )
          }
          aria-label={`${account.name} balance`}
        />

        <button
          className="button button-danger"
          type="button"
          onClick={() =>
            deleteAccount(account)
          }
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="wealth-accounts-header">
        <div>
          <div className="section-kicker">
            Accounts
          </div>

          <h2>Assets & Liabilities</h2>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openAdd}
        >
          + Add Account
        </button>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="wealth-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                What You Own
              </div>

              <h2>Assets</h2>
            </div>
          </div>

          <div className="wealth-account-list">
            {assetAccounts.length === 0 ? (
              <div className="empty-state">
                No assets yet.
              </div>
            ) : (
              assetAccounts.map(
                renderAccount,
              )
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">
                What You Owe
              </div>

              <h2>Liabilities</h2>
            </div>
          </div>

          <div className="wealth-account-list">
            {liabilityAccounts.length === 0 ? (
              <div className="empty-state">
                No liabilities yet.
              </div>
            ) : (
              liabilityAccounts.map(
                renderAccount,
              )
            )}
          </div>
        </section>
      </div>

      {modalOpen && (
        <WealthAccountModal
          onClose={() =>
            setModalOpen(false)
          }
          onSave={saveAccount}
        />
      )}
    </>
  );
}