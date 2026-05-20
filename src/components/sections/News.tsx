import { newsItems } from "@/data/news";

export function News() {
  return (
    <section className="section" id="news" style={{ background: "var(--bg-elev)" }}>
      <div className="container">
        <div className="section-head reveal">
          <div className="title">
            <span className="eyebrow">06 — Новости и события</span>
            <h2>Что происходит в ассоциации</h2>
          </div>
          <p className="desc">
            Ближайшие конференции, образовательные мероприятия и публикации.
            Полная лента откроется после запуска официального сайта.
          </p>
        </div>

        <div className="news-grid">
          {newsItems.map((item, i) => (
            <article className="news-card reveal" key={item.title} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="news-thumb">
                <div className="label">{item.label}</div>
              </div>
              <div className="news-body">
                <div className="news-date">{item.date}</div>
                <div className="news-title">{item.title}</div>
                <div className="news-excerpt">{item.excerpt}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
