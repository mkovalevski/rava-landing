export function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg className="hero-vessels" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
        <g className="hero-network-group">
          <path className="hero-network" d="M 60 80 Q 220 140 360 200 T 560 320" />
          <path className="hero-network" d="M 540 60 Q 380 180 280 280 T 80 540" />
          <path className="hero-network" d="M 60 420 Q 240 380 380 360 T 560 420" />
          <path className="hero-network" d="M 300 60 Q 320 180 320 280 T 320 540" />
          <path className="hero-network" d="M 140 300 Q 220 320 300 320 T 460 300" />
        </g>

        <path
          d="M 0 380 Q 120 360 240 350 T 480 320 T 600 280"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2.5}
          fill="none"
        />
        <path
          d="M 600 480 Q 480 460 360 440 T 140 380 T 0 320"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={2}
          fill="none"
        />

        <path className="hero-pulse" d="M 0 380 Q 120 360 240 350 T 480 320 T 600 280" />
        <path className="hero-pulse delay" d="M 600 480 Q 480 460 360 440 T 140 380 T 0 320" />
        <path
          className="hero-pulse delay2"
          d="M 80 80 Q 200 200 320 280 T 560 480"
          stroke="rgba(232,75,60,0.9)"
        />

        <circle className="hero-node" cx={240} cy={350} r={4} />
        <circle className="hero-node" cx={480} cy={320} r={4} />
        <circle className="hero-node" cx={360} cy={440} r={4} />
        <circle className="hero-node" cx={140} cy={380} r={4} />
        <circle className="hero-node-pulse" cx={320} cy={280} r={6} />
        <circle className="hero-node-pulse" cx={460} cy={300} r={6} style={{ animationDelay: "-1.2s" }} />
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
