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
        {sent ? "Pronto! Verifique seu e-mail." : "Quero aprender — é grátis"}
      </button>
      <p className="text-xs text-[var(--muted)] text-center">1 email por dia, durante 5 dias. Sem spam. Sem pedir CPF.</p>
    </form>
  );
}

export default function Variant1() {
  return (
    <main>
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[var(--background)]/70 border-b border-[var(--border)]/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Image src="https://shop.dseclab.io/cdn/shop/files/Logo_DIYSEC_-_Rod_Lage_1684x.png?v=1752180244" alt="DSEC Labs" width={120} height={32} className="h-6 w-auto" unoptimized />
          <span className="text-xs font-[family-name:var(--font-geist-mono)] text-[var(--muted)]">Variante 1 — Original</span>
        </div>
      </nav>

      <section className="min-h-screen flex items-center pt-14">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="text-xs font-[family-name:var(--font-geist-mono)] text-[var(--muted)] tracking-widest uppercase mb-6 animate-fade-up">
              Curso gratuito · 5 dias · 0 documentos enviados
            </p>
            <h1 className="text-4xl md:text-[3.5rem] font-bold tracking-tight leading-[1.08] mb-6 animate-fade-up animate-delay-1">
              Compre Bitcoin de forma{" "}
              <span className="text-[var(--orange)]">100% privada</span>
            </h1>
            <p className="text-lg text-[var(--muted)] leading-relaxed mb-10 max-w-lg animate-fade-up animate-delay-2">
              Do zero ao setup completo de auto-custódia em 5 dias. Direto no seu e-mail. Sem KYC. Sem intermediários.
            </p>
            <div className="animate-fade-up animate-delay-3"><EmailForm /></div>
          </div>
        </div>
      </section>
    </main>
  );
}
