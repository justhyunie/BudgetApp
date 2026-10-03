import { useState } from "react";

export default function WealthAccountModal({
  onClose,
  onSave,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("asset");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    const numericBalance = Number(balance);

    if (!trimmedName) {
      setError(
        "Account name is required.",
      );
      return;
    }

    if (
      !Number.isFinite(
        numericBalance,
      ) ||
      numericBalance < 0
    ) {
      setError(
        "Balance must be a valid number.",
      );
      return;
    }

    onSave({
      name: trimmedName,
      type,
      balance: numericBalance,
    });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <div className="section-kicker">
              Wealth
            </div>

            <h2>Add Account</h2>
          </div>

          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={handleSubmit}
        >
          <label className="form-field">
            <span>Account Name</span>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="e.g. Fidelity Roth IRA"
              autoFocus
            />
          </label>

          <label className="form-field">
            <span>Account Type</span>

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value,
                )
              }
            >
              <option value="asset">
                Asset
              </option>

              <option value="liability">
                Liability
              </option>
            </select>
          </label>

          <label className="form-field">
            <span>Current Balance</span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={balance}
              onChange={(event) =>
                setBalance(
                  event.target.value,
                )
              }
              placeholder="0.00"
            />
          </label>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="submit"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}