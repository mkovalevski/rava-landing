// Yandex "Я" wordmark, drawn as a path so it inherits currentColor.
export function YandexIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.9 3.6h-2.4c-2.6 0-4.7 2-4.7 4.9 0 2 .9 3.4 2.5 4.4l-2.9 5.4c-.2.4 0 .7.4.7h1.6c.3 0 .5-.1.6-.4l2.6-5h.9v5c0 .2.2.4.4.4h1.4c.2 0 .4-.2.4-.4V4c0-.2-.2-.4-.8-.4Zm-1 7.7h-.9c-1.4 0-2.4-.9-2.4-2.9 0-2 1.1-2.9 2.3-2.9h1v5.8Z" />
    </svg>
  );
}
