"use client";

import { useEffect } from "react";

import { fetchScripts } from "@/lib/api/scripts";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

interface GlobalScriptsProps {
  lang: SupportedLanguageCode;
}

async function executeScripts(
  html: string,
  target: HTMLElement | HTMLHeadElement,
): Promise<void> {
  if (!html) {
    return;
  }

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const nodes = Array.from(temp.childNodes);

  for (const node of nodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    const element = node as HTMLElement;

    if (element.tagName.toLowerCase() !== "script") {
      target.appendChild(element.cloneNode(true));
      continue;
    }

    const oldScript = element as HTMLScriptElement;
    const script = document.createElement("script");

    Array.from(oldScript.attributes).forEach((attribute) => {
      script.setAttribute(attribute.name, attribute.value);
    });

    if (oldScript.src) {
      await new Promise<void>((resolve) => {
        script.onload = () => {
          

          resolve();
        };

        script.onerror = () => {
          

          resolve();
        };

        script.src = oldScript.src.startsWith("//")
          ? `https:${oldScript.src}`
          : oldScript.src;

        target.appendChild(script);
      });

      continue;
    }

    script.textContent = oldScript.textContent || "";

    target.appendChild(script);
  }
}

export default function GlobalScripts({
  lang,
}: GlobalScriptsProps) {
  useEffect(() => {
    let cancelled = false;

    async function initializeScripts() {
      try {
       

        const data = await fetchScripts(lang);

        if (cancelled) {
          return;
        }

        await executeScripts(
          data.head_scripts,
          document.head,
        );

        if (cancelled) {
          return;
        }

        await executeScripts(
          data.body_scripts,
          document.body,
        );

        if (cancelled) {
          return;
        }

        await executeScripts(
          data.bottom_up_scripts,
          document.body,
        );

        if (cancelled) {
          return;
        }

        await executeScripts(
          data.bottom_scripts,
          document.body,
        );

       
      } catch (error) {
        if (!cancelled) {
          console.error(
            "[GlobalScripts] Failed:",
            error,
          );
        }
      }
    }

    initializeScripts();

    return () => {
      cancelled = true;
    };
  }, [lang]);

  return null;
}