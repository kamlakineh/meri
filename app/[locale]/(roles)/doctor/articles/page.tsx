import { getTranslations } from "next-intl/server";
import { ArticleForm } from "@/components/doctor/ArticleForm";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { listArticles } from "@/lib/api/articles";
import type { ArticleStatus } from "@/lib/api/types";

export const instant = false;

const STATUS_TONE: Record<
  ArticleStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  draft: "neutral",
  pending_review: "warning",
  published: "success",
  rejected: "danger",
};

export default async function DoctorArticlesPage() {
  const t = await getTranslations("doctor");
  const { data: articles } = await listArticles();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("articlesTitle")} />

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-foreground">{t("newArticleButton")}</h2>
        <ArticleForm
          titleLabel={t("articleTitleLabel")}
          bodyLabel={t("articleBodyLabel")}
          submitLabel={t("publishForReview")}
        />
      </Card>

      <Card>
        {articles.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">{t("noArticles")}</p>
        ) : (
          <div className="divide-y divide-border">
            {articles.map((article) => (
              <div key={article.id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-foreground">{article.title}</p>
                  <p className="line-clamp-2 text-sm text-muted">{article.body}</p>
                </div>
                <Badge tone={STATUS_TONE[article.status]}>{article.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
