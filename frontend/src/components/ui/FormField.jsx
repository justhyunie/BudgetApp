export default function FormField({
  label,
  children,
  error,
  hint,
}) {
  return (
    <label className="form-field">
      <span>{label}</span>

      {children}

      {error && (
        <small className="form-error">
          {error}
        </small>
      )}

      {hint && !error && (
        <small className="form-hint">
          {hint}
        </small>
      )}
    </label>
  );
}