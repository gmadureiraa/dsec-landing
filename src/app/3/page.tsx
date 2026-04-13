"use client";

import { useState } from "react";
import Image from "next/image";

function EmailForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmail("");
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu melhor e-mail" required className="w-full px-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--orange)] transition-colors" />
      <button type="submit" className="w-full py-3.5 bg-[var(--orange)] text-[var(--background)] font-semibold rounded-lg hover:brightness-110 transition-all">
        {sent ? "Pronto! Verifique seu e-mail." : "Descobrir o método em 5 dias"}
      </button>
      <p className="text-xs text-[var(--muted)] text-center">1 email por dia, durante 5 dias. Sem spam. Sem pedir CPF.</p>
    </form>
  );
}

export default function Variant3() {
  return (
    <main>
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[var(--background)]/70 border-b border-[var(--border)]/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Image src="https://shop.dseclab.io/cdn/shop/files/Logo_DIYSEC_-_Rod_Lage_1684x.png?v=1752180244" alt="DSEC Labs" width={120} height={32} className="h-6 w-auto" unoptimized />
          <span className="text-xs font-[family-name:var(--font-geist-mono)] text-[var(--muted)]">Variante 3 — Medo + Solução</span>
        </div>
      </nav>

      <section className="min-h-screen flex items-center pt-14">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="text-xs font-[family-name:var(--font-geist-mono)] text-red-400/80 tracking-widest uppercase mb-6 animate-fade-up">
              US$ 2.9 bilhões roubados de exchanges em 2025
            </p>
            <h1 className="text-4xl md:text-[3.5rem] font-bold tracking-tight leading-[1.08] mb-6 animate-fade-up animate-delay-1">
              93% dos fundos roubados{" "}
              <span className="text-red-400">nunca são recuperados.</span>{" "}
              <span className="text-[var(--orange)]">Os seus estão protegidos?</span>
            </h1>
            <p className="text-lg text-[var(--muted)] leading-relaxed mb-10 max-w-lg animate-fade-up animate-delay-2">
              Em 5 dias, você aprende a comprar Bitcoin sem deixar rastro e guardar onde nenhum hacker, governo ou exchange consegue tocar. Curso gratuito por e-mail.
            </p>
            <div className="animate-fade-up animate-delay-3"><EmailForm /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
