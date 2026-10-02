export default function PageHeader({
  kicker,
  title,
  description,
  action,
}) {
  return (
    <header className="page-header">
      <div>
        {kicker && (
          <div className="section-kicker">
            {kicker}
          </div>
        )}

        <h1>{title}</h1>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {action && (
        <div className="page-header-actions">
          {action}
        </div>
      )}
    </header>
  );
}