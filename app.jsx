/* global React, ReactDOM, Splash, Nav, Hero, About, Mission, President, Committee, Partners, News, Contacts, Footer, useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle */
const { useEffect, useState, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#E84B3C",
  "brand": "#0B3D6B",
  "density": "comfortable",
  "showSplash": true
}/*EDITMODE-END*/;

function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      if (ref.current) ref.current.style.transform = `scaleX(${Math.max(0, Math.min(1, pct))})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" ref={ref}></div>;
}

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [splashDone, setSplashDone] = useState(() => sessionStorage.getItem("rava_splash_seen") === "1" || !TWEAK_DEFAULTS.showSplash);

  // Apply tweaks live as CSS vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand", t.brand);
    root.style.setProperty("--accent", t.accent);
    // density
    const map = { compact: { sp10: "88px", sp9: "64px" }, comfortable: { sp10: "128px", sp9: "96px" }, spacious: { sp10: "168px", sp9: "128px" } };
    const d = map[t.density] || map.comfortable;
    root.style.setProperty("--sp-10", d.sp10);
    root.style.setProperty("--sp-9", d.sp9);
  }, [t]);

  // Reset splash for testing when toggling on
  const resetSplash = () => {
    sessionStorage.removeItem("rava_splash_seen");
    setSplashDone(false);
  };

  useScrollReveal();

  return (
    <>
      {!splashDone && t.showSplash && <Splash onDone={() => setSplashDone(true)} />}
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <About />
        <Mission />
        <President />
        <Committee />
        <Partners />
        <News />
        <Contacts />
      </main>
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Палитра">
          <TweakColor
            label="Основной"
            value={t.brand}
            onChange={(v) => setTweak("brand", v)}
            options={["#0B3D6B", "#1F6F5F", "#2C3E50", "#9E1B32", "#C4501C"]}
          />
          <TweakColor
            label="Акцент"
            value={t.accent}
            onChange={(v) => setTweak("accent", v)}
            options={["#E84B3C", "#3DB6C8", "#F4B400", "#7C3AED", "#0EA371"]}
          />
        </TweakSection>
        <TweakSection title="Плотность">
          <TweakRadio
            label="Spacing"
            value={t.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "compact", label: "Компакт" },
              { value: "comfortable", label: "Норма" },
              { value: "spacious", label: "Воздух" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Заставка">
          <TweakToggle
            label="Показывать при загрузке"
            value={t.showSplash}
            onChange={(v) => setTweak("showSplash", v)}
          />
          <button
            type="button"
            onClick={resetSplash}
            style={{
              marginTop: 8,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#0B3D6B",
              color: "#fff",
              border: "none",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Проиграть заставку снова
          </button>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
