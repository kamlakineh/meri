"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";
import type { Article } from "@/lib/api/types";

export function ArticlesReviewTable({
  articles,
  labels,
}: {
  articles: Article[];
  labels: {
    publish: string;
    reject: string;
    noArticles: string;
  };
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string, status: "published" | "rejected") {
    setBusyId(id);
    try {
      await clientApiFetch(`/articles/${id}`, { method: "PATCH", body: { status } });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (articles.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted">{labels.noArticles}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {articles.map((article) => (
        <div
          key={article.id}
          className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="max-w-xl">
            <p className="font-medium text-foreground">{article.title}</p>
            <p className="text-sm text-muted">{article.authorName}</p>
            <p className="mt-1 line-clamp-2 text-sm text-foreground">{article.body}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              onClick={() => review(article.id, "published")}
              isLoading={busyId === article.id}
            >
              {labels.publish}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => review(article.id, "rejected")}
              isLoading={busyId === article.id}
            >
              {labels.reject}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
