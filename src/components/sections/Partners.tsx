import { partners } from "@/data/partners";

export function Partners() {
  return (
    <section className="section" id="partners">
      <div className="container">
        <div className="section-head reveal">
          <div className="title">
            <span className="eyebrow">05 — Партнёры</span>
            <h2>С кем мы работаем</h2>
          </div>
          <p className="desc">
            Лечебные учреждения, производители оборудования, образовательные центры
            и научные организации, поддерживающие миссию ассоциации.
          </p>
        </div>

        <div className="partners-grid reveal">
          {partners.map((name) => (
            <div className="partner" key={name}>
              <div className="partner-logo">
                <div className="shape" />
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
