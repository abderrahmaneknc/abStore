import { Star } from 'lucide-react';
import { useState } from 'react';
import { useFeedback } from '../../context/feedback';
import { useToast } from '../../context/toast';
import { useLanguage } from '../../context/language';

export default function Feedback() {
  const { addFeedback, visibleFeedbacks } = useFeedback();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name')?.toString().trim();
    const message = form.get('message')?.toString().trim();

    if (!name || !message) return;

    addFeedback({ name, message, rating });
    event.currentTarget.reset();
    setRating(5);
    toast({
      type: 'success',
      title: t('feedbackAdded'),
      message: t('feedbackThankYou'),
    });
  };

  return (
    <section id="feedback-section" className="bg-card px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            {t('feedbackTitle')}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {t('feedbackSubtitle')}
          </h2>
          <input
            name="name"
            placeholder={t('name')}
            className="mt-5 w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-gold"
            required
          />
          <textarea
            name="message"
            placeholder={t('message')}
            className="mt-3 min-h-28 w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-gold"
            required
          />
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-gold"
                aria-label={`${star}/5`}
              >
                <Star
                  size={24}
                  className={star <= rating ? 'fill-gold' : ''}
                />
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-gold px-5 py-3 font-semibold text-black transition hover:bg-yellow-600"
          >
            {t('sendFeedback')}
          </button>
        </form>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 snap-x snap-mandatory scrollbar-hide sm:mx-0 sm:px-0">
          {visibleFeedbacks.map((feedback) => (
            <article
              key={feedback.id}
              className="min-w-[280px] snap-start rounded-xl border border-border bg-white p-5 shadow-sm sm:min-w-[320px] lg:min-w-[360px]"
            >
              <div className="flex gap-1 text-gold">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= feedback.rating ? 'fill-gold' : ''}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                {feedback.message}
              </p>
              <p className="mt-4 font-bold text-gray-900">{feedback.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
