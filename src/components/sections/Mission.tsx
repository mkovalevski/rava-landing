import { missionItems } from "@/data/mission";

export function Mission() {
  return (
    <section
      className="section"
      id="mission"
      style={{ background: "linear-gradient(180deg, var(--bg) 0%, #EFEAE2 100%)" }}
    >
      <div className="container">
        <div className="section-head reveal">
          <div className="title">
            <span className="eyebrow">02 — Миссия и цели</span>
            <h2>Что мы делаем</h2>
          </div>
          <p className="desc">
            Шесть направлений, в которых ассоциация концентрирует ресурсы.
            Каждое направление курируется профильной рабочей группой.
          </p>
        </div>
        <div className="mission-grid">
          {missionItems.map((item, i) => (
            <div className="mission-card reveal" key={item.num} style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="icon">{item.icon}</div>
              <div className="num">{item.num}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
