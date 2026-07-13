import { useState } from "react";
import type { BodyAssessment, WorkoutSession } from "../../domain/entities";
import { STORAGE_KEYS } from "../../shared/lib/storageKeys";

export type AppTab =
  | "landing" | "welcome"
  | "dashboard" | "calendar" | "workouts" | "stats"
  | "profile" | "edit-profile" | "evolution" | "trainers"
  | "new-assessment" | "edit-assessment" | "create-workout" | "edit-workout"
  | "login" | "settings-goal" | "settings-notifications"
  | "forgot-password" | "register" | "help" | "express" | "store" | "library"
  | "students" | "student-workouts" | "student-evolution"
  | "chat" | "notifications" | "purchased-products";

export const useNavigationState = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(() =>
    localStorage.getItem(STORAGE_KEYS.WELCOME_DONE) ? 'dashboard' : 'landing'
  );
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<BodyAssessment | null>(null);

  return {
    activeTab, setActiveTab,
    swipeDirection, setSwipeDirection,
    showLogoutConfirm, setShowLogoutConfirm,
    editingAssessment, setEditingAssessment,
  };
};
