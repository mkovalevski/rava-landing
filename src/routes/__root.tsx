import { useState } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Splash } from "@/components/splash/Splash";
import { RavaTweaks } from "@/components/tweaks/RavaTweaks";

const SPLASH_KEY = "rava_splash_seen";

function RootLayout() {
  const [splashDone, setSplashDone] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(SPLASH_KEY) === "1",
  );
  const [showSplash, setShowSplash] = useState(true);

  const resetSplash = () => {
    sessionStorage.removeItem(SPLASH_KEY);
    setSplashDone(false);
  };

  return (
    <>
      {!splashDone && showSplash && <Splash onDone={() => setSplashDone(true)} />}
      <ScrollProgress />
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
      {import.meta.env.DEV && (
        <RavaTweaks onResetSplash={resetSplash} onShowSplashChange={setShowSplash} />
      )}
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
