import { Link } from "@tanstack/react-router";

import { navItems } from "@/data/nav";
import { smoothScrollToId, smoothScrollToTop } from "@/lib/scroll";
import { ArrowIcon } from "@/components/icons/ArrowIcon";
import { useAuth } from "@/auth/AuthContext";

export function Nav() {
  const { status, user } = useAuth();

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
      <div className="nav-actions">
        {status === "authed" ? (
          <Link to="/profile" className="nav-account" aria-label="Личный кабинет">
            <span className="nav-account-avatar" aria-hidden="true">
              {initials(user?.name)}
            </span>
            <span className="nav-account-label">Кабинет</span>
          </Link>
        ) : (
          <Link to="/login" className="nav-link nav-login">
            Войти
          </Link>
        )}
        <button className="btn btn-primary nav-cta" onClick={() => smoothScrollToId("contacts")}>
          Контакты
          <ArrowIcon />
        </button>
      </div>
    </nav>
  );
}

function initials(name?: string) {
  if (!name) return "RA";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
