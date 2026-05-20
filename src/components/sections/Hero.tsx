import { smoothScrollToId } from "@/lib/scroll";
import { ArrowIcon } from "@/components/icons/ArrowIcon";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
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
              <a
                className="btn btn-primary"
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToId("about");
                }}
              >
                Об ассоциации
                <ArrowIcon />
              </a>
              <a
                className="btn btn-ghost"
                href="#contacts"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToId("contacts");
                }}
              >
                Присоединиться
              </a>
            </div>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <div className="num">
                  12<span className="unit">регионов</span>
                </div>
                <div className="lbl">География участников</div>
              </div>
              <div className="hero-meta-item">
                <div className="num">
                  200<span className="unit">+</span>
                </div>
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
