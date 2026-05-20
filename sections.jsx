/* global React */
const { useEffect, useState, useRef, useMemo } = React;

/* ===================== NAV ===================== */
function Nav() {
  const items = [
    { id: "about", label: "Об ассоциации" },
    { id: "mission", label: "Миссия" },
    { id: "president", label: "Руководство" },
    { id: "committee", label: "Комитет" },
    { id: "partners", label: "Партнёры" },
    { id: "news", label: "Новости" },
  ];
  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <nav className="nav" aria-label="Основная навигация">
      <a className="nav-logo" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <div className="nav-logo-mark" aria-hidden="true"><span>R</span></div>
        <span className="nav-logo-text">RAVA</span>
      </a>
      <div className="nav-links">
        {items.map((it) => (
          <span key={it.id} className="nav-link" onClick={() => go(it.id)}>{it.label}</span>
        ))}
      </div>
      <button className="btn btn-primary nav-cta" onClick={() => go("contacts")}>
        Контакты
        <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </nav>
  );
}

/* ===================== HERO ===================== */
function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg className="hero-vessels" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
        {/* Network background */}
        <g className="hero-network-group">
          <path className="hero-network" d="M 60 80 Q 220 140 360 200 T 560 320" />
          <path className="hero-network" d="M 540 60 Q 380 180 280 280 T 80 540" />
          <path className="hero-network" d="M 60 420 Q 240 380 380 360 T 560 420" />
          <path className="hero-network" d="M 300 60 Q 320 180 320 280 T 320 540" />
          <path className="hero-network" d="M 140 300 Q 220 320 300 320 T 460 300" />
        </g>

        {/* Static thick vessels */}
        <path d="M 0 380 Q 120 360 240 350 T 480 320 T 600 280"
          stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none" />
        <path d="M 600 480 Q 480 460 360 440 T 140 380 T 0 320"
          stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />

        {/* Animated pulses */}
        <path className="hero-pulse"
          d="M 0 380 Q 120 360 240 350 T 480 320 T 600 280" />
        <path className="hero-pulse delay"
          d="M 600 480 Q 480 460 360 440 T 140 380 T 0 320" />
        <path className="hero-pulse delay2"
          d="M 80 80 Q 200 200 320 280 T 560 480" stroke="rgba(232,75,60,0.9)" />

        {/* Nodes */}
        <circle className="hero-node" cx="240" cy="350" r="4" />
        <circle className="hero-node" cx="480" cy="320" r="4" />
        <circle className="hero-node" cx="360" cy="440" r="4" />
        <circle className="hero-node" cx="140" cy="380" r="4" />
        <circle className="hero-node-pulse" cx="320" cy="280" r="6" />
        <circle className="hero-node-pulse" cx="460" cy="300" r="6" style={{ animationDelay: "-1.2s" }} />
      </svg>
      <div className="hero-visual-badge">
        <div>
          <div className="lab">Vascular Access</div>
          <div className="val">Сосудистый доступ</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="lab">est.</div>
          <div className="val">2026</div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container">
        <div className="hero-grid">
          <div>
            <span className="eyebrow">RAVA · Russian Association of Vascular Access</span>
            <h1 className="hero-title">
              Профессиональное сообщество <span className="accent">сосудистого доступа</span> в России
            </h1>
            <p className="lead hero-lead">
              Объединяем клиницистов, исследователей и инженеров вокруг безопасных
              и эффективных практик венозного и артериального доступа — от стандартов
              процедур до образования и научных исследований.
            </p>
            <div className="hero-ctas">
              <a className="btn btn-primary" href="#about" onClick={(e) => { e.preventDefault(); document.getElementById("about").scrollIntoView({ behavior: "smooth" }); }}>
                Об ассоциации
                <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <a className="btn btn-ghost" href="#contacts" onClick={(e) => { e.preventDefault(); document.getElementById("contacts").scrollIntoView({ behavior: "smooth" }); }}>
                Присоединиться
              </a>
            </div>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <div className="num">12<span className="unit">регионов</span></div>
                <div className="lbl">География участников</div>
              </div>
              <div className="hero-meta-item">
                <div className="num">200<span className="unit">+</span></div>
                <div className="lbl">Специалистов в составе</div>
              </div>
              <div className="hero-meta-item">
                <div className="num">4</div>
                <div className="lbl">Направления работы</div>
              </div>
            </div>
          </div>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

