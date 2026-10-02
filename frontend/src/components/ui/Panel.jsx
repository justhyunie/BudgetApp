export default function Panel({
  children,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <section
      className={`panel ${className}`.trim()}
    >
      {(title || description || action) && (
        <div className="panel-header">
          <div>
            {title && <h2>{title}</h2>}

            {description && (
              <p>{description}</p>
            )}
          </div>

          {action && (
            <div className="panel-header-action">
              {action}
            </div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}