/* global React */
const { useEffect, useState, useRef } = React;

function Splash({ onDone }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("rava_splash_seen");
    if (seen === "1") {
      onDone();
      return;
    }
    const t = setTimeout(() => {
      setHide(true);
      setTimeout(() => {
        sessionStorage.setItem("rava_splash_seen", "1");
        onDone();
      }, 800);
    }, 3400);
    return () => clearTimeout(t);
  }, [onDone]);

  const skip = () => {
    setHide(true);
    setTimeout(() => {
      sessionStorage.setItem("rava_splash_seen", "1");
      onDone();
    }, 400);
  };

  return (
    <div className={"splash " + (hide ? "fade-out" : "")} role="dialog" aria-label="Загрузка">
      <svg className="splash-canvas" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3DB6C8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3DB6C8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="vesselGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3DB6C8" />
            <stop offset="100%" stopColor="#E84B3C" />
          </linearGradient>
        </defs>

        <circle cx="600" cy="400" r="380" fill="url(#splashGlow)" />

        {/* Vascular network */}
        <g className="vessel-group">
          <path className="vessel-path vessel-anim"
            stroke="rgba(255,255,255,0.18)"
            d="M 100 400 Q 280 380 400 340 T 600 380 T 820 360 T 1100 400" />
          <path className="vessel-path vessel-anim"
            style={{ animationDelay: "0.2s" }}
            stroke="rgba(255,255,255,0.22)"
            d="M 600 100 Q 580 220 600 320 T 600 500 T 600 700" />
          <path className="vessel-path vessel-anim"
            style={{ animationDelay: "0.4s" }}
            stroke="rgba(255,255,255,0.16)"
            d="M 200 200 Q 350 280 480 320 T 720 380 T 1000 200" />
          <path className="vessel-path vessel-anim"
            style={{ animationDelay: "0.5s" }}
            stroke="rgba(255,255,255,0.14)"
            d="M 200 600 Q 350 520 480 480 T 720 420 T 1000 600" />
          <path className="vessel-path vessel-anim"
            style={{ animationDelay: "0.6s", stroke: "url(#vesselGrad)", strokeWidth: 1.8 }}
            d="M 300 700 Q 420 560 520 480 T 700 320 T 900 100" />
          <path className="vessel-path vessel-anim"
            style={{ animationDelay: "0.3s" }}
            stroke="rgba(61,182,200,0.45)"
            d="M 0 480 Q 200 460 360 440 T 600 410" />
          <path className="vessel-path vessel-anim"
            style={{ animationDelay: "0.4s" }}
            stroke="rgba(232,75,60,0.45)"
            d="M 1200 320 Q 1000 340 860 360 T 600 390" />
        </g>

        {/* Nodes */}
        {[
          [400, 340, 0.8], [600, 380, 1.0], [820, 360, 1.2], [600, 320, 1.4],
          [480, 320, 1.0], [720, 380, 1.6], [480, 480, 1.5], [720, 420, 1.7],
        ].map(([cx, cy, delay], i) => (
          <circle key={i} cx={cx} cy={cy} r="4"
            fill={i === 1 ? "#E84B3C" : i === 3 ? "#3DB6C8" : "#fff"}
            className="vessel-node"
            style={{ animationDelay: `${delay}s`, transformOrigin: `${cx}px ${cy}px` }} />
        ))}
      </svg>

      <div className="splash-center">
        <div className="splash-mark" aria-label="RAVA">
          <span>R</span><span>A</span><span>V</span><span>A</span><span className="dot">.</span>
        </div>
        <div className="splash-sub">Российская ассоциация</div>
        <div className="splash-name">специалистов сосудистого доступа</div>
      </div>

      <button className="splash-skip" onClick={skip} type="button">Пропустить ↵</button>
    </div>
  );
}

window.Splash = Splash;
