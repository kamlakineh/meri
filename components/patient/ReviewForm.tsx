"use client";

import { Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { useRouter } from "@/i18n/navigation";
import { clientApiFetch } from "@/lib/api/clientFetch";
import { cn } from "@/lib/cn";

export function ReviewForm({
  doctorId,
  doctorName,
  ratingLabel,
  commentLabel,
  submitLabel,
}: {
  doctorId: string;
  doctorName: string;
  ratingLabel: string;
  commentLabel: string;
  submitLabel: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await clientApiFetch("/reviews", {
        method: "POST",
        body: { doctorId, rating, comment },
      });
      router.push("/patient/history?tab=appointments");
    } catch {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="font-semibold text-foreground">{doctorName}</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-foreground">{ratingLabel}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={String(value)}
              >
                <Star
                  className={cn(
                    "h-7 w-7",
                    value <= rating ? "fill-warning text-warning" : "text-border"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="mb-1 block text-sm font-medium text-foreground">
            {commentLabel}
          </label>
          <Textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <Button type="submit" isLoading={loading}>
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
