import { getTranslations } from "next-intl/server";
import { ArticlesReviewTable } from "@/components/admin/ArticlesReviewTable";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { listArticles } from "@/lib/api/articles";

export const instant = false;

export default async function AdminArticlesPage() {
  const t = await getTranslations("admin");
  const { data: articles } = await listArticles("pending_review");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("articlesTitle")} subtitle={t("articlesSubtitle")} />
      <Card>
        <ArticlesReviewTable
          articles={articles}
          labels={{
            publish: t("publish"),
            reject: t("reject"),
            noArticles: t("noArticles"),
          }}
        />
      </Card>
    </div>
  );
}
