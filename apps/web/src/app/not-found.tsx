import Link from "next/link";

import { AtmosphericField } from "@/components/AtmosphericField";
import { CinematicOverlay } from "@/components/CinematicOverlay";
import { IsobarLines } from "@/components/IsobarLines";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-graphite text-soft">
      <div className="pointer-events-none absolute inset-0">
        <CinematicOverlay className="absolute inset-0" />
        <AtmosphericField className="absolute inset-x-[-10%] top-[-8%] h-[70vh] opacity-40" />
        <IsobarLines className="absolute inset-0 opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-5 text-center">
        <Link className="glass-panel rounded-full px-4 py-3 shadow-atmosphere" href="/landing">
          <MadridAireWordmark className="items-center" size="compact" />
        </Link>

        <div className="flex flex-col items-center gap-4">
          <p className="font-data text-[7rem] font-bold leading-none tracking-tight text-lime/20 sm:text-[10rem]">
            404
          </p>
          <h1 className="max-w-[18ch] text-2xl font-medium tracking-[-0.02em] text-bone sm:text-3xl">
            Página no encontrada
          </h1>
          <p className="max-w-sm text-base leading-7 text-soft/60">
            Esta ruta no existe en el sistema de monitorización. Puede que haya expirado o la URL sea incorrecta.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-6 py-2.5 text-sm font-medium text-graphite transition hover:bg-[#ebff93]"
            href="/dashboard"
          >
            Panel de control
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/5 px-6 py-2.5 text-sm font-medium text-soft transition hover:bg-white/10"
            href="/map"
          >
            Ver mapa
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/5 px-6 py-2.5 text-sm font-medium text-soft transition hover:bg-white/10"
            href="/stations"
          >
            Estaciones
          </Link>
        </div>

        <p className="text-xs text-soft/30">
          Madrid Aire · Sistema de monitorización NO₂
        </p>
      </div>
    </main>
  );
}
