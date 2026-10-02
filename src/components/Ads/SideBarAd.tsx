"use client";

import { useEffect, useRef } from "react";

import useAds from "@/components/hooks/useAds";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

interface SideBarAdProps {
  position: string;
  lang: SupportedLanguageCode;
  className?: string;
}

declare global {
  interface Window {
    ado?: unknown;
  }
}

/**
 * Wait until AdOcean is available.
 *
 * Returns true when AdOcean exists,
 * false when the timeout is reached.
 */
function waitForAdo(timeout = 15000): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.ado) {
      resolve(true);
      return;
    }

    const startTime = Date.now();

    const check = () => {
      if (window.ado) {
        resolve(true);
        return;
      }

      if (Date.now() - startTime >= timeout) {
        console.warn(
          "[SideBarAd] AdOcean was not initialized within timeout",
        );

        resolve(false);
        return;
      }

      window.setTimeout(check, 100);
    };

    check();
  });
}

/**
 * Detect whether a script depends on AdOcean.
 */
function scriptUsesAdo(
  script: HTMLScriptElement,
): boolean {
  const text = script.textContent || "";
  const src = script.getAttribute("src") || "";

  return (
    text.includes("ado.") ||
    text.includes("ado(") ||
    text.includes("ado_") ||
    src.toLowerCase().includes("adocean")
  );
}

/**
 * Execute one script from the advertisement HTML.
 */
async function executeScript(
  oldScript: HTMLScriptElement,
  container: HTMLElement,
): Promise<void> {
  const requiresAdo = scriptUsesAdo(oldScript);

  /**
   * AdOcean-dependent scripts must not execute
   * before window.ado exists.
   */
  if (requiresAdo) {
    const adoReady = await waitForAdo();

    if (!adoReady) {
      console.warn(
        "[SideBarAd] Skipping AdOcean-dependent script because AdOcean is unavailable",
      );

      return;
    }
  }

  const script = document.createElement("script");

  /**
   * Copy all script attributes.
   */
  Array.from(oldScript.attributes).forEach(
    (attribute) => {
      script.setAttribute(
        attribute.name,
        attribute.value,
      );
    },
  );

  /**
   * External script.
   */
  if (oldScript.src) {
    await new Promise<void>((resolve) => {
      let resolved = false;

      const finish = () => {
        if (resolved) {
          return;
        }

        resolved = true;
        resolve();
      };

      script.onload = () => {
        

        finish();
      };

      script.onerror = () => {
        console.error(
          "[SideBarAd] Failed to load script:",
          script.src,
        );

        finish();
      };

      const src = oldScript.src;

      script.src = src.startsWith("//")
        ? `https:${src}`
        : src;

      container.appendChild(script);
    });

    return;
  }

  /**
   * Inline script.
   */
  script.textContent =
    oldScript.textContent || "";

  container.appendChild(script);
}

/**
 * Parse advertisement HTML and execute
 * its scripts in the correct order.
 */
async function loadHtmlWithScripts(
  html: string,
  container: HTMLElement,
): Promise<void> {
  if (!html) {
    return;
  }

  const temp = document.createElement("div");

  temp.innerHTML = html;

  const nodes = Array.from(
    temp.childNodes,
  );

  for (const node of nodes) {
    if (
      node.nodeType !== Node.ELEMENT_NODE
    ) {
      continue;
    }

    const element = node as HTMLElement;

    /**
     * Normal HTML element.
     */
    if (
      element.tagName.toLowerCase() !==
      "script"
    ) {
      const clonedElement =
        element.cloneNode(
          true,
        ) as HTMLElement;

      /**
       * Find scripts nested inside
       * this HTML element.
       */
      const nestedScripts =
        Array.from(
          clonedElement.querySelectorAll(
            "script",
          ),
        );

      /**
       * No nested scripts.
       */
      if (
        nestedScripts.length === 0
      ) {
        container.appendChild(
          clonedElement,
        );

        continue;
      }

      /**
       * Remove nested scripts from
       * the cloned HTML before inserting it.
       */
      const scriptData =
        nestedScripts.map(
          (oldScript) => {
            const parent =
              oldScript.parentNode;

            if (parent) {
              parent.removeChild(
                oldScript,
              );
            }

            return {
              oldScript,
              parent,
            };
          },
        );

      container.appendChild(
        clonedElement,
      );

      /**
       * Execute nested scripts
       * sequentially.
       */
      for (const {
        oldScript,
        parent,
      } of scriptData) {
        if (!parent) {
          continue;
        }

        await executeScript(
          oldScript,
          parent as HTMLElement,
        );
      }

      continue;
    }

    /**
     * Top-level script.
     */
    await executeScript(
      element as HTMLScriptElement,
      container,
    );
  }
}

export default function SideBarAd({
  position,
  lang,
  className = "",
}: SideBarAdProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const {
    data: ads = [],
    isLoading,
    isError,
  } = useAds(lang);

  useEffect(() => {
    let cancelled = false;

    async function renderAd() {
      const container =
        containerRef.current;

      if (!container) {
        return;
      }

      /**
       * Clear previous advertisement.
       */
      container.innerHTML = "";

      if (isLoading) {
        return;
      }

      if (isError) {
        console.error(
          `[SideBarAd] Failed to load ads for position "${position}"`,
        );

        return;
      }

      /**
       * Find the requested ad position.
       */
      const ad = ads.find(
        (item) =>
          item.position === position,
      );

      if (!ad?.html) {
        console.warn(
          `[SideBarAd] No ad found for position "${position}"`,
        );

        return;
      }

      if (cancelled) {
        return;
      }

      try {
        await loadHtmlWithScripts(
          ad.html,
          container,
        );

        if (cancelled) {
          return;
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            `[SideBarAd] Failed to render position "${position}":`,
            error,
          );
        }
      }
    }

    void renderAd();

    return () => {
      cancelled = true;

      if (containerRef.current) {
        containerRef.current.innerHTML =
          "";
      }
    };
  }, [
    ads,
    isLoading,
    isError,
    position,
  ]);

  return (
    <div className={className}>
      <div ref={containerRef} />
    </div>
  );
}
