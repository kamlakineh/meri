import { Router } from "express";
import { nanoid } from "nanoid";
import { store } from "../db.js";
import type { Article, ArticleStatus } from "../types.js";

export const articlesRouter = Router();

// GET /v1/articles — published list for patients, own list for a doctor,
// pending queue for admin (?status=pending_review)
articlesRouter.get("/articles", (req, res) => {
  const user = req.mockUser!;
  let results = store.articles;

  if (req.query.status) {
    results = results.filter((a) => a.status === req.query.status);
  } else if (user.role === "doctor") {
    results = results.filter((a) => a.authorDoctorId === user.doctorId);
  } else if (user.role !== "admin") {
    results = results.filter((a) => a.status === "published");
  }

  res.json({
    data: [...results].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
});

// POST /v1/articles — D6 (doctor writes a health tip/article)
articlesRouter.post("/articles", (req, res) => {
  const user = req.mockUser!;
  if (user.role !== "doctor") {
    res.status(403).json({ code: "FORBIDDEN", message: "Only doctors write articles." });
    return;
  }
  const { title, body } = req.body ?? {};
  if (!title || !body) {
    res.status(400).json({ code: "INVALID_INPUT", message: "title and body are required." });
    return;
  }
  const timestamp = new Date().toISOString();
  const article: Article = {
    id: `art-${nanoid(8)}`,
    authorDoctorId: user.doctorId!,
    authorName: user.name,
    title,
    body,
    status: "pending_review",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.articles.unshift(article);
  res.status(201).json(article);
});

// PATCH /v1/articles/:articleId — admin review (publish/reject), D6
articlesRouter.patch("/articles/:articleId", (req, res) => {
  const user = req.mockUser!;
  const article = store.articles.find((a) => a.id === req.params.articleId);
  if (!article) {
    res.status(404).json({ code: "NOT_FOUND", message: "Article not found." });
    return;
  }

  const { status, title, body } = req.body ?? {};
  const isAuthor = user.role === "doctor" && user.doctorId === article.authorDoctorId;

  if (status) {
    if (user.role !== "admin") {
      res.status(403).json({ code: "FORBIDDEN", message: "Only admins change article status." });
      return;
    }
    article.status = status as ArticleStatus;
  }
  if (title !== undefined || body !== undefined) {
    if (!isAuthor) {
      res.status(403).json({ code: "FORBIDDEN", message: "Only the author can edit content." });
      return;
    }
    if (typeof title === "string") article.title = title;
    if (typeof body === "string") article.body = body;
  }
  article.updatedAt = new Date().toISOString();
  res.json(article);
});
