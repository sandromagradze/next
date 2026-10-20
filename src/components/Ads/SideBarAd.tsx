"use client";

import { useEffect, useRef, useState } from "react";

import useAds from "@/components/hooks/useAds";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

interface SideBarAdProps {
  position: string;
  lang: SupportedLanguageCode;
  className?: string;
  hasAd?: boolean;
  onAvailabilityChange?: (available: boolean) => void;
}

declare global {
  interface Window {
    ado?: unknown;
  }
}

/** Wait until AdOcean is available. */
function waitForAdo(): Promise<void> {
  return new Promise((resolve) => {
    if (window.ado) {
      resolve();
      return;
    }

    const interval = window.setInterval(() => {
      if (window.ado) {
        window.clearInterval(interval);
        resolve();
      }
    }, 100);
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
    await waitForAdo();
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
  hasAd: parentHasAd,
  onAvailabilityChange,
}: SideBarAdProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);
  const [availableAdKey, setAvailableAdKey] = useState<string | null>(null);

  const {
    data: ads = [],
    isLoading,
    isError,
  } = useAds(lang);
  const ad = ads.find((item) => item.position === position);
  const adHtml = ad?.html?.trim() ?? "";
  const adKey = `${lang}:${position}:${adHtml}`;
  const isAdRendered = Boolean(adHtml) && availableAdKey === adKey;
  const hasAd = parentHasAd === undefined
    ? isAdRendered
    : parentHasAd && isAdRendered;

  useEffect(() => {
    onAvailabilityChange?.(isAdRendered);
  }, [isAdRendered, onAvailabilityChange]);

  useEffect(() => {
    let cancelled = false;
    const adContainer = containerRef.current;

    if (!adContainer || !adHtml || isLoading || isError) {
      return;
    }

    const container = adContainer;

    const hasRenderedContent = () => {
      const textContent = container.cloneNode(true) as HTMLElement;
      textContent.querySelectorAll("script, style, noscript").forEach((node) => {
        node.remove();
      });
      if (textContent.textContent?.trim()) return true;

      return Array.from(
        container.querySelectorAll("img, iframe, video"),
      ).some((element) => {
        if (element instanceof HTMLImageElement) {
          return element.complete && element.naturalWidth > 0;
        }

        if (element instanceof HTMLIFrameElement) {
          return element.dataset.adLoaded === "true";
        }

        return element instanceof HTMLVideoElement && element.readyState > 0;
      });
    };

    const updateAvailability = () => {
      const available = hasRenderedContent();
      setAvailableAdKey((current) => {
        if (available) return adKey;
        return current === adKey ? null : current;
      });
    };

    const handleResourceLoad = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLIFrameElement && target.src) {
        try {
          const frameBody = target.contentDocument?.body;
          if (frameBody && !frameBody.textContent?.trim() && !frameBody.children.length) {
            return;
          }
        } catch {
          // Cross-origin frames cannot be inspected; load is the available signal.
        }

        target.dataset.adLoaded = "true";
      }

      updateAvailability();
    };

    container.addEventListener("load", handleResourceLoad, true);
    container.addEventListener("error", handleResourceLoad, true);

    const observer = new MutationObserver(() => {
      updateAvailability();
    });

    observer.observe(container, { childList: true, subtree: true });

    async function renderAd() {
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
      if (!adHtml) {
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
          adHtml,
          container,
        );

        if (cancelled) {
          return;
        }

        updateAvailability();
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
      observer.disconnect();
      container.removeEventListener("load", handleResourceLoad, true);
      container.removeEventListener("error", handleResourceLoad, true);

      if (container) {
        container.innerHTML = "";
      }
    };
  }, [
    adHtml,
    isLoading,
    isError,
    position,
    adKey,
  ]);

  if (isLoading || isError || !adHtml) {
    return null;
  }

  const isHomepageManaged = Boolean(onAvailabilityChange);

  return (
    <div
      className={
        isHomepageManaged && !hasAd
          ? "home-hero__ad-pending"
          : className
      }
    >
      <div
        ref={containerRef}
        className={
          isHomepageManaged && !hasAd
            ? "home-hero__ad-pending-slot"
            : undefined
        }
      />
    </div>
  );
}
