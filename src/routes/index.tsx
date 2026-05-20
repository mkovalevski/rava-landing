import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Mission } from "@/components/sections/Mission";
import { President } from "@/components/sections/President";
import { Committee } from "@/components/sections/Committee";
import { Partners } from "@/components/sections/Partners";
import { News } from "@/components/sections/News";
import { Contacts } from "@/components/sections/Contacts";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function LandingPage() {
  useScrollReveal();

  return (
    <>
      <Hero />
      <About />
      <Mission />
      <President />
      <Committee />
      <Partners />
      <News />
      <Contacts />
    </>
  );
}

export const Route = createFileRoute("/")({
  component: LandingPage,
});
