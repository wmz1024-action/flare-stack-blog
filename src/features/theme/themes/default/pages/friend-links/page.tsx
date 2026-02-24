import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { FriendLinkCard } from "./friend-link-card";
import type { FriendLinksPageProps } from "@/features/theme/contract/pages";

const PAGE_SIZE = 20;

function getPageNumbers(
  current: number,
  total: number,
): Array<number | "..."> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function FriendLinksPage({ links }: FriendLinksPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(links.length / PAGE_SIZE);
  const paginatedLinks = links.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="w-full max-w-3xl mx-auto pb-20 px-6 md:px-0">
      {/* Header */}
      <header className="py-12 md:py-20 space-y-6">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
          友情链接
        </h1>
        <p className="max-w-xl text-base md:text-lg font-light text-muted-foreground leading-relaxed">
          志同道合的站点，彼此链接，互相照亮。
        </p>
      </header>

      {/* Links List */}
      <div className="min-h-50">
        {links.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-lg text-muted-foreground/50">
              暂无友链
            </p>
            <p className="mt-2 text-sm text-muted-foreground/30 font-mono">
              // 成为第一个链接的站点
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedLinks.map((link) => (
              <FriendLinkCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            ←
          </button>
          {getPageNumbers(currentPage, totalPages).map((pageNum, i) =>
            pageNum === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-xs font-mono text-muted-foreground/50"
              >
                …
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                  currentPage === pageNum
                    ? "text-foreground font-medium underline underline-offset-4 decoration-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {pageNum}
              </button>
            ),
          )}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            →
          </button>
        </nav>
      )}

      {/* Submit CTA */}
      <div className="mt-20 pt-10 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-foreground">加入我们</h3>
          <p className="text-sm text-muted-foreground font-light">
            欢迎提交您的站点信息，通过审核后将在此展示。
          </p>
        </div>

        <Link
          to="/submit-friend-link"
          className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
        >
          <span>申请加入</span>
          <ArrowUpRight
            size={14}
            className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}
