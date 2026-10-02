export default function Modal({
  title,
  kicker,
  children,
  actions,
  close,
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={close}
    >
      <div
        className="modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            {kicker && (
              <div className="section-kicker">
                {kicker}
              </div>
            )}

            <h2>{title}</h2>
          </div>

          <button
            className="modal-close"
            type="button"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {children}

        {actions && (
          <div className="modal-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}