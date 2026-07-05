import { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';

import { useAppState } from './presentation/hooks/useAppState';
import { useDataSync } from './presentation/hooks/useDataSync';
import { useWorkout } from './presentation/hooks/useWorkout';
import { useWeeklyGoal } from './presentation/hooks/useWeeklyGoal';
import { useChatListener } from './presentation/hooks/useChatListener';
import { useAiAdvice } from './presentation/hooks/useAiAdvice';

import { AppNavBar } from './presentation/AppNavBar';
import { AppRouter } from './presentation/AppRouter';

import { LogoutModal } from './presentation/components/AppModals';
import { DeleteTemplateModal } from './presentation/components/AppModals';
import { WorkoutSelectorModal } from './presentation/components/AppModals';
import { SheetSelectorModal } from './presentation/components/AppModals';
import { CreateAdModal } from './presentation/components/CreateAdModal';
import { WorkoutDoneScreen } from './presentation/screens/auth/WelcomeView';
import { OnboardingStreakScreen } from './presentation/screens/auth/OnboardingStreakScreen';
import { OnboardingSuggestProfileScreen } from './presentation/screens/auth/OnboardingSuggestProfileScreen';

import { WorkoutTemplate } from './domain/entities';

export default function App() {
  const appState = useAppState();
  const {
    activeTab, setActiveTab,
    isLoggedIn,
    swipeDirection, setSwipeDirection,
    showLogoutConfirm, setShowLogoutConfirm,
    deletingTemplateId, setDeletingTemplateId,
    showWorkoutSelector, setShowWorkoutSelector,
    selectingSheetTemplate, setSelectingSheetTemplate,
    lastCompletedSession, setLastCompletedSession,
    stagnationReports, setStagnationReports,
    progressionAlerts,
    userStats, setUserStats,
    userProfile, setUserProfile,
    sessions, setSessions,
    templates, setTemplates,
    assessments, setAssessments,
    activeWorkout, setActiveWorkout,
    userTrainingProfile, setUserTrainingProfile,
    exerciseUserStats, setExerciseUserStats,
    userCalorieProfile, setUserCalorieProfile,
    activeChatStudent, setChatMessages,
    notifications,
    userSessions, filteredTemplates,
    progressScore, aiAdvice, isAiLoading, setAiAdvice, setIsAiLoading,
    api,
    selectedStudentForWorkouts,
  } = appState;

  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<any>(null);
  const [creatingAdTemplate, setCreatingAdTemplate] = useState<WorkoutTemplate | null>(null);
  const [studentTemplates, setStudentTemplates] = useState<WorkoutTemplate[]>([]);
  const [showOnboardingStreak, setShowOnboardingStreak] = useState(false);
  const [showSuggestProfile, setShowSuggestProfile] = useState(false);
  const [onboardingSession, setOnboardingSession] = useState<typeof lastCompletedSession>(null);

  const dataSync = useDataSync({
    api,
    setUserProfile, setUserStats,
  });

  const workout = useWorkout({
    api, userProfile, userStats, userTrainingProfile,
    exerciseUserStats, userCalorieProfile, assessments,
    sessions, templates, userSessions, activeWorkout,
    setActiveWorkout, setShowWorkoutSelector,
    setLastCompletedSession, setProgressionAlerts: appState.setProgressionAlerts,
    setStagnationReports, setUserTrainingProfile,
    setExerciseUserStats, setUserCalorieProfile,
    createSession: dataSync.createSession,
    updateStats: dataSync.updateStats,
  });

  useWeeklyGoal({
    isLoggedIn, userSessions, userStats,
    updateStats: dataSync.updateStats,
  });

  useChatListener({ activeChatStudent, userProfile, setChatMessages });

  useAiAdvice({
    isLoggedIn, activeTab, userProfile, userSessions,
    stagnationReports, progressScore,
    aiAdvice, isAiLoading, setAiAdvice, setIsAiLoading,
  });

  useEffect(() => {
    if (!selectedStudentForWorkouts) { setStudentTemplates([]); return; }
    api.getStudentTemplates(selectedStudentForWorkouts.email).then(setStudentTemplates);
  }, [selectedStudentForWorkouts?.email]);

  // If app was closed during onboarding workout, clean up and restart from landing
  useEffect(() => {
    if (localStorage.getItem('onboarding-workout-pending')) {
      localStorage.removeItem('onboarding-workout-pending');
      localStorage.removeItem('welcome-done');
      localStorage.removeItem('welcome-answers');
      localStorage.removeItem('pending-templates');
      setTemplates([]);
      setActiveTab('landing');
    }
  }, []);


  useEffect(() => {
    if (!isLoggedIn && !lastCompletedSession && !activeWorkout && !onboardingSession && activeTab !== 'landing' && activeTab !== 'welcome' && activeTab !== 'login' && activeTab !== 'forgot-password' && activeTab !== 'register') {
      if (!localStorage.getItem('welcome-done')) setActiveTab('landing');
    }
  }, [isLoggedIn, activeTab, lastCompletedSession, activeWorkout, onboardingSession]);

  const mainTabs = ['dashboard', 'workouts', 'stats', userProfile?.userType === 'treinador' ? 'students' : 'express', 'perfil'];

  const switchTab = (tab: string) => {
    if (activeTab === tab) return;
    setSwipeDirection(0);
    setActiveTab(tab as any); // eslint-disable-line
  };

  // Capture onboarding session once, then clear it from shared state
  useEffect(() => {
    if (lastCompletedSession && !isLoggedIn) {
      localStorage.setItem('welcome-done', '1');
      localStorage.removeItem('onboarding-workout-pending');
      // Apply weeklyGoal chosen during onboarding to userStats
      try {
        const wa = JSON.parse(localStorage.getItem('welcome-answers') ?? 'null');
        if (wa?.weeklyGoal && wa.weeklyGoal !== userStats.weeklyGoal) {
          setUserStats({ ...userStats, weeklyGoal: wa.weeklyGoal });
        }
      } catch {}
      setOnboardingSession(lastCompletedSession);
      setLastCompletedSession(null);
    }
  }, [lastCompletedSession, isLoggedIn]);

  if (onboardingSession) {
    return (
      <WorkoutDoneScreen
        session={onboardingSession}
        onContinue={() => {
          setOnboardingSession(null);
          setShowOnboardingStreak(true);
        }}
      />
    );
  }

  if (lastCompletedSession) {
    return (
      <WorkoutDoneScreen
        session={lastCompletedSession}
        onContinue={() => { setLastCompletedSession(null); setStagnationReports([]); setActiveTab('dashboard'); }}
      />
    );
  }

  if (showOnboardingStreak) {
    return <OnboardingStreakScreen onContinue={() => { setShowOnboardingStreak(false); setShowSuggestProfile(true); }} />;
  }

  if (showSuggestProfile) {
    return (
      <OnboardingSuggestProfileScreen
        onCreateProfile={() => { setShowSuggestProfile(false); setActiveTab('register'); }}
        onSkip={() => { setShowSuggestProfile(false); setActiveTab('dashboard'); }}
      />
    );
  }

  const currentAnimations = document.documentElement.getAttribute('data-animations') || 'enabled';
  const routerState = { ...appState, switchTab, selectedStudentForProfile, setSelectedStudentForProfile, creatingAdTemplate, setCreatingAdTemplate, studentTemplates, setStudentTemplates, onShowSuggestProfile: () => setShowSuggestProfile(true), onShowStreak: () => { setShowSuggestProfile(false); setShowOnboardingStreak(true); } };

  if (activeTab === 'landing' || activeTab === 'welcome' || activeTab === 'login' || activeTab === 'register' || activeTab === 'forgot-password') {
    return (
      <MotionConfig transition={currentAnimations === 'reduced' ? { duration: 0 } : undefined}>
        <Toaster position="top-center" richColors />
        <AppRouter state={routerState} workout={workout} dataSync={dataSync} />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig transition={currentAnimations === 'reduced' ? { duration: 0 } : undefined}>
      <div className="min-h-screen pb-24 max-w-md mx-auto relative overflow-x-hidden">
        <Toaster position="top-center" richColors />

        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (activeWorkout ? '-active' : '')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col px-6"
            >
              <AppRouter state={routerState} workout={workout} dataSync={dataSync} />
            </motion.div>
          </AnimatePresence>
        </main>

        <AppNavBar
          isLoggedIn={isLoggedIn}
          activeTab={activeTab}
          activeWorkout={activeWorkout}
          userProfile={userProfile}
          switchTab={switchTab}
          onStudentsClick={() => { setSelectedStudentForProfile(null); switchTab('students'); }}
        />

        <WorkoutSelectorModal
          open={showWorkoutSelector}
          templates={filteredTemplates}
          userTrainingProfile={userTrainingProfile}
          exerciseUserStats={exerciseUserStats}
          onClose={() => setShowWorkoutSelector(false)}
          onSelectTemplate={(t: WorkoutTemplate) => {
            const hasSheets = t.sheets && t.sheets.length > 0;
            if (hasSheets && t.sheets!.length > 1) { setSelectingSheetTemplate(t); setShowWorkoutSelector(false); }
            else { workout.startWorkout(t, hasSheets ? 0 : undefined); }
          }}
          onCreateWorkout={() => { setShowWorkoutSelector(false); setActiveTab('create-workout'); }}
        />

        <SheetSelectorModal
          template={selectingSheetTemplate}
          onClose={() => setSelectingSheetTemplate(null)}
          onSelectSheet={(t, i) => { workout.startWorkout(t, i); setSelectingSheetTemplate(null); }}
        />

        <LogoutModal
          open={showLogoutConfirm}
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={async () => { await api.logout(); setShowLogoutConfirm(false); }}
        />

        <AnimatePresence>
          {creatingAdTemplate && (
            <CreateAdModal
              template={creatingAdTemplate}
              onClose={() => setCreatingAdTemplate(null)}
              onSubmit={async (adData: any) => {
                await api.createProtocol(adData);
                setCreatingAdTemplate(null);
              }}
            />
          )}
        </AnimatePresence>

        <DeleteTemplateModal
          templateId={deletingTemplateId}
          onCancel={() => setDeletingTemplateId(null)}
          onConfirm={(id) => { dataSync.deleteTemplate(id); setDeletingTemplateId(null); }}
        />

      </div>
    </MotionConfig>
  );
}
