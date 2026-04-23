"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   RD STATION FORM — abordagem radicalmente simples
   A lib oficial renderiza o form dela mesma dentro da div #RD_FORM_ID.
   Nenhum wrapper custom, nenhum hidden input, nenhum dispatch manual.
   Redirect pós-conversão é configurado NO PAINEL RD, não aqui.
   ═══════════════════════════════════════════════════════════════════ */

const RD_FORM_ID = "forms-captura-leads-x-c92b969c120bb9b7290a";
const RD_SCRIPT_SRC =
  "https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js";
const RD_SCRIPT_ID = "rdstation-forms-script";

declare global {
  interface Window {
    RDStationForms?: new (
      formId: string,
      token: string,
    ) => { createForm: () => void };
  }
}

export function RDForm({ className }: { className?: string }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

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
      } else if (!window.RDStationForms) {
        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (window.RDStationForms) {
              clearInterval(check);
              resolve();
            }
          }, 50);
          setTimeout(() => {
            clearInterval(check);
            resolve();
          }, 10_000);
        });
      }

      if (!window.RDStationForms) {
        console.error("[RD] RDStationForms indisponível após 10s");
        return;
      }

      const el = document.getElementById(RD_FORM_ID);
      if (!el) {
        console.error(`[RD] div #${RD_FORM_ID} não encontrada`);
        return;
      }

      if (el.querySelector("form")) {
        return;
      }

      try {
        new window.RDStationForms(RD_FORM_ID, "").createForm();
      } catch (err) {
        console.error("[RD] createForm falhou:", err);
      }
    }

    void init();
  }, []);

  return (
    <div
      role="main"
      id={RD_FORM_ID}
      className={className}
      style={{ minHeight: 320 }}
    />
  );
}
