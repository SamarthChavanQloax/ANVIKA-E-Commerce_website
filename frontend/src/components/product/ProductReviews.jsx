import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Star,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

const ProductReviews = ({ productId }) => {
  const { userInfo } = useAuth();

  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    rating: 0,
    numReviews: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    breakdownPercentage: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    canReview: false,
    hasReviewed: false,
    userReview: null,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const config = userInfo?.token
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};

      const { data } = await axios.get(`/api/products/${productId}/reviews`, config);
      setReviewsData(data);

      if (data.userReview) {
        setRatingInput(data.userReview.rating);
        setCommentInput(data.userReview.comment);
      }
    } catch (err) {
      console.warn('Reviews fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [productId, userInfo?.token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!userInfo) {
      setStatusMessage({ type: 'error', text: 'Please log in to write a review' });
      return;
    }

    if (!commentInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your review feedback' });
      return;
    }

    setSubmitting(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      if (editingReviewId) {
        await axios.put(
          `/api/reviews/${editingReviewId}`,
          { rating: ratingInput, comment: commentInput },
          config
        );
        setStatusMessage({ type: 'success', text: 'Your review has been updated!' });
        setEditingReviewId(null);
      } else {
        await axios.post(
          `/api/products/${productId}/reviews`,
          { rating: ratingInput, comment: commentInput },
          config
        );
        setStatusMessage({ type: 'success', text: 'Thank you! Your verified review has been posted.' });
      }

      await fetchReviews();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit review',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove your review?')) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.delete(`/api/reviews/${reviewId}`, config);
      setStatusMessage({ type: 'success', text: 'Review removed successfully' });
      setCommentInput('');
      setEditingReviewId(null);
      await fetchReviews();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete review',
      });
    }
  };

  const reviews = reviewsData.reviews || [];
  const averageRating = Number(reviewsData.rating || 0).toFixed(1);
  const totalReviews = reviewsData.numReviews || reviews.length;
  const breakdown = reviewsData.breakdownPercentage || {};

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Client Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text mt-1">
            Ratings & Reviews ({totalReviews})
          </h2>
        </div>
      </div>

      {statusMessage.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            statusMessage.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {statusMessage.type === 'error' ? <AlertCircle /> : <CheckCircle2 />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Ratings Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 bg-surface border border-border rounded-2xl mb-12 shadow-sm">
        {/* Left: Big Rating Number */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-border">
          <span className="text-5xl sm:text-6xl font-serif font-bold text-text">{averageRating}</span>
          <div className="flex items-center gap-1 text-amber-500 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(Number(averageRating))
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-border'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-textSecondary">
            Based on {totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Center: Rating Star Progress Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const pct = breakdown[stars] || 0;
            const count = reviewsData.breakdown?.[stars] || 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-text font-medium flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                </span>
                <div className="flex-1 h-2.5 bg-background rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <span className="w-12 text-right text-textSecondary">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission or Edit Form */}
      {userInfo ? (
        <div className="p-6 sm:p-8 bg-surface border border-border rounded-2xl mb-12 shadow-sm">
          <h3 className="text-lg font-serif font-bold text-text mb-2 flex items-center gap-2">
            <MessageSquare className="text-accent" />
            {editingReviewId || reviewsData.hasReviewed
              ? 'Update Your Review'
              : 'Write a Verified Review'}
          </h3>
          <p className="text-xs text-textSecondary mb-4">
            Only customers with a delivered purchase can leave a verified review.
          </p>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingInput
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-border hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-text ml-2">
                  {['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional'][ratingInput - 1]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1">
                Your Review Feedback
              </label>
              <textarea
                rows="4"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your experience with this couture garment, quality of fabric, drape, and sizing..."
                className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                required
              ></textarea>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent/90 transition-all shadow-md disabled:opacity-50"
              >
                {submitting
                  ? 'Posting...'
                  : editingReviewId
                  ? 'Update Review'
                  : 'Submit Review'}
              </button>
              {editingReviewId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingReviewId(null);
                    setCommentInput('');
                  }}
                  className="px-4 py-2.5 border border-border text-text rounded-full text-sm hover:bg-background"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6 text-center bg-surface border border-border rounded-2xl mb-12">
          <p className="text-sm text-textSecondary mb-3">
            Purchased this piece? Sign in to write a review.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-accent text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-accent/90"
          >
            Sign In to Review
          </a>
        </div>
      )}

      {/* Review Cards List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-textSecondary text-sm">
            No reviews yet. Be the first to share your thoughts on this garment!
          </div>
        ) : (
          reviews.map((rev) => {
            const isMyReview = userInfo && rev.user?.toString() === userInfo._id?.toString();
            return (
              <div
                key={rev._id}
                className="p-6 bg-surface border border-border rounded-2xl shadow-sm hover:border-accent/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text text-sm">{rev.name}</h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-border'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-textSecondary">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {(isMyReview || userInfo?.role === 'admin') && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReviewId(rev._id);
                            setRatingInput(rev.rating);
                            setCommentInput(rev.comment);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="p-1 text-textSecondary hover:text-accent"
                          title="Edit Review"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1 text-textSecondary hover:text-red-500"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-text mt-2 leading-relaxed">{rev.comment}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
