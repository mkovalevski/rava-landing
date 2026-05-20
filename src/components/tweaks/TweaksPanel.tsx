import { useEffect, useRef, useState, type ReactNode } from "react";

const STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}
  .twk-seg{display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06)}
  .twk-seg button{flex:1;border:0;background:transparent;color:inherit;font:inherit;font-weight:500;
    min-height:22px;border-radius:6px;cursor:pointer;padding:4px 6px;line-height:1.2}
  .twk-seg button[data-on="1"]{background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12)}
  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:pointer;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}
  .twk-chips{display:flex;gap:6px}
  .twk-chip{flex:1;height:30px;border:0;border-radius:6px;cursor:pointer;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);transition:transform .12s,box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),0 2px 6px rgba(0,0,0,.15)}
  .twk-toggle-btn{appearance:none;border:0;background:transparent;cursor:pointer;
    width:36px;height:36px;border-radius:10px;font-size:18px;
    position:fixed;right:16px;bottom:16px;z-index:2147483645;
    background:rgba(250,249,247,.85);backdrop-filter:blur(12px);
    box-shadow:0 4px 12px rgba(0,0,0,.18);color:#29261b}
`;

type Props = { title?: string; children: ReactNode };

export function TweaksPanel({ title = "Tweaks", children }: Props) {
  const [open, setOpen] = useState(false);
  const dragRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef({ x: 16, y: 16 });

  const clampToViewport = () => {
    const panel = dragRef.current;
    if (!panel) return;
    const PAD = 16;
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + "px";
    panel.style.bottom = offsetRef.current.y + "px";
  };

  useEffect(() => {
    if (!open) return;
    clampToViewport();
    window.addEventListener("resize", clampToViewport);
    return () => window.removeEventListener("resize", clampToViewport);
  }, [open]);

  const onDragStart = (e: React.MouseEvent) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev: MouseEvent) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <>
      <style>{STYLE}</style>
      {!open && (
        <button className="twk-toggle-btn" onClick={() => setOpen(true)} aria-label="Открыть панель настроек">
          ⚙
        </button>
      )}
      {open && (
        <div
          ref={dragRef}
          className="twk-panel"
          style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}
        >
          <div className="twk-hd" onMouseDown={onDragStart}>
            <b>{title}</b>
            <button
              className="twk-x"
              aria-label="Закрыть"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="twk-body">{children}</div>
        </div>
      )}
    </>
  );
}

export function TweakSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="twk-sect">{title}</div>
      {children}
    </>
  );
}

type ColorProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
};

export function TweakColor({ label, value, onChange, options }: ColorProps) {
  return (
    <div className="twk-row">
      <div className="twk-lbl">
        <span>{label}</span>
        <span style={{ color: "rgba(41,38,27,.5)", fontFamily: "monospace" }}>{value}</span>
      </div>
      <div className="twk-chips">
        {options.map((c) => (
          <button
            key={c}
            type="button"
            className="twk-chip"
            data-on={c === value ? "1" : "0"}
            style={{ background: c }}
            onClick={() => onChange(c)}
            aria-label={c}
          />
        ))}
      </div>
    </div>
  );
}

type RadioProps<T extends string> = {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
};

export function TweakRadio<T extends string>({ label, value, onChange, options }: RadioProps<T>) {
  return (
    <div className="twk-row">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <div className="twk-seg">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            data-on={o.value === value ? "1" : "0"}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type ToggleProps = {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
};

export function TweakToggle({ label, value, onChange }: ToggleProps) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <button
        type="button"
        className="twk-toggle"
        data-on={value ? "1" : "0"}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
      >
        <i />
      </button>
    </div>
  );
}
