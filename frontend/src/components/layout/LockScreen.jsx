export default function LockScreen({
  pin,
  setPin,
  unlock,
}) {
  function handleKey(event) {
    if (event.key === "Enter") {
      unlock();
    }
  }

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-logo">B</div>

        <div className="section-kicker">
          Personal Finance
        </div>

        <h1>Budget App</h1>

        <p>
          Enter your PIN to continue.
        </p>

        <input
          className="pin-input"
          type="password"
          inputMode="numeric"
          maxLength="4"
          value={pin}
          onChange={(event) =>
            setPin(
              event.target.value.replace(/\D/g, ""),
            )
          }
          onKeyDown={handleKey}
          autoFocus
        />

        <button
          className="pin-button"
          onClick={unlock}
        >
          Unlock
        </button>
      </div>
    </div>
  );
}