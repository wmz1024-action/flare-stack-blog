import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TableOfContentsItem } from "@/features/posts/utils/toc";
import { cn } from "@/lib/utils";

export default function TableOfContents({
  headers,
}: {
  headers: Array<TableOfContentsItem>;
}) {
  const [activeIndices, setActiveIndices] = useState<Array<number>>([]);
  const [isReady, setIsReady] = useState(false);

  // Reset active indices and suppress visibility when headers change (e.g., during navigation)
  useEffect(() => {
    setActiveIndices([]);
    setIsReady(false);
    const timer = setTimeout(() => setIsReady(true), 600);
    return () => clearTimeout(timer);
  }, [headers]);

  const [isVisible, setIsVisible] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const tocRootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // For the active indicator backdrop
  const [indicatorStyle, setIndicatorStyle] = useState<{
    top: number;
    height: number;
    opacity: number;
  }>({ top: 0, height: 0, opacity: 0 });

  // Calculate min depth
  const minDepth = useMemo(() => {
    if (headers.length === 0) return 10;
    let min = 10;
    for (const heading of headers) {
      if (heading.level < min) min = heading.level;
    }
    return min;
  }, [headers]);

  // Max depth visible in TOC from config
  const maxLevel = 3;

  const removeTailingHash = (text: string) => {
    const lastIndexOfHash = text.lastIndexOf("#");
    if (lastIndexOfHash !== -1 && lastIndexOfHash === text.length - 1) {
      return text.substring(0, lastIndexOfHash);
    }
    return text;
  };

  // Scroll visibility logic: Show TOC after scrolling past banner area
  useEffect(() => {
    const handleScrollVisibility = () => {
      const scrollY = window.scrollY;
      // Show when scrolled > 350px (approx banner height)
      setIsVisible(scrollY > 350);
    };

    window.addEventListener("scroll", handleScrollVisibility, {
      passive: true,
    });
    handleScrollVisibility(); // Initial check
    return () => window.removeEventListener("scroll", handleScrollVisibility);
  }, []);

  // Section-based active heading detection (matches original Fuwari logic)
  // For each heading, its "section" extends from the heading to the next heading.
  // Any section even partially visible in the viewport is marked active.
  const computeActiveHeadings = useCallback(() => {
    if (headers.length === 0) return;

    const active: Array<boolean> = new Array(headers.length).fill(false);

    for (let i = 0; i < headers.length; i++) {
      const heading = document.getElementById(headers[i].id);
      if (!heading) continue;

      const sectionTop = heading.getBoundingClientRect().top;

      // Section bottom = next heading's top, or end of document for last heading
      let sectionBottom: number;
      if (i < headers.length - 1) {
        const nextHeading = document.getElementById(headers[i + 1].id);
        sectionBottom = nextHeading
          ? nextHeading.getBoundingClientRect().top
          : window.innerHeight;
      } else {
        // Last heading: section extends to end of content
        sectionBottom =
          document.documentElement.scrollHeight -
          window.scrollY -
          window.scrollY +
          window.innerHeight;
        // Simpler: just use a value that's always below viewport if content extends
        const contentEnd =
          document.documentElement.scrollHeight - window.scrollY;
        sectionBottom = contentEnd;
      }

      // Check if any part of this section is visible in viewport (matching original fallback logic)
      const isInViewport =
        (sectionTop >= 0 && sectionTop < window.innerHeight) ||
        (sectionBottom > 0 && sectionBottom <= window.innerHeight) ||
        (sectionTop < 0 && sectionBottom > window.innerHeight);

      if (isInViewport) {
        active[i] = true;
      } else if (sectionTop > window.innerHeight) {
        break;
      }
    }

    // Find last contiguous block of active headings (matching original toggleActiveHeading logic)
    const newActiveIndices: Array<number> = [];
    let i = active.length - 1;
    let min = active.length - 1;
    let max = -1;

    // Skip non-active from end
    while (i >= 0 && !active[i]) i--;
    // Collect last contiguous block
    while (i >= 0 && active[i]) {
      min = Math.min(min, i);
      max = Math.max(max, i);
      i--;
    }

    if (min <= max) {
      for (let j = min; j <= max; j++) {
        newActiveIndices.push(j);
      }
    }

    setActiveIndices(newActiveIndices);
  }, [headers]);

  useEffect(() => {
    if (headers.length === 0) return;

    window.addEventListener("scroll", computeActiveHeadings, {
      passive: true,
    });
    computeActiveHeadings(); // Initial check

    return () => window.removeEventListener("scroll", computeActiveHeadings);
  }, [headers, computeActiveHeadings]);

  // Update indicator style based on the range of active indices
  useEffect(() => {
    if (activeIndices.length > 0 && tocRootRef.current) {
      const firstIdx = activeIndices[0];
      const lastIdx = activeIndices[activeIndices.length - 1];

      // Defensive check: ensure indices are within bounds of current headers
      if (!headers[firstIdx] || !headers[lastIdx]) {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const firstId = headers[firstIdx].id;
      const lastId = headers[lastIdx].id;

      const firstLink = tocRootRef.current.querySelector<HTMLElement>(
        `a[href="#${firstId}"]`,
      );
      const lastLink = tocRootRef.current.querySelector<HTMLElement>(
        `a[href="#${lastId}"]`,
      );

      if (firstLink && lastLink) {
        const rootRect = tocRootRef.current.getBoundingClientRect();
        const firstRect = firstLink.getBoundingClientRect();
        const lastRect = lastLink.getBoundingClientRect();
        const scrollOffset = tocRootRef.current.scrollTop;

        setIndicatorStyle({
          top: firstRect.top - rootRect.top + scrollOffset,
          height: lastRect.bottom - firstRect.top,
          opacity: 1,
        });

        // Auto-scroll TOC (matching original scrollToActiveHeading logic)
        const tocHeight = tocRootRef.current.clientHeight;
        const topmost = firstLink;
        const bottommost = lastLink;

        if (
          bottommost.getBoundingClientRect().bottom -
            topmost.getBoundingClientRect().top <
          0.9 * tocHeight
        ) {
          // Both fit in view, scroll to topmost
          const scrollTarget = topmost.offsetTop - 32;
          tocRootRef.current.scrollTo({
            top: scrollTarget,
            left: 0,
            behavior: "smooth",
          });
        } else {
          // Too tall, scroll to bottommost
          const scrollTarget = bottommost.offsetTop - tocHeight * 0.8;
          tocRootRef.current.scrollTo({
            top: scrollTarget,
            left: 0,
            behavior: "smooth",
          });
        }
      }
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeIndices, headers]);

  if (headers.length === 0) return null;

  let h1Count = 1;

  return (
    <nav
      ref={navRef}
      className={cn(
        "sticky top-14 self-start block w-full transition-all duration-500",
        isVisible && isReady
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <div
        ref={tocRootRef}
        className="relative toc-root overflow-y-scroll overflow-x-hidden custom-scrollbar h-[calc(100vh-20rem)] hide-scrollbar"
        style={{
          scrollBehavior: "smooth",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 2rem, black calc(100% - 2rem), transparent 100%)",
        }}
      >
        <div className="h-8 w-full" />
        <div className="group relative flex flex-col w-full">
          {headers
            .filter((heading) => heading.level < minDepth + maxLevel)
            .map((heading) => {
              const text = removeTailingHash(heading.text);
              const isH1 = heading.level === minDepth;
              const isH2 = heading.level === minDepth + 1;
              const isH3 = heading.level === minDepth + 2;

              return (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      const top =
                        element.getBoundingClientRect().top +
                        window.scrollY -
                        80;
                      window.scrollTo({ top, behavior: "smooth" });
                      navigate({
                        hash: heading.id,
                        replace: true,
                      });
                    }
                  }}
                  className={cn(
                    "px-2 flex gap-2 relative transition w-full min-h-9 rounded-xl py-2 z-10",
                    "hover:bg-(--fuwari-toc-btn-hover) active:bg-(--fuwari-toc-btn-active)",
                  )}
                >
                  <div
                    className={cn(
                      "transition w-5 h-5 shrink-0 rounded-lg text-xs flex items-center justify-center font-bold",
                      {
                        "bg-[oklch(0.89_0.050_var(--fuwari-hue))] dark:bg-(--fuwari-btn-regular-bg) text-(--fuwari-btn-content)":
                          isH1,
                        "ml-4": isH2,
                        "ml-8": isH3,
                      },
                    )}
                  >
                    {isH1 && h1Count++}
                    {isH2 && (
                      <div className="transition w-2 h-2 rounded-[0.1875rem] bg-[oklch(0.89_0.050_var(--fuwari-hue))] dark:bg-(--fuwari-btn-regular-bg)"></div>
                    )}
                    {isH3 && (
                      <div className="transition w-1.5 h-1.5 rounded-sm bg-black/5 dark:bg-white/10"></div>
                    )}
                  </div>

                  <div
                    className={cn("transition text-sm", {
                      "fuwari-text-50": isH1 || isH2,
                      "fuwari-text-30": isH3,
                    })}
                  >
                    {text}
                  </div>
                </a>
              );
            })}

          {/* Active Indicator Backdrop (Fuwari style dashed border) */}
          {headers.length > 0 && (
            <div
              className={cn(
                "absolute left-0 right-0 rounded-xl transition-all duration-300 ease-out -z-10 border-2 border-dashed pointer-events-none",
                "bg-(--fuwari-toc-btn-hover) border-(--fuwari-toc-btn-hover) group-hover:bg-transparent group-hover:border-(--fuwari-toc-btn-active)",
              )}
              style={{
                top: `${indicatorStyle.top}px`,
                height: `${indicatorStyle.height}px`,
                opacity: indicatorStyle.opacity,
              }}
            />
          )}
        </div>
        <div className="h-8 w-full" />
      </div>
    </nav>
  );
}
