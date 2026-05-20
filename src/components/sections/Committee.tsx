import { committeeMembers } from "@/data/committee";

export function Committee() {
  return (
    <section
      className="section"
      id="committee"
      style={{ background: "linear-gradient(180deg, #EFEAE2 0%, var(--bg) 100%)" }}
    >
      <div className="container">
        <div className="section-head reveal">
          <div className="title">
            <span className="eyebrow">04 — Научный комитет</span>
            <h2>Состав научного комитета</h2>
          </div>
          <p className="desc">
            Шесть ведущих специалистов, формирующих стратегию ассоциации.
            Полный список членов и контакты — в личных карточках.
          </p>
        </div>

        <div className="committee-grid">
          {committeeMembers.map((member, i) => (
            <div className="member-card reveal" key={member.name} style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="member-portrait">
                <div className="initials" aria-hidden="true">
                  {member.init}
                </div>
                <div className="tag">портрет</div>
              </div>
              <div className="member-name">{member.name}</div>
              <div className="member-title">{member.title}</div>
              <div className="member-city">{member.city}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
