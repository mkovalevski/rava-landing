import { site } from "@/config/site";
import { ExternalIcon } from "@/components/icons/ArrowIcon";
import { TelegramIcon, MaxIcon, YouTubeIcon } from "@/components/icons/SocialIcons";

export function Contacts() {
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
            <span className="eyebrow" style={{ color: "rgba(255,255,255,0.55)" }}>
              офис
            </span>
            <h2 style={{ marginTop: 14, fontSize: "clamp(28px, 3vw, 40px)" }}>{site.fullName}</h2>
            <div className="contact-list">
              <div className="contact-item">
                <div className="lab">Адрес</div>
                <div className="val">{site.contacts.address}</div>
              </div>
              <div className="contact-item">
                <div className="lab">E-mail</div>
                <a className="val" href={`mailto:${site.contacts.email}`}>
                  {site.contacts.email}
                </a>
              </div>
              <div className="contact-item">
                <div className="lab">Телефон</div>
                <a className="val" href={`tel:${site.contacts.phoneRaw}`}>
                  {site.contacts.phone}
                </a>
              </div>
              <div className="contact-item">
                <div className="lab">Часы работы</div>
                <div className="val">{site.contacts.hours}</div>
              </div>
              <div className="contact-item">
                <div className="lab">Пресса</div>
                <a className="val" href={`mailto:${site.contacts.press}`}>
                  {site.contacts.press}
                </a>
              </div>
              <div className="contact-item">
                <div className="lab">Партнёрство</div>
                <a className="val" href={`mailto:${site.contacts.partners}`}>
                  {site.contacts.partners}
                </a>
              </div>
            </div>
          </div>

          <div className="social-card reveal">
            <span className="eyebrow">соцсети</span>
            <h3 style={{ marginTop: 14 }}>Подписывайтесь, чтобы быть в курсе</h3>
            <div className="social-list">
              <a className="social-row" href={site.social.telegram.url} aria-label="Telegram">
                <div className="social-icon tg">
                  <TelegramIcon />
                </div>
                <div>
                  <div className="social-name">Telegram</div>
                  <div className="social-handle">{site.social.telegram.handle}</div>
                </div>
                <ExternalIcon />
              </a>

              <a className="social-row" href={site.social.max.url} aria-label="MAX">
                <div className="social-icon max">
                  <MaxIcon />
                </div>
                <div>
                  <div className="social-name">MAX</div>
                  <div className="social-handle">{site.social.max.handle}</div>
                </div>
                <ExternalIcon />
              </a>

              <a className="social-row" href={site.social.youtube.url} aria-label="YouTube">
                <div className="social-icon yt">
                  <YouTubeIcon />
                </div>
                <div>
                  <div className="social-name">YouTube</div>
                  <div className="social-handle">{site.social.youtube.handle}</div>
                </div>
                <ExternalIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
