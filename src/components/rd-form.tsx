"use client";

import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════
   RD STATION FORM — UI custom + POST direto
   A lib oficial roda oculta (fora da viewport) só para extrair o
   token_rdstation público que ela injeta no form. A UI é 100% nossa
   e o submit é um fetch POST direto para o endpoint de conversions.
   Redirect para /obrigado é controlado pelo nosso código, não pelo RD.
   ═══════════════════════════════════════════════════════════════════ */

const RD_FORM_ID = "forms-curso-gratis-9520162929ac4a559ebb";
const RD_SCRIPT_SRC =
  "https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js";
const RD_SCRIPT_ID = "rdstation-forms-script";
const RD_ENDPOINT = "https://app.rdstation.com.br/api/1.2/conversions.json";
const REDIRECT_AFTER_SUCCESS = "/obrigado";

declare global {
  interface Window {
    RDStationForms?: new (
      formId: string,
      token: string,
    ) => { createForm: () => void };
  }
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export function RDForm({ className }: { className?: string }) {
  const hiddenContainerRef = useRef<HTMLDivElement>(null);
  const [rdToken, setRdToken] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  });
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    async function init() {
      let script = document.getElementById(
        RD_SCRIPT_ID,
      ) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement("script");
        script.id = RD_SCRIPT_ID;
        script.src = RD_SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
        await new Promise<void>((resolve, reject) => {
          script!.addEventListener("load", () => resolve());
          script!.addEventListener("error", () =>
            reject(new Error("RD script failed to load")),
          );
        });
      }

      const globalDeadline = Date.now() + 10_000;
      while (
        typeof window.RDStationForms === "undefined" &&
        Date.now() < globalDeadline
      ) {
        await new Promise((r) => setTimeout(r, 50));
      }

      if (!window.RDStationForms) {
        console.error("[RD] library not loaded after 10s");
        return;
      }

      const host = document.getElementById(RD_FORM_ID);
      if (!host) {
        console.error(`[RD] hidden host #${RD_FORM_ID} not found`);
        return;
      }

      if (!host.querySelector("form")) {
        try {
          new window.RDStationForms(RD_FORM_ID, "").createForm();
        } catch (err) {
          console.error("[RD] createForm threw", err);
        }
      }

      const tokenDeadline = Date.now() + 10_000;
      while (Date.now() < tokenDeadline) {
        const input = hiddenContainerRef.current?.querySelector<HTMLInputElement>(
          'input[name="token_rdstation"]',
        );
        if (input?.value) {
          setRdToken(input.value);
          return;
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      console.error("[RD] token_rdstation not found after 10s");
    }

    void init();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitState.status === "submitting" || submitState.status === "success")
      return;

    const email = formData.email.trim();
    if (!email || !email.includes("@")) {
      setSubmitState({ status: "error", message: "Email inválido." });
      return;
    }

    if (!rdToken) {
      setSubmitState({
        status: "error",
        message:
          "Formulário ainda carregando. Aguarde um instante e tente de novo.",
      });
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const body: Record<string, string> = {
        token_rdstation: rdToken,
        identificador: RD_FORM_ID,
        email,
      };
      const nome = formData.nome.trim();
      const telefone = formData.telefone.trim();
      if (nome) body.nome = nome;
      if (telefone) body.telefone = telefone;
      if (typeof window !== "undefined") {
        body.traffic_source = window.location.href;
      }

      const res = await fetch(RD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[RD] POST failed", res.status, text);
        setSubmitState({
          status: "error",
          message: "Não conseguimos enviar agora. Tente de novo em segundos.",
        });
        return;
      }

      setSubmitState({ status: "success" });
      setTimeout(() => {
        window.location.href = REDIRECT_AFTER_SUCCESS;
      }, 600);
    } catch (err) {
      console.error("[RD] POST error", err);
      setSubmitState({
        status: "error",
        message: "Erro de conexão. Tente novamente.",
      });
    }
  }

  const isSubmitting = submitState.status === "submitting";
  const isSuccess = submitState.status === "success";
  const errorMessage =
    submitState.status === "error" ? submitState.message : null;

  const buttonLabel = isSuccess
    ? "Enviado"
    : isSubmitting
      ? "Enviando..."
      : !rdToken
        ? "Carregando..."
        : "Quero saber mais";

  return (
    <>
      {/* Hidden RD render — off-screen, apenas para extrair o token público */}
      <div
        ref={hiddenContainerRef}
        id={RD_FORM_ID}
        aria-hidden
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: 1,
          height: 1,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <form onSubmit={handleSubmit} className={className} noValidate>
        <FormField
          label="Nome"
          name="nome"
          value={formData.nome}
          onChange={(v) => setFormData((p) => ({ ...p, nome: v }))}
          autoComplete="name"
          disabled={isSubmitting || isSuccess}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(v) => setFormData((p) => ({ ...p, email: v }))}
          autoComplete="email"
          required
          disabled={isSubmitting || isSuccess}
        />
        <FormField
          label="Telefone"
          name="telefone"
          type="tel"
          value={formData.telefone}
          onChange={(v) => setFormData((p) => ({ ...p, telefone: v }))}
          autoComplete="tel"
          disabled={isSubmitting || isSuccess}
        />

        <button
          type="submit"
          disabled={isSubmitting || isSuccess || !rdToken}
          className="dsec-rd-submit"
        >
          {buttonLabel}
        </button>

        {errorMessage && (
          <p className="dsec-rd-error" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <label className="dsec-rd-field">
      <span className="dsec-rd-label">
        {label}
        {required && " *"}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className="dsec-rd-input"
      />
    </label>
  );
}
