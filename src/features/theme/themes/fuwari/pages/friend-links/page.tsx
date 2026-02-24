import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { FriendCard } from "./components/friend-card";
import type { FriendLinksPageProps } from "@/features/theme/contract/pages";

const PAGE_SIZE = 24;

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
    <div className="flex flex-col gap-4 w-full">
      {/* Header Banner representing the current page */}
      <div
        className="fuwari-card-base p-6 md:p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-56 fuwari-onload-animation bg-linear-to-br from-(--fuwari-primary)/5 to-transparent"
        style={{ animationDelay: "150ms" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold fuwari-text-90 mb-4 z-10 transition-colors">
          友情链接
        </h1>
        <p className="fuwari-text-50 text-center max-w-xl z-10 transition-colors">
          海内存知己，天涯若比邻。如果你也喜欢折腾，欢迎在这里留下脚印。
        </p>
        <Link
          to="/submit-friend-link"
          className="mt-6 z-10 fuwari-onload-animation fuwari-btn-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all"
        >
          申请友链
        </Link>
      </div>

      {/* Links Grid */}
      <div
        className="fuwari-card-base p-6 md:p-8 fuwari-onload-animation flex-1"
        style={{ animationDelay: "300ms" }}
      >
        {links.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {paginatedLinks.map((link, i) => (
                <FriendCard
                  key={link.id}
                  link={link}
                  className="fuwari-onload-animation"
                  style={{ animationDelay: `${400 + i * 50}ms` }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1 mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg fuwari-text-50 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers(currentPage, totalPages).map((pageNum, i) =>
                  pageNum === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 text-sm fuwari-text-30"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-(--fuwari-primary) text-white"
                          : "fuwari-text-50 hover:bg-black/5 dark:hover:bg-white/5"
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
                  className="p-2 rounded-lg fuwari-text-50 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 fuwari-text-30 transition-colors">
            <p className="text-lg">暂无友情链接记录 🍃</p>
          </div>
        )}
      </div>
    </div>
  );
}
