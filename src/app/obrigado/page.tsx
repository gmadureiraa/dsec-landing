"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ObrigadoPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[var(--background)]/70 border-b border-[var(--border)]/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-center">
          <Image
            src="https://shop.dseclab.io/cdn/shop/files/Logo_DIYSEC_-_Rod_Lage_1684x.png?v=1752180244"
            alt="DSEC Labs"
            width={120}
            height={32}
            className="h-6 w-auto"
            unoptimized
          />
        </div>
      </nav>

      <div
        className={`max-w-lg space-y-8 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Checkmark */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--orange)]/10 border-2 border-[var(--orange)]/30">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--orange)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Inscrição confirmada.
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            O <strong className="text-[var(--foreground)]">Dia 1</strong> do mini-curso já está a caminho do seu e-mail.
            Se não encontrar, confira a caixa de spam.
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-[var(--border)] mx-auto" />

        {/* Telegram CTA */}
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            Enquanto o primeiro e-mail chega, entre no nosso grupo exclusivo no Telegram para participar de
            {" "}<strong className="text-[var(--foreground)]">sorteios</strong> e ter acesso a{" "}
            <strong className="text-[var(--foreground)]">descontos exclusivos em taxas</strong>.
          </p>

          <a
            href="https://t.me/+EIsXiMV2S-A0OGI5"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_24px_rgba(42,171,238,0.3)] hover:-translate-y-0.5 group"
          >
            {/* Telegram icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Entrar no grupo do Telegram
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-1"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>

          <p className="text-xs text-[var(--muted)]">
            Sorteios, descontos em taxas, alertas de segurança. Zero spam.
          </p>
        </div>

        {/* What to expect */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-left space-y-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            O que vai acontecer nos próximos 5 dias:
          </p>
          <div className="space-y-3">
            {[
              { day: "Dia 1", title: "Por que privacidade financeira importa" },
              { day: "Dia 2", title: "O risco real das exchanges — do Plano Collor à FTX" },
              { day: "Dia 3", title: "Como comprar Bitcoin sem expor seus dados" },
              { day: "Dia 4", title: "Self-custody — configure sua cold wallet em 30 min" },
              { day: "Dia 5", title: "O fluxo completo — soberania Bitcoin em 5 passos" },
            ].map((item) => (
              <div key={item.day} className="flex gap-3 items-start">
                <span className="text-xs font-mono text-[var(--orange)] bg-[var(--orange)]/10 px-2 py-0.5 rounded shrink-0">
                  {item.day}
                </span>
                <p className="text-sm text-[var(--muted)]">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <a
          href="/"
          className="inline-block text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← Voltar para a página inicial
        </a>
      </div>
    </main>
  );
}
