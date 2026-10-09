import { apiFetch } from "./client";
import type { Article, ArticleStatus } from "./types";

export function listArticles(status?: ArticleStatus) {
  return apiFetch<{ data: Article[] }>("/articles", { searchParams: { status } });
}

export function createArticle(input: { title: string; body: string }) {
  return apiFetch<Article>("/articles", { method: "POST", body: input });
}

export function updateArticle(
  articleId: string,
  input: Partial<{ title: string; body: string; status: ArticleStatus }>
) {
  return apiFetch<Article>(`/articles/${articleId}`, { method: "PATCH", body: input });
}
