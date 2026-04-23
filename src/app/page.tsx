"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════════════
   RD STATION FORMS — embed oficial + disparo via submit nativo
   A lib oficial renderiza o <form> real em #RD_FORM_ID (fora da viewport).
   Ao submeter o form custom preenchemos os inputs e disparamos submit
   nativo — a lib intercepta e envia pro endpoint oficial com token.
   (Antes fazíamos POST manual pro action, no endpoint errado: leads não
   chegavam ao RD.)
   ═══════════════════════════════════════════════════════════════════ */

const RD_FORM_ID = "forms-captura-leads-x-c92b969c120bb9b7290a";
const RD_SCRIPT_SRC = "https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js";
const RD_SCRIPT_ID = "rdstation-forms-script";

declare global {
  interface Window {
    RDStationForms?: new (id: string, token: string) => { createForm: () => void };
  }
}

function useRDStationEmbed() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const log = (...a: unknown[]) => console.log("[RD]", ...a);
    const ensureForm = () => {
      const container = document.getElementById(RD_FORM_ID);
      if (!container) {
        console.error("[RD] container #" + RD_FORM_ID + " NÃO encontrado");
        return;
      }
      if (container.querySelector("form")) {
        log("form já montado, skip");
        return;
      }
      if (!window.RDStationForms) {
        console.warn("[RD] window.RDStationForms ainda não disponível");
        return;
      }
      try {
        new window.RDStationForms(RD_FORM_ID, "").createForm();
        log("createForm() executado");
      } catch (err) {
        console.error("[RD] createForm() throw:", err);
      }
    };
    if (window.RDStationForms) {
      ensureForm();
      return;
    }
    if (document.getElementById(RD_SCRIPT_ID)) return;
    const s = document.createElement("script");
    s.id = RD_SCRIPT_ID;
    s.src = RD_SCRIPT_SRC;
    s.async = true;
    s.onload = () => {
      log("script carregado, RDStationForms?", !!window.RDStationForms);
      ensureForm();
    };
    s.onerror = (ev) => {
      console.error("[RD] SCRIPT falhou ao carregar", ev);
    };
    document.head.appendChild(s);
  }, []);
}

async function waitForRdForm(timeoutMs = 10_000): Promise<HTMLFormElement | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const container = document.getElementById(RD_FORM_ID);
    const form = container?.querySelector<HTMLFormElement>("form");
    if (form && form.querySelector('input[name="email"]') && form.querySelector('input[name="token_rdstation"]')) {
      return form;
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  return null;
}

function setInputValue(form: HTMLFormElement, selectors: string[], value: string): boolean {
  for (const sel of selectors) {
    const el = form.querySelector<HTMLInputElement>(sel);
    if (el) {
      const proto = Object.getPrototypeOf(el) as typeof HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      setter?.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("blur", { bubbles: true }));
      return true;
    }
  }
  return false;
}

async function submitViaRD(values: {
  email: string;
  phone?: string;
  name?: string;
}): Promise<boolean> {
  const log = (...a: unknown[]) => console.log("[RD]", ...a);
  log("submit iniciado", values);

  const rdForm = await waitForRdForm();
  if (!rdForm) {
    console.error("[RD] form embed não montou em 10s.");
    return false;
  }

  log("form encontrado, action=", rdForm.action);

  setInputValue(rdForm, ['input[name="email"]', 'input[type="email"]'], values.email);
  if (values.phone) {
    setInputValue(
      rdForm,
      [
        'input[name="mobile_phone"]',
        'input[name="celular"]',
        'input[name="whatsapp"]',
        'input[name="telefone"]',
        'input[name="phone"]',
        'input[type="tel"]',
      ],
      values.phone,
    );
  }
  if (values.name) {
    setInputValue(
      rdForm,
      ['input[name="name"]', 'input[name="nome"]', 'input[name="first_name"]'],
      values.name,
    );
  }

  const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
  const dispatched = rdForm.dispatchEvent(submitEvent);
  log("submit dispatched — handled?", !dispatched);

  if (dispatched) {
    const submitBtn = rdForm.querySelector<HTMLButtonElement | HTMLInputElement>(
      'button[type="submit"], input[type="submit"]',
    );
    if (submitBtn) {
      log("fallback: click no botão de submit do form RD");
      submitBtn.click();
    } else {
      console.warn("[RD] submit não interceptado e sem botão fallback");
      return false;
    }
  }

  return true;
}

