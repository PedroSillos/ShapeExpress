import { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';

import { useAppState } from './presentation/hooks/useAppState';
import { useDataSync } from './presentation/hooks/useDataSync';
import { useWorkout } from './presentation/hooks/useWorkout';
import { useWeeklyGoal } from './presentation/hooks/useWeeklyGoal';
import { useChatListener } from './presentation/hooks/useChatListener';
import { useAiAdvice } from './presentation/hooks/useAiAdvice';

import { AppHeader } from './presentation/AppHeader';
import { AppNavBar } from './presentation/AppNavBar';
import { AppRouter } from './presentation/AppRouter';

import { LogoutModal } from './presentation/components/AppModals';
import { DeleteTemplateModal } from './presentation/components/AppModals';
import { WorkoutSelectorModal } from './presentation/components/AppModals';
import { SheetSelectorModal } from './presentation/components/AppModals';
import { WorkoutSummaryModal } from './presentation/components/WorkoutSummaryModal';
import { CreateAdModal } from './presentation/components/CreateAdModal';
import { Logo } from './presentation/components/Logo';
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
    api, initialLoading,
    selectedStudentForWorkouts,
    recommendedCommunities, setRecommendedCommunities,
  } = appState;

  // Local state not in useAppState
  const [communityInitialTab, setCommunityInitialTab] = useState<'feed' | 'challenges' | 'ranking'>('feed');
  const [communityInitialRankingType, setCommunityInitialRankingType] = useState<'community' | 'global' | 'league' | 'friends'>('community');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<any>(null);
  const [creatingAdTemplate, setCreatingAdTemplate] = useState<WorkoutTemplate | null>(null);
  const [studentTemplates, setStudentTemplates] = useState<WorkoutTemplate[]>([]);
  const [showOnboardingStreak, setShowOnboardingStreak] = useState(false);
  const [showSuggestProfile, setShowSuggestProfile] = useState(false);

  const dataSync = useDataSync({
    api,
    sessions, templates, assessments,
    setSessions, setTemplates, setAssessments,
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

  useEffect(() => {
    if (isLoggedIn && activeTab === 'community' && recommendedCommunities.length === 0) {
      api.getRecommendedCommunities().then(setRecommendedCommunities);
    }
  }, [isLoggedIn, activeTab, recommendedCommunities.length]);

  useEffect(() => {
    if (!isLoggedIn && activeTab !== 'landing' && activeTab !== 'welcome' && activeTab !== 'login' && activeTab !== 'forgot-password' && activeTab !== 'register') {
      if (!localStorage.getItem('welcome-done')) setActiveTab('landing');
    }
  }, [isLoggedIn, activeTab]);

  const mainTabs = ['dashboard', 'community', 'workouts', 'stats', userProfile?.userType === 'treinador' ? 'students' : 'express'];

  const switchTab = (tab: string, initialTab?: any, initialRankingType?: any) => {
    let targetTab = tab;
    if (tab === 'community') {
      setCommunityInitialTab(initialTab || 'feed');
      setCommunityInitialRankingType(initialRankingType || 'community');
    }
    if (activeTab === targetTab) return;
    const ci = mainTabs.indexOf(activeTab);
    const ni = mainTabs.indexOf(targetTab);
    setSwipeDirection(ci !== -1 && ni !== -1 ? (ni > ci ? 1 : -1) : 0);
    setActiveTab(targetTab as any); // eslint-disable-line
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (activeWorkout || !isLoggedIn || !mainTabs.includes(activeTab)) return;
    const ci = mainTabs.indexOf(activeTab);
    if (direction === 'left' && ci < mainTabs.length - 1) { setSwipeDirection(1); setActiveTab(mainTabs[ci + 1] as any); }
    else if (direction === 'right' && ci > 0) { setSwipeDirection(-1); setActiveTab(mainTabs[ci - 1] as any); }
  };

  // Show WorkoutDoneScreen after first onboarding workout
  const isOnboardingWorkoutDone =
    lastCompletedSession !== null &&
    !localStorage.getItem('welcome-done') &&
    !isLoggedIn;

  if (isOnboardingWorkoutDone && lastCompletedSession) {
    return (
      <WorkoutDoneScreen
        session={lastCompletedSession}
        onContinue={() => {
          setLastCompletedSession(null);
          setShowOnboardingStreak(true);
        }}
      />
    );
  }

  if (showOnboardingStreak) {
    return <OnboardingStreakScreen onContinue={() => { localStorage.setItem('welcome-done', '1'); setShowOnboardingStreak(false); setShowSuggestProfile(true); }} />;
  }

  if (showSuggestProfile) {
    return (
      <OnboardingSuggestProfileScreen
        onCreateProfile={() => { setShowSuggestProfile(false); setActiveTab('register'); }}
        onSkip={() => { setShowSuggestProfile(false); setActiveTab('dashboard'); }}
      />
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center space-y-6">
        <Logo size="lg" className="animate-pulse" />
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Carregando Arena...</p>
        </div>
      </div>
    );
  }

  const currentAnimations = document.documentElement.getAttribute('data-animations') || 'enabled';
  const routerState = { ...appState, switchTab, communityInitialTab, communityInitialRankingType, selectedStudentForProfile, setSelectedStudentForProfile, creatingAdTemplate, setCreatingAdTemplate, studentTemplates, setStudentTemplates, onShowSuggestProfile: () => setShowSuggestProfile(true) };

  return (
    <MotionConfig transition={currentAnimations === 'reduced' ? { duration: 0 } : undefined}>
      <div className="min-h-screen pb-24 max-w-md mx-auto relative overflow-x-hidden">
        <Toaster position="top-center" richColors />

        <AppHeader
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          userStats={userStats}
          notifications={notifications}
          onNotificationsClick={() => setActiveTab('notifications')}
          onProfileClick={() => setActiveTab('profile')}
        />

        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait" custom={swipeDirection}>
            <motion.div
              key={activeTab + (activeWorkout ? '-active' : '')}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) handleSwipe('left');
                else if (info.offset.x > 50) handleSwipe('right');
              }}
              initial={{ opacity: 0, x: swipeDirection * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -swipeDirection * 50 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col px-6 touch-pan-y"
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

        <WorkoutSummaryModal
          session={lastCompletedSession}
          userStats={userStats}
          progressionAlerts={progressionAlerts}
          stagnationReports={stagnationReports}
          onClose={() => { setLastCompletedSession(null); setStagnationReports([]); }}
        />
      </div>
    </MotionConfig>
  );
}
