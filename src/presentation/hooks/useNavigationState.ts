import { useState } from "react";
import type { BodyAssessment } from "../../domain/entities";
import { STORAGE_KEYS } from "../../shared/lib/storageKeys";

export type AppTab =
  | "landing" | "welcome"
  | "dashboard" | "calendar" | "workouts" | "stats"
  | "profile" | "edit-profile" | "evolution" | "trainers"
  | "new-assessment" | "edit-assessment" | "create-workout" | "edit-workout"
  | "login" | "settings-goal"
  | "forgot-password" | "register" | "help" | "express" | "store"
  | "students" | "student-workouts" | "student-evolution"
  | "chat" | "purchased-products";

export const useNavigationState = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(() =>
    localStorage.getItem(STORAGE_KEYS.WELCOME_DONE) ? 'dashboard' : 'landing'
  );
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<BodyAssessment | null>(null);

  // The active sport (modalidade ativa) persists across sessions via localStorage.
  // Initialised from storage; falls back to '' — screens resolve the real default
  // from the user's specialties when they detect an empty value.
  const [activeSport, setActiveSportState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_SPORT) ?? '';
    } catch {
      return '';
    }
  });

  const setActiveSport = (sport: string) => {
    setActiveSportState(sport);
    try { localStorage.setItem(STORAGE_KEYS.ACTIVE_SPORT, sport); } catch {}
  };

  return {
    activeTab, setActiveTab,
    swipeDirection, setSwipeDirection,
    showLogoutConfirm, setShowLogoutConfirm,
    editingAssessment, setEditingAssessment,
    activeSport, setActiveSport,
  };
};
