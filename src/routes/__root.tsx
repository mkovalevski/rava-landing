import { useState } from "react";
import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";

import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Splash } from "@/components/splash/Splash";
import { RavaTweaks } from "@/components/tweaks/RavaTweaks";
import { AuthProvider } from "@/auth/AuthContext";

const SPLASH_KEY = "rava_splash_seen";

// Auth / app routes own their full chrome — no marketing nav, footer or splash.
const APP_ROUTES = ["/login", "/register", "/profile"];

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAppRoute = APP_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const [splashDone, setSplashDone] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(SPLASH_KEY) === "1",
  );
  const [showSplash, setShowSplash] = useState(true);

  const resetSplash = () => {
    sessionStorage.removeItem(SPLASH_KEY);
    setSplashDone(false);
  };

  if (isAppRoute) {
    return (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