/* ===================== ABOUT ===================== */
function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-head reveal">
          <div className="title">
            <span className="eyebrow">01 — Об ассоциации</span>
            <h2>Сообщество практиков и учёных, объединённое одной темой</h2>
          </div>
          <p className="desc">
            Российская ассоциация специалистов сосудистого доступа (RAVA) — некоммерческая
            профессиональная организация. Мы развиваем стандарты, образование и
            научный обмен в области венозного и артериального доступа.
          </p>
        </div>

        <div className="about-grid" style={{ marginTop: 56 }}>
          <div className="about-quote reveal">
            «Безопасный сосудистый доступ — это не отдельная манипуляция,
            а <em>система решений</em>: оборудование, протокол, команда и сопровождение пациента».
          </div>
          <div className="about-paragraphs reveal">
            <p>
              Ассоциация создана для того, чтобы российская медицинская практика
              опиралась на современную доказательную базу. Мы переводим международные
              рекомендации, адаптируем их к нашим условиям и формируем собственные
              протоколы там, где это необходимо.
            </p>
            <p>
              В нашем составе — анестезиологи-реаниматологи, нефрологи, онкологи,
              сосудистые хирурги, медицинские сёстры и инженеры. Мы убеждены,
              что качественный сосудистый доступ — это командная работа.
            </p>
            <p>
              RAVA проводит научно-практические конференции, обучающие курсы и
              мастер-классы по ультразвуковой навигации, тоннелированию катетеров,
              профилактике инфекций и осложнений.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== MISSION ===================== */