const DAYS = [
  {
    num: "01",
    title: "Por que privacidade financeira importa",
    preview: "Vigilância financeira, CBDCs e por que ninguém deveria saber exatamente quanto você tem em Bitcoin.",
    img: "/alfred/day1-regulation.jpg",
  },
  {
    num: "02",
    title: "O risco real das exchanges",
    preview: "Do Plano Collor à queda do padrão ouro — o padrão histórico de confisco que se repete em Mt. Gox, FTX e Celsius.",
    img: "/alfred/day2-money.jpg",
  },
  {
    num: "03",
    title: "Como comprar Bitcoin sem expor seus dados",
    preview: "O método P2P direto, sem selfie, sem documento, sem deixar rastro ligando sua identidade às suas moedas.",
    img: "/alfred/day3-exchange.jpg",
  },
  {
    num: "04",
    title: "Self-custody — configure sua cold wallet em 30 min",
    preview: "Passo a passo prático, air-gapped, backup em metal. Seu cofre pessoal saindo hoje.",
    img: "/alfred/day4-security.jpg",
  },
  {
    num: "05",
    title: "O fluxo completo — soberania Bitcoin em 5 passos",
    preview: "Compra privada → cold wallet → backup → verificação → uso real. O sistema fechado do começo ao fim.",
    img: "/alfred/day5-coldkit.jpg",
  },
];

const FAQS = [
  {
    q: "Já comprei na Binance com KYC. Ainda faz sentido pra mim?",
    a: "Faz mais sentido ainda. Seus dados já existem num banco de dados. O curso ensina como a partir de agora suas próximas compras não criem mais registros — e como proteger o que você já tem.",
  },
  {
    q: "É gratuito mesmo? Qual a pegadinha?",
    a: "Nenhuma. A DSEC Labs fabrica hardware de segurança Bitcoin. Quanto mais gente entender self-custody, mais gente precisa de cofres bons. A educação é o marketing.",
  },
  {
    q: "Vou precisar comprar algum equipamento?",
    a: "Não. O curso ensina conceitos que funcionam com qualquer hardware wallet. Se depois quiser conhecer o ColdKit, vai ser uma escolha sua — não uma obrigação.",
  },
  {
    q: "Tenho medo de perder acesso ao meu Bitcoin com self-custody.",
    a: "Esse medo é normal e saudável. O dia 4 do curso é dedicado inteiramente a isso: como fazer backup à prova de incêndio, enchente e esquecimento. Ninguém perde Bitcoin por usar self-custody direito — perde por não usar.",
  },
  {
    q: "Como sei que meu e-mail não vai ser vendido?",
    a: "Somos uma empresa de segurança Bitcoin. Se vazássemos dados de clientes, não teríamos empresa. Privacidade é o nosso produto.",
  },
];

