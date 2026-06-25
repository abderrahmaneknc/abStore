import { useCallback, useEffect, useMemo, useState } from 'react';
import { FeedbackContext } from './feedback';
import { feedbackApi } from '../services/api';

const storageKey = 'ab-store-feedbacks';

const defaultFeedbacks = [
  {
    id: 1,
    name: 'Client satisfait',
    message: 'Service rapide et bon conseil pour choisir mon telephone.',
    rating: 5,
    visible: true,
    createdAt: '2026-06-20',
  },
];

const readFeedbacks = () => {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : defaultFeedbacks;
  } catch {
    return defaultFeedbacks;
  }
};

export function FeedbackProvider({ children }) {
  const [feedbacks, setFeedbacks] = useState(readFeedbacks);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const apiFeedbacks = await feedbackApi.getAll();
        if (Array.isArray(apiFeedbacks)) {
          setFeedbacks(apiFeedbacks);
          return;
        }
      } catch (error) {
        console.error('Failed to load feedbacks from API', error);
      }

      setFeedbacks(readFeedbacks());
    };

    loadFeedbacks();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addFeedback = useCallback(async (feedback) => {
    try {
      const payload = {
        ...feedback,
        rating: Number(feedback.rating) || 5,
        visible: true,
      };
      const saved = await feedbackApi.submit(payload);
      setFeedbacks((current) => [saved, ...current]);
      return true;
    } catch (error) {
      console.error('Failed to submit feedback', error);
      throw error;
    }
  }, []);

  const toggleFeedbackVisibility = useCallback(async (id) => {
    try {
      const existing = feedbacks.find((feedback) => feedback.id === id);
      if (!existing) return;
      const updated = await feedbackApi.toggleVisibility(id, !existing.visible);
      setFeedbacks((current) =>
        current.map((feedback) =>
          feedback.id === id ? updated : feedback
        )
      );
    } catch (error) {
      console.error('Failed to toggle feedback visibility', error);
      throw error;
    }
  }, [feedbacks]);

  const removeFeedback = useCallback(async (id) => {
    try {
      await feedbackApi.delete(id);
      setFeedbacks((current) =>
        current.filter((feedback) => feedback.id !== id)
      );
    } catch (error) {
      console.error('Failed to delete feedback', error);
      throw error;
    }
  }, []);

  const visibleFeedbacks = useMemo(
    () => feedbacks.filter((feedback) => feedback.visible),
    [feedbacks]
  );

  const value = useMemo(
    () => ({
      addFeedback,
      feedbacks,
      removeFeedback,
      toggleFeedbackVisibility,
      visibleFeedbacks,
    }),
    [
      addFeedback,
      feedbacks,
      removeFeedback,
      toggleFeedbackVisibility,
      visibleFeedbacks,
    ]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}
