import { useMemo, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import { useAuthState } from "./useAuthState";
import { useNavigationState } from "./useNavigationState";
import { useProfileState } from "./useProfileState";
import { useWorkoutState } from "./useWorkoutState";
import { useProgressState } from "./useProgressState";
import { useStudentsState } from "./useStudentsState";
import { useNotificationsState } from "./useNotificationsState";
import { useChatState } from "./useChatState";
import { useStoreState } from "./useStoreState";
import { useSyncState } from "./useSyncState";

export const useAppState = () => {
  const auth = useAuthState();
  const nav = useNavigationState();
  const profile = useProfileState(auth.currentUser);
  const workout = useWorkoutState(auth.currentUser, auth.token, profile.userProfile);
  const progress = useProgressState(workout.userSessions, profile.userStats);
  const students = useStudentsState(auth.currentUser, auth.token);
  const notifs = useNotificationsState(auth.currentUser, auth.isLoggedIn, auth.token);
  const chat = useChatState(auth.currentUser);
  const store = useStoreState(auth.currentUser, auth.idToken);

  // Boot sync after login
  const { dataReady } = useSyncState(auth.isLoggedIn, auth.token, {
    setUserProfile: profile.setUserProfile,
    setUserStats: profile.setUserStats,
    setTemplates: workout.setTemplates,
    setSessions: workout.setSessions,
    setTrainers: students.setTrainers,
    setTrainerConnections: students.setTrainerConnections,
    setStudentConnections: students.setStudentConnections,
    setStudents: students.setStudents,
  });

  // Apply the tab restored by Firebase Auth on page load/refresh
  useEffect(() => {
    if (auth.restoredTab) {
      nav.setActiveTab(auth.restoredTab as any);
    }
  }, [auth.restoredTab]);

  const resetUserStates = () => {
    profile.resetProfileStates();
    workout.resetWorkoutStates();
    progress.resetProgressStates();
    students.resetStudentsStates();
  };

  // Compose the api object — same shape as before, zero breaking changes
  const api = useMemo(() => ({
    // Auth
    login: auth.login,
    loginWithGoogle: auth.loginWithGoogle,
    loginWithPhone: auth.loginWithPhone,
    confirmPhoneLogin: auth.confirmPhoneLogin,
    register: auth.register,
    forgotPassword: auth.forgotPassword,
    logout: () => auth.logout(resetUserStates),
    deleteAccount: () => auth.deleteAccount(resetUserStates),

    // Profile
    getProfile: profile.getProfile,
    updateProfile: profile.updateProfile,
    getStats: profile.getStats,
    updateStats: profile.updateStats,
    getTrainingProfile: async () => null,
    updateTrainingProfile: async (_p: any) => {},
    getExerciseStats: async () => [],
    updateExerciseStats: async (_s: any) => {},

    // Workouts
    getTemplates: workout.getTemplates,
    createTemplate: workout.createTemplate,
    updateTemplate: workout.updateTemplate,
    deleteTemplate: workout.deleteTemplate,
    getSessions: workout.getSessions,
    createSession: workout.createSession,
    updateSession: workout.updateSession,
    deleteSession: workout.deleteSession,
    getStudentTemplates: workout.getStudentTemplates,

    // Assessments (stub — not yet migrated to Firestore)
    getAssessments: async () => [],
    createAssessment: async (_a: any) => {},
    updateAssessment: async (_a: any) => {},
    deleteAssessment: async (_id: string) => {},

    // Students & connections
    getTrainers: students.getTrainers,
    getStudents: students.getStudents,
    requestConnection: students.requestConnection,
    getTrainerConnections: students.getTrainerConnections,
    getStudentConnections: students.getStudentConnections,
    respondToConnection: students.respondToConnection,
    disconnectTrainer: students.disconnectTrainer,
    disconnectStudent: students.disconnectStudent,
    getTrainerSettings: async () => ({}),
    updateTrainerSettings: async (_s: any) => {},

    // Notifications
    sendNotification: notifs.sendNotification,
    getNotifications: notifs.getNotifications,
    markNotificationRead: notifs.markNotificationRead,
    clearAllNotifications: notifs.clearAllNotifications,

    // Chat
    getMessages: chat.getMessages,
    sendMessage: chat.sendMessage,

    // Store
    getProtocols: store.getProtocols,
    createProtocol: store.createProtocol,
    getPurchasedProtocols: store.getPurchasedProtocols,
    createCheckoutSession: store.createCheckoutSession,
    verifyCheckoutSession: store.verifyCheckoutSession,
    publishStoreItem: store.publishItem,
    unpublishStoreItem: store.unpublishItem,

    // Misc
    getLeaderboard: async (_league: string) => [],
    addXP: async (_xp: number) => {},
    followUser: async (_e: string) => {},
    unfollowUser: async (_e: string) => {},
    uploadImage: async (_file: File) => ({ url: "" }),
    queryDocs: async (collectionName: string, field: string, op: string, value: string) => {
      try {
        const q = query(collection(db, collectionName), where(field, op as any, value));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (e) {
        return [];
      }
    },
  }), [auth.currentUser, auth.token]);

  return {
    // Navigation
    activeTab: nav.activeTab,
    setActiveTab: nav.setActiveTab,
    swipeDirection: nav.swipeDirection,
    setSwipeDirection: nav.setSwipeDirection,
    showLogoutConfirm: nav.showLogoutConfirm,
    setShowLogoutConfirm: nav.setShowLogoutConfirm,
    editingAssessment: nav.editingAssessment,
    setEditingAssessment: nav.setEditingAssessment,

    // Auth
    isLoggedIn: auth.isLoggedIn,
    setIsLoggedIn: auth.setIsLoggedIn,
    authReady: auth.authReady,
    dataReady,
    fetchWithAuth: auth.fetchWithAuth,
    currentUserEmail: auth.currentUser?.email ?? null,

    // Profile
    userProfile: profile.userProfile,
    setUserProfile: profile.setUserProfile,
    userStats: profile.userStats,
    setUserStats: profile.setUserStats,
    userTrainingProfile: profile.userTrainingProfile,
    setUserTrainingProfile: profile.setUserTrainingProfile,
    userCalorieProfile: profile.userCalorieProfile,
    setUserCalorieProfile: profile.setUserCalorieProfile,
    exerciseUserStats: profile.exerciseUserStats,
    setExerciseUserStats: profile.setExerciseUserStats,
    assessments: profile.assessments,
    setAssessments: profile.setAssessments,

    // Workouts
    sessions: workout.sessions,
    setSessions: workout.setSessions,
    templates: workout.templates,
    setTemplates: workout.setTemplates,
    activeWorkout: workout.activeWorkout,
    setActiveWorkout: workout.setActiveWorkout,
    lastCompletedSession: workout.lastCompletedSession,
    setLastCompletedSession: workout.setLastCompletedSession,
    editingTemplate: workout.editingTemplate,
    setEditingTemplate: workout.setEditingTemplate,
    editingSession: workout.editingSession,
    setEditingSession: workout.setEditingSession,
    deletingTemplateId: workout.deletingTemplateId,
    setDeletingTemplateId: workout.setDeletingTemplateId,
    deletingSessionId: workout.deletingSessionId,
    setDeletingSessionId: workout.setDeletingSessionId,
    showWorkoutSelector: workout.showWorkoutSelector,
    setShowWorkoutSelector: workout.setShowWorkoutSelector,
    selectingSheetTemplate: workout.selectingSheetTemplate,
    setSelectingSheetTemplate: workout.setSelectingSheetTemplate,
    scrollToHistory: workout.scrollToHistory,
    setScrollToHistory: workout.setScrollToHistory,
    filteredTemplates: workout.filteredTemplates,
    userSessions: workout.userSessions,
    filteredSessions: workout.filteredSessions,

    // Progress
    progressionAlerts: progress.progressionAlerts,
    setProgressionAlerts: progress.setProgressionAlerts,
    stagnationReports: progress.stagnationReports,
    setStagnationReports: progress.setStagnationReports,
    progressScore: progress.progressScore,
    setProgressScore: progress.setProgressScore,
    aiAdvice: progress.aiAdvice,
    setAiAdvice: progress.setAiAdvice,
    isAiLoading: progress.isAiLoading,
    setIsAiLoading: progress.setIsAiLoading,
    calculatedStreak: progress.calculatedStreak,
    personalRecords: progress.personalRecords,

    // Students
    students: students.students,
    setStudents: students.setStudents,
    trainers: students.trainers,
    setTrainers: students.setTrainers,
    trainerConnections: students.trainerConnections,
    setTrainerConnections: students.setTrainerConnections,
    studentConnections: students.studentConnections,
    setStudentConnections: students.setStudentConnections,
    selectedStudentForWorkouts: students.selectedStudentForWorkouts,
    setSelectedStudentForWorkouts: students.setSelectedStudentForWorkouts,
    selectedStudentForEvolution: students.selectedStudentForEvolution,
    setSelectedStudentForEvolution: students.setSelectedStudentForEvolution,

    // Notifications
    notifications: notifs.notifications,
    setNotifications: notifs.setNotifications,

    // Chat
    chatMessages: chat.chatMessages,
    setChatMessages: chat.setChatMessages,
    activeChatStudent: chat.activeChatStudent,
    setActiveChatStudent: chat.setActiveChatStudent,

    // Store
    storeItems: store.storeItems,
    myPurchases: store.myPurchases,
    myListings: store.myListings,
    isLoadingItems: store.isLoadingItems,

    // Composed
    api,
    resetUserStates,
  };
};
