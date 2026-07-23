"use client";

import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import type { Review } from "@/types";

interface ProductReviewsProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export function ProductReviews({
  reviews,
  rating,
  reviewCount,
}: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.floor(r.rating) === stars).length,
    percent:
      reviews.length > 0
        ? (reviews.filter((r) => Math.floor(r.rating) === stars).length /
            reviews.length) *
          100
        : 0,
  }));

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-5xl font-display mb-2">{rating}</p>
          <Rating rating={rating} size="md" />
          <p className="text-sm text-gray-500 mt-2">
            Based on {reviewCount} reviews
          </p>
        </div>
        <div className="md:col-span-2 space-y-2">
          {distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-3">
              <span className="text-sm w-8">{d.stars}★</span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-luxury-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-luxury-gold rounded-full transition-all"
                  style={{ width: `${d.percent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-luxury-gold/20 flex items-center justify-center text-xs font-bold">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{review.author}</p>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
              </div>
              <Rating rating={review.rating} size="sm" />
            </div>
            <h4 className="font-medium text-sm mb-1">{review.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {review.comment}
            </p>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-2">
                <ThumbsUp className="w-3 h-3" /> Verified Purchase
              </span>
            )}
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={() => setShowForm(!showForm)}>
        Write a Review
      </Button>

      {showForm && (
        <form className="mt-6 p-6 bg-gray-50 dark:bg-luxury-gray/50 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-6 h-6 text-gray-300 hover:text-luxury-gold cursor-pointer" />
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Review title"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent"
          />
          <textarea
            placeholder="Share your experience..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent resize-none"
          />
          <Button type="submit" variant="primary">Submit Review</Button>
        </form>
      )}
    </div>
  );
}
