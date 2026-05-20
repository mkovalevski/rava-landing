import { navItems } from "@/data/nav";
import { smoothScrollToId, smoothScrollToTop } from "@/lib/scroll";
import { ArrowIcon } from "@/components/icons/ArrowIcon";

export function Nav() {
  return (
    <nav className="nav" aria-label="Основная навигация">
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
        <span className="nav-logo-text">RAVA</span>
      </a>
      <div className="nav-links">
        {navItems.map((item) => (
          <span key={item.id} className="nav-link" onClick={() => smoothScrollToId(item.id)}>
            {item.label}
          </span>
        ))}
      </div>
      <button className="btn btn-primary nav-cta" onClick={() => smoothScrollToId("contacts")}>
        Контакты
        <ArrowIcon />
      </button>
    </nav>
  );
}
