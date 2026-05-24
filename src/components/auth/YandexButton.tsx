import { YANDEX_AUTH_URL } from "@/lib/api";
import { YandexIcon } from "@/components/icons/YandexIcon";

// Full-page navigation (not fetch) — the backend redirects to Yandex and back.
export function YandexButton({ label }: { label: string }) {
  return (
    <a className="btn-yandex" href={YANDEX_AUTH_URL}>
      <span className="btn-yandex-logo" aria-hidden="true">
        <YandexIcon size={16} />
      </span>
      {label}
    </a>
  );
}
