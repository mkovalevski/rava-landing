import { smoothScrollToTop } from "@/lib/scroll";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a
              className="nav-logo"
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollToTop();
              }}
            >
              <div className="nav-logo-mark" aria-hidden="true">
                <span>R</span>
              </div>
              <span className="nav-logo-text" style={{ color: "#fff" }}>
                RAVA
              </span>
            </a>
            <div className="footer-tag">
              {site.fullName}. Некоммерческая профессиональная организация.
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
              <li><a href={`mailto:${site.contacts.email}`}>{site.contacts.email}</a></li>
              <li><a href={`mailto:${site.contacts.press}`}>{site.contacts.press}</a></li>
              <li><a href={`tel:${site.contacts.phoneRaw}`}>{site.contacts.phone}</a></li>
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
