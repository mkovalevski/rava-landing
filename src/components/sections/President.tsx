export function President() {
  return (
    <section className="section" id="president">
      <div className="container">
        <div className="section-head reveal">
          <div className="title">
            <span className="eyebrow">03 — Президент</span>
            <h2>Руководство ассоциации</h2>
          </div>
          <p className="desc">
            Президент избирается на общем собрании членов ассоциации сроком на три года
            и возглавляет научный совет.
          </p>
        </div>

        <div className="president-card reveal">
          <div className="portrait" role="img" aria-label="Фото президента">
            <div className="ph-text">портрет · 4:5</div>
          </div>
          <div>
            <div className="president-name">Иванов Иван Иванович</div>
            <div className="president-role">Президент RAVA · Председатель научного совета</div>
            <ul className="president-regalia">
              <li>Доктор медицинских наук, профессор</li>
              <li>Заведующий отделением анестезиологии-реаниматологии многопрофильного стационара</li>
              <li>Автор более 120 научных публикаций по теме сосудистого доступа</li>
              <li>Член международного общества WoCoVA, эксперт по ультразвуковой навигации</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
