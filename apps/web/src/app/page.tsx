import Image from "next/image";
import Link from "next/link";

import madridBackground from "./images/madrid.jpg";

import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type SplashPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

export default async function SplashPage({ searchParams }: SplashPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const enterLabel = language === "es" ? "Entrar" : "Enter";

  return (
    <main className="relative min-h-screen overflow-hidden bg-graphite text-soft">
      <Image
        src={madridBackground}
        alt={language === "es" ? "Vista de Madrid" : "Madrid view"}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,12,0.28)_0%,rgba(8,10,12,0.12)_42%,rgba(8,10,12,0.36)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,11,30,0.22),transparent_0_28%),radial-gradient(circle_at_bottom_right,rgba(255,176,0,0.16),transparent_0_24%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1800px] flex-col items-center justify-center px-6 py-8 text-center sm:px-8 md:px-10 md:py-10 3xl:px-14">
        <div className="inline-flex max-w-full flex-col items-center gap-6 md:gap-8">
          <Link
            href={`/landing?lang=${language}`}
            className="inline-flex max-w-full justify-center transition opacity-100 hover:opacity-92"
          >
            <MadridAireWordmark
              className="origin-center scale-[0.9] items-center sm:scale-100 md:scale-[0.72] lg:scale-[0.82] 2xl:scale-[0.92]"
              size="hero"
            />
          </Link>

          <Link
            href={`/landing?lang=${language}`}
            className="inline-flex min-h-14 items-center justify-center self-center rounded-full bg-lime px-8 py-4 text-base font-medium text-graphite shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition hover:bg-[#ebff93] md:min-h-[4.5rem] md:px-12 md:py-5 md:text-lg"
          >
            {enterLabel}
          </Link>
        </div>

        <div className="sr-only">{copy.heroClaim}</div>
      </section>
    </main>
  );
}