function Mission() {
  const items = [
    {
      num: "M / 01",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18M3 12h18" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
      title: "Стандарты",
      text: "Разработка и адаптация клинических рекомендаций по сосудистому доступу для российской практики.",
    },
    {
      num: "M / 02",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h18M3 12h18M3 17h12" />
        </svg>
      ),
      title: "Образование",
      text: "Очные и онлайн-курсы, симуляционные тренинги, мастер-классы для врачей и медсестёр.",
    },
    {
      num: "M / 03",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19V5l8 4 8-4v14l-8-4-8 4z" />
        </svg>
      ),
      title: "Исследования",
      text: "Поддержка мультицентровых исследований, регистров, публикаций в рецензируемых журналах.",
    },
    {
      num: "M / 04",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="8" r="3.5" />
          <circle cx="17" cy="10" r="2.8" />
          <path d="M3 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5M13 20c0-2.1 1.8-3.8 4-3.8s4 1.7 4 3.8" />
        </svg>
      ),
      title: "Сообщество",
      text: "Площадка для обмена опытом — конференции, рабочие группы, наставничество.",
    },
    {
      num: "M / 05",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s-7-4.5-7-12a7 7 0 0 1 14 0c0 7.5-7 12-7 12z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      ),
      title: "Регионы",
      text: "Развитие компетенций в регионах: выездные школы, телементорство, локальные отделения.",
    },
    {
      num: "M / 06",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h4l2-6 4 12 2-6h6" />
        </svg>
      ),
      title: "Безопасность пациента",
      text: "Снижение частоты осложнений, аудит практик, поддержка отчётности и обратной связи.",
    },
  ];

  return (
    <section className="section" id="mission" style={{ background: "linear-gradient(180deg, var(--bg) 0%, #EFEAE2 100%)" }}>
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
          {items.map((it, i) => (
            <div className="mission-card reveal" key={i} style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="icon">{it.icon}</div>
              <div className="num">{it.num}</div>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== PRESIDENT ===================== */
function President() {
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

/* ===================== COMMITTEE ===================== */
function Committee() {
  const members = [
    { name: "Петров П. П.", title: "Вице-президент. Анестезиология и реаниматология", city: "Москва", init: "ПП" },
    { name: "Сидорова А. М.", title: "Учёный секретарь. Сосудистая хирургия", city: "Санкт-Петербург", init: "СА" },
    { name: "Кузнецов Д. В.", title: "Руководитель образовательного направления. Нефрология", city: "Казань", init: "КД" },
    { name: "Морозова Е. С.", title: "Председатель сестринской секции. Реанимация", city: "Новосибирск", init: "МЕ" },
    { name: "Волков А. Н.", title: "Куратор исследовательских программ. Онкология", city: "Екатеринбург", init: "ВА" },
    { name: "Новикова Т. И.", title: "Председатель комитета по аудиту. Педиатрия", city: "Краснодар", init: "НТ" },
  ];
  return (
    <section className="section" id="committee" style={{ background: "linear-gradient(180deg, #EFEAE2 0%, var(--bg) 100%)" }}>
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
          {members.map((m, i) => (
            <div className="member-card reveal" key={i} style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="member-portrait">
                <div className="initials" aria-hidden="true">{m.init}</div>
                <div className="tag">портрет</div>
              </div>
              <div className="member-name">{m.name}</div>
              <div className="member-title">{m.title}</div>
              <div className="member-city">{m.city}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== PARTNERS ===================== */
function Partners() {
  const partners = ["МЕДКЛИН", "Артек-Мед", "VENA group", "Кардиолайн", "Госпиталь №7", "БиоТек", "InVent", "СомаЛаб"];
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
          {partners.map((p, i) => (
            <div className="partner" key={i}>
              <div className="partner-logo">
                <div className="shape"></div>
                {p}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== NEWS ===================== */
function News() {
  const items = [
    { date: "12 июня 2026", label: "Конференция", title: "I Всероссийский конгресс RAVA", excerpt: "Сочи, 12–14 июня. Регистрация открыта для членов ассоциации и приглашённых специалистов." },
    { date: "28 апреля 2026", label: "Курс", title: "УЗИ-навигация центрального доступа", excerpt: "Двухдневный симуляционный курс в Казани. Ограниченное количество мест." },
    { date: "15 марта 2026", label: "Публикация", title: "Рекомендации по PICC-катетерам", excerpt: "Опубликована первая версия клинических рекомендаций RAVA по периферически-имплантируемым центральным катетерам." },
  ];
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
          {items.map((n, i) => (
            <article className="news-card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="news-thumb">
                <div className="label">{n.label}</div>
              </div>
              <div className="news-body">
                <div className="news-date">{n.date}</div>
                <div className="news-title">{n.title}</div>
                <div className="news-excerpt">{n.excerpt}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== CONTACTS + SOCIAL ===================== */
function Contacts() {
  return (
    <section className="section" id="contacts">
      <div className="container">
        <div className="section-head reveal">
          <div className="title">
            <span className="eyebrow">07 — Контакты</span>
            <h2>Связаться с ассоциацией</h2>
          </div>
          <p className="desc">
            Для членства, партнёрства, образовательных запросов и прессы.
            Мы отвечаем в течение трёх рабочих дней.
          </p>
        </div>

        <div className="contacts-grid">
          <div className="contact-card reveal">
            <span className="eyebrow" style={{ color: "rgba(255,255,255,0.55)" }}>офис</span>
            <h2 style={{ marginTop: 14, fontSize: "clamp(28px, 3vw, 40px)" }}>Российская ассоциация специалистов сосудистого доступа</h2>
            <div className="contact-list">
              <div className="contact-item">
                <div className="lab">Адрес</div>
                <div className="val">Москва, ул. Примерная, д. 1, оф. 100</div>
              </div>
              <div className="contact-item">
                <div className="lab">E-mail</div>
                <a className="val" href="mailto:info@rava.su">info@rava.su</a>
              </div>
              <div className="contact-item">
                <div className="lab">Телефон</div>
                <a className="val" href="tel:+74950000000">+7 (495) 000-00-00</a>
              </div>
              <div className="contact-item">
                <div className="lab">Часы работы</div>
                <div className="val">Пн–Пт, 10:00 — 18:00 МСК</div>
              </div>
              <div className="contact-item">
                <div className="lab">Пресса</div>
                <a className="val" href="mailto:press@rava.su">press@rava.su</a>
              </div>
              <div className="contact-item">
                <div className="lab">Партнёрство</div>
                <a className="val" href="mailto:partners@rava.su">partners@rava.su</a>
              </div>
            </div>
          </div>

          <div className="social-card reveal">
            <span className="eyebrow">соцсети</span>
            <h3 style={{ marginTop: 14 }}>Подписывайтесь, чтобы быть в курсе</h3>
            <div className="social-list">
              <a className="social-row" href="#" aria-label="Telegram">
                <div className="social-icon tg">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.5 4.5 18.7 19.2c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L7.1 13.1l-4.5-1.4c-1-.3-1-1 .2-1.5L20 3.3c.8-.3 1.6.2 1.5 1.2z" /></svg>
                </div>
                <div>
                  <div className="social-name">Telegram</div>
                  <div className="social-handle">@rava_su</div>
                </div>
                <svg className="go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </a>

              <a className="social-row" href="#" aria-label="MAX">
                <div className="social-icon max">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 19V5l5 6 4-4 4 4 5-6v14" /></svg>
                </div>
                <div>
                  <div className="social-name">MAX</div>
                  <div className="social-handle">rava.su</div>
                </div>
                <svg className="go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </a>

              <a className="social-row" href="#" aria-label="YouTube">
                <div className="social-icon yt">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" /></svg>
                </div>
                <div>
                  <div className="social-name">YouTube</div>
                  <div className="social-handle">@rava-su</div>
                </div>
                <svg className="go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== FOOTER ===================== */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="nav-logo" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <div className="nav-logo-mark" aria-hidden="true"><span>R</span></div>
              <span className="nav-logo-text" style={{ color: "#fff" }}>RAVA</span>
            </a>
            <div className="footer-tag">
              Российская ассоциация специалистов сосудистого доступа. Некоммерческая профессиональная организация.
            </div>
          </div>
          <div className="footer-col">
            <h4>Разделы</h4>
            <ul>
              <li><a href="#about">Об ассоциации</a></li>
              <li><a href="#mission">Миссия</a></li>
              <li><a href="#president">Руководство</a></li>
              <li><a href="#committee">Комитет</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Связь</h4>
            <ul>
              <li><a href="mailto:info@rava.su">info@rava.su</a></li>
              <li><a href="mailto:press@rava.su">press@rava.su</a></li>
              <li><a href="tel:+74950000000">+7 (495) 000-00-00</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Документы</h4>
            <ul>
              <li><a href="#">Политика конфиденциальности</a></li>
              <li><a href="#">Согласие на обработку ПДн</a></li>
              <li><a href="#">Пользовательское соглашение</a></li>
              <li><a href="#">Устав ассоциации</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 RAVA · Все права защищены</div>
          <div>rava.su · Сделано в России</div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Hero, About, Mission, President, Committee, Partners, News, Contacts, Footer });
