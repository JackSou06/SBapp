interface ComingSoonPageProps {
  title: string;
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <section className="tool-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tool</p>
          <h2>{title}</h2>
        </div>
      </header>

      <div className="empty-state">
        <div className="empty-icon">+</div>
        <h3>Coming soon</h3>
        <p>This tool is reserved for a later version.</p>
      </div>
    </section>
  );
}
