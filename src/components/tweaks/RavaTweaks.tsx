import { useEffect } from "react";
import {
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakRadio,
  TweakToggle,
} from "./TweaksPanel";
import { useTweaks } from "./useTweaks";

const DENSITY_MAP: Record<Density, { sp10: string; sp9: string }> = {
  compact: { sp10: "88px", sp9: "64px" },
  comfortable: { sp10: "128px", sp9: "96px" },
  spacious: { sp10: "168px", sp9: "128px" },
};

type Density = "compact" | "comfortable" | "spacious";

const DEFAULTS = {
  accent: "#E84B3C",
  brand: "#0B3D6B",
  density: "comfortable" as Density,
  showSplash: true,
};

type Props = { onResetSplash: () => void; onShowSplashChange: (v: boolean) => void };

export function RavaTweaks({ onResetSplash, onShowSplashChange }: Props) {
  const [t, setTweak] = useTweaks(DEFAULTS);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand", t.brand);
    root.style.setProperty("--accent", t.accent);
    const d = DENSITY_MAP[t.density];
    root.style.setProperty("--sp-10", d.sp10);
    root.style.setProperty("--sp-9", d.sp9);
  }, [t]);

  useEffect(() => {
    onShowSplashChange(t.showSplash);
  }, [t.showSplash, onShowSplashChange]);

  return (
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
          onClick={onResetSplash}
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
  );
}