function EmailForm({ variant = "default" }: { variant?: "default" | "compact" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const ok = await submitViaRD({ email, name });
    if (!ok) {
      setStatus("error");
      return;
    }
    setTimeout(() => {
      window.location.href = "/obrigado";
    }, 2500);
  };

  const inputClass = "w-full px-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--orange)] focus:ring-1 focus:ring-[var(--orange)]/20 transition-all text-sm";
  const buttonClass = "w-full py-3.5 bg-[var(--orange)] text-[var(--background)] font-bold rounded-lg hover:brightness-110 hover:shadow-[0_0_20px_rgba(246,145,27,0.3)] transition-all relative overflow-hidden group";

  if (variant === "compact") {
    return (
      <>
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto flex-wrap sm:flex-nowrap">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail"
            required
            disabled={status === "loading"}
            className="flex-1 min-w-[200px] px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--orange)] focus:ring-1 focus:ring-[var(--orange)]/20 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 bg-[var(--orange)] text-[var(--background)] font-semibold text-sm rounded-lg hover:brightness-110 transition-all shrink-0 disabled:opacity-70"
          >
            {status === "loading" ? "Enviando..." : "Proteger meus Bitcoin"}
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          className={inputClass}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu melhor e-mail"
          required
          disabled={status === "loading"}
          className={inputClass + " disabled:opacity-50"}
        />
        <button type="submit" disabled={status === "loading"} className={buttonClass + " disabled:opacity-70"}>
          <span className="relative z-10 flex items-center justify-center gap-2">
            {status === "loading" ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
                Garantindo sua vaga...
              </>
            ) : (
              "Ver o que estão escondendo de mim"
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
        {status === "error" && (
          <p className="text-xs text-red-400 text-center">Erro ao enviar. Tente novamente.</p>
        )}
        <p className="text-xs text-[var(--muted)] text-center">
          1 email por dia, durante 5 dias. Sem spam. Sem pegadinha. Sem pedir CPF.
        </p>
      </form>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border-b border-[var(--border)] transition-colors ${open ? "border-[var(--orange)]/20" : ""}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm font-medium group-hover:text-[var(--orange)] transition-colors pr-4">
          {q}
        </span>
        <span
          className={`text-[var(--muted)] text-lg shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm text-[var(--muted)] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function Home() {
  useRDStationEmbed();
  return (
    <main>
      {/* RD Station — form oficial fora da viewport (precisa ter tamanho
          real pra lib validar; opacity:0 e visibility:hidden podem
          atrapalhar a validação jQuery). */}
      <div
        id={RD_FORM_ID}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: 600,
          height: 600,
          overflow: "hidden",
        }}
      />
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[var(--background)]/70 border-b border-[var(--border)]/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/dsec-logo.png" alt="DSEC Labs" className="h-7 w-auto" />
          </div>
          <a
            href="#start"
            className="text-xs font-semibold bg-[var(--orange)] text-[var(--background)] px-4 py-2 rounded-lg hover:brightness-110 transition-all"
          >
            Quero o curso
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center pt-14 relative overflow-hidden" id="start">
        {/* Deep space background with rotating galaxy */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          {/* Layer 1 — slow rotating star field (galaxy feel) */}
          <div className="absolute inset-[-20%] animate-star-drift" style={{
            backgroundImage: `radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.2) 50%, transparent 50%),
              radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.15) 50%, transparent 50%),
              radial-gradient(1px 1px at 35% 10%, rgba(255,255,255,0.22) 50%, transparent 50%),
              radial-gradient(1px 1px at 45% 60%, rgba(255,255,255,0.12) 50%, transparent 50%),
              radial-gradient(1px 1px at 55% 30%, rgba(255,255,255,0.2) 50%, transparent 50%),
              radial-gradient(1px 1px at 65% 75%, rgba(255,255,255,0.15) 50%, transparent 50%),
              radial-gradient(1px 1px at 75% 15%, rgba(255,255,255,0.18) 50%, transparent 50%),
              radial-gradient(1px 1px at 85% 50%, rgba(255,255,255,0.12) 50%, transparent 50%),
              radial-gradient(1px 1px at 20% 70%, rgba(255,255,255,0.2) 50%, transparent 50%),
              radial-gradient(1px 1px at 40% 85%, rgba(255,255,255,0.15) 50%, transparent 50%),
              radial-gradient(1px 1px at 60% 5%, rgba(255,255,255,0.22) 50%, transparent 50%),
              radial-gradient(1px 1px at 80% 35%, rgba(255,255,255,0.18) 50%, transparent 50%),
              radial-gradient(1px 1px at 10% 55%, rgba(255,255,255,0.12) 50%, transparent 50%),
              radial-gradient(1px 1px at 50% 90%, rgba(255,255,255,0.2) 50%, transparent 50%),
              radial-gradient(1px 1px at 90% 65%, rgba(255,255,255,0.15) 50%, transparent 50%),
              radial-gradient(1px 1px at 30% 40%, rgba(255,255,255,0.1) 50%, transparent 50%),
              radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.18) 50%, transparent 50%)`
          }} />
          {/* Layer 2 — counter-rotating brighter stars */}
          <div className="absolute inset-[-10%] animate-star-drift-reverse animate-twinkle" style={{
            backgroundImage: `radial-gradient(1.5px 1.5px at 12% 25%, rgba(255,255,255,0.3) 50%, transparent 50%),
              radial-gradient(1.5px 1.5px at 38% 15%, rgba(255,255,255,0.25) 50%, transparent 50%),
              radial-gradient(2px 2px at 55% 42%, rgba(255,255,255,0.2) 50%, transparent 50%),
              radial-gradient(1.5px 1.5px at 72% 68%, rgba(255,255,255,0.3) 50%, transparent 50%),
              radial-gradient(2px 2px at 88% 32%, rgba(255,255,255,0.25) 50%, transparent 50%),
              radial-gradient(1.5px 1.5px at 28% 78%, rgba(255,255,255,0.2) 50%, transparent 50%),
              radial-gradient(2px 2px at 18% 50%, rgba(246,145,27,0.2) 50%, transparent 50%),
              radial-gradient(2px 2px at 82% 75%, rgba(246,145,27,0.15) 50%, transparent 50%)`
          }} />
          {/* Static nebula glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_40%,rgba(246,145,27,0.06)_0%,transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_25%,rgba(246,145,27,0.03)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(168,21,128,0.02)_0%,transparent_50%)]" />
          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 relative z-10">
          <div className="max-w-2xl mb-8">
            <h1 className="text-4xl md:text-[3.5rem] font-bold tracking-tight leading-[1.08] mb-3 animate-fade-up">
              Comprar Bitcoin é fácil.
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-[var(--orange)] mb-4 animate-fade-up animate-delay-1">
              Difícil é fazer isso com privacidade e controle real.
            </h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed max-w-lg animate-fade-up animate-delay-1">
              Do zero à privacidade absoluta com o melhor setup de autocustódia. Sem expor seus dados. 100% gratuito.
            </p>
          </div>
          {/* Form + Alfred side by side */}
          <div className="flex flex-col md:flex-row md:items-end gap-6 animate-fade-up animate-delay-3">
            <div className="flex-1 max-w-sm">
              <EmailForm />
            </div>
            <div className="hidden md:block shrink-0">
              <div className="relative animate-float">
                <Image
                  src="/alfred/alfred-hero-privacy.png"
                  alt="Alfred — seu guardião de privacidade"
                  width={160}
                  height={200}
                  className="w-[160px] h-auto"
                  unoptimized
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY JOIN — compelling reasons */}
      <section className="py-20 md:py-28 border-t border-[var(--border)]/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(246,145,27,0.04)_0%,transparent_70%)]" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <p className="text-xs font-[family-name:var(--font-geist-mono)] text-[var(--orange)] tracking-widest uppercase mb-4 animate-fade-up">
              Por que entrar no mini curso
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight max-w-2xl mx-auto animate-fade-up animate-delay-1">
              Porque o que você não sabe sobre seu Bitcoin{" "}
              <span className="text-[var(--orange)]">pode custar tudo.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: "01",
                t: "Você vai entender o jogo que ninguém explica",
                d: "Por que governos estão criando moedas digitais rastreáveis. Por que sua exchange sabe mais sobre você que o seu banco. E por que o sistema financeiro foi transformado em arma geopolítica.",
              },
              {
                icon: "02",
                t: "Vai aprender a comprar sem deixar rastro",
                d: "Passo a passo real de como comprar Bitcoin via PIX sem enviar CPF, selfie ou qualquer documento. P2P direto, com escrow protegendo ambos os lados.",
              },
              {
                icon: "03",
                t: "Vai montar seu próprio cofre digital",
                d: "Em 30 minutos, você configura um dispositivo air-gapped com firmware open-source, backup em metal e transações por QR code. Sem USB. Sem Bluetooth. Sem conexão com nada.",
              },
              {
                icon: "04",
                t: "Vai sair com um setup que funciona pra vida",
                d: "Não é teoria. É o fluxo completo: compra privada → cold wallet → backup em metal → verificação. O mesmo sistema que protege milhões de dólares em Bitcoin no mundo real.",
              },
            ].map((item) => (
              <div
                key={item.t}
                className="group p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/30 hover:border-[var(--orange)]/30 hover:bg-[var(--card)]/60 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <span className="text-[var(--orange)] font-[family-name:var(--font-geist-mono)] text-sm font-bold shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold mb-2 group-hover:text-[var(--orange)] transition-colors">{item.t}</h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{item.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-8 py-8 border-y border-[var(--border)]/30">
            {[
              { n: "100%", l: "Gratuito" },
              { n: "5", l: "Dias de conteúdo" },
              { n: "0", l: "Documentos pedidos" },
              { n: "30 min", l: "Para montar o setup" },
            ].map((s) => (
              <div key={s.l} className="text-center px-4">
                <p className="text-2xl font-bold text-[var(--orange)]">{s.n}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="#start"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--orange)] text-[var(--background)] font-semibold rounded-lg hover:brightness-110 hover:shadow-[0_0_24px_rgba(246,145,27,0.25)] transition-all"
            >
              Quero começar — é grátis
            </a>
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="py-24 md:py-32 border-t border-[var(--border)]/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(246,145,27,0.03)_0%,transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-6 mb-12 relative z-10">
          <p className="text-xs font-[family-name:var(--font-geist-mono)] text-[var(--muted)] tracking-widest uppercase mb-4">
            O que você vai receber
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            5 emails. 5 verdades que mudam como você{" "}
            <span className="text-[var(--orange)]">protege seu dinheiro.</span>
          </h2>
          <p className="text-sm text-[var(--muted)] mt-3">
            Arraste para explorar cada dia →
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 px-6 md:px-[calc((100vw-64rem)/2+1.5rem)] no-scrollbar">
            {DAYS.map((day) => (
              <div
                key={day.num}
                className="group snap-start shrink-0 w-[300px] md:w-[340px] rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--orange)]/40 transition-all"
              >
                {/* Card image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={day.img}
                    alt={`Dia ${day.num}`}
                    width={340}
                    height={255}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 text-[10px] font-[family-name:var(--font-geist-mono)] tracking-widest uppercase bg-[var(--background)]/80 backdrop-blur-sm text-[var(--orange)] px-3 py-1 rounded-full border border-[var(--orange)]/20">
                    Dia {day.num}
                  </span>
                </div>

                {/* Card content */}
                <div className="p-5">
                  <h3 className="text-[15px] font-semibold leading-snug mb-2">
                    {day.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {day.preview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 mt-10 text-center">
          <a
            href="#start"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--orange)] text-[var(--background)] font-semibold rounded-lg hover:brightness-110 transition-all"
          >
            Receber o dia 1 agora
          </a>
        </div>
      </section>

      {/* WHY JOIN — after seeing what's in the course */}
      <section className="py-24 md:py-32 border-t border-[var(--border)]/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-[family-name:var(--font-geist-mono)] text-[var(--muted)] tracking-widest uppercase mb-4">
              Por que isso importa agora
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight max-w-2xl mx-auto">
              US$ 3,4 bilhões roubados em 2025.{" "}
              <span className="text-[var(--orange)]">93% nunca foram recuperados.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "270K",
                color: "text-red-400",
                t: "Clientes com dados vazados",
                d: "Uma fabricante de hardware wallets expôs nome, endereço e patrimônio de 270 mil pessoas. Resultado: phishing, SIM swap, invasões domiciliares. O dado que vaza nunca volta.",
              },
              {
                num: "$8B",
                color: "text-red-400",
                t: "Sumiram da FTX em 72 horas",
                d: "Imóveis de US$ 300M nas Bahamas, doações políticas de US$ 100M, 400 investimentos de venture capital. Tudo com dinheiro dos clientes. O saldo na tela era mentira.",
              },
              {
                num: "72",
                color: "text-[var(--orange)]",
                t: "Ataques físicos em 2026",
                d: "Wrench attacks subiram 75% este ano. Sequestros, invasões, extorsão. Em quase todos os casos, os criminosos sabiam quanto a vítima tinha — dados de KYC vazados.",
              },
            ].map((item) => (
              <div
                key={item.t}
                className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--orange)]/30 transition-all"
              >
                <p className={`text-3xl font-bold mb-3 ${item.color}`}>{item.num}</p>
                <h3 className="text-[15px] font-semibold mb-2">{item.t}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-2xl mx-auto text-center">
            <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-10 max-w-lg mx-auto">
              Este curso existe porque a DSEC Labs fabrica hardware de segurança Bitcoin. Quanto mais gente entender self-custody, mais gente precisa de cofres bons. <strong className="text-[var(--foreground)]">A educação é o marketing.</strong>
            </p>
            <EmailForm variant="compact" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32 border-t border-[var(--border)]/50">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-xs font-[family-name:var(--font-geist-mono)] text-[var(--muted)] tracking-widest uppercase mb-4">
            Perguntas frequentes
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-10">
            Antes de decidir
          </h2>
          <div>
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)]/50 py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <img src="/dsec-logo.png" alt="DSEC Labs" className="h-6 w-auto opacity-60" />
          <div className="flex gap-6">
            {[
              { label: "YouTube", href: "https://youtube.com/@dseclabs" },
              { label: "Instagram", href: "https://instagram.com/dseclab.io" },
              { label: "@alfredp2p", href: "https://x.com/alfredp2p" },
              { label: "Discord", href: "https://discord.dseclab.io" },
              { label: "Telegram", href: "https://t.me/alfredp2p" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--muted)] hover:text-[var(--orange)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)]">
            © 2026 DSEC Labs. No Trust. Do It Yourself.
          </p>
        </div>
      </footer>
    </main>
  );
}
