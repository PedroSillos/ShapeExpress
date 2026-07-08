import { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Toaster, toast } from 'sonner';

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
import { PublishToStoreModal } from './presentation/components/PublishToStoreModal';
import { WorkoutDoneScreen } from './presentation/screens/auth/WelcomeView';
import { OnboardingStreakScreen } from './presentation/screens/auth/OnboardingStreakScreen';
import { OnboardingSuggestProfileScreen } from './presentation/screens/auth/OnboardingSuggestProfileScreen';

import { WorkoutTemplate } from './domain/entities';
import { STORAGE_KEYS } from './shared/lib/storageKeys';

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
  const [publishingTemplate, setPublishingTemplate] = useState<WorkoutTemplate | null>(null);
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

  // Detect Stripe redirect query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const success = params.get('success');
    const canceled = params.get('canceled');
    const sessionId = params.get('session_id');
    const itemId = params.get('item_id');

    if (tab === 'store' && (success || canceled)) {
      window.history.replaceState({}, '', window.location.pathname);

      if (canceled === 'true') {
        toast('Pagamento cancelado.');
        setActiveTab('store' as any);
        return;
      }

      if (success === 'true' && sessionId && itemId) {
        setActiveTab('store' as any);
        api.verifyCheckoutSession(sessionId, itemId)
          .then(() => {
            toast.success('Compra realizada! O treino já está disponível em Meus Treinos.');
          })
          .catch(() => {
            toast.error('Erro ao confirmar pagamento. Entre em contato com o suporte.');
          });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If app was closed during onboarding workout, clean up and restart from landing
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.ONBOARDING_PENDING)) {
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_PENDING);
      localStorage.removeItem(STORAGE_KEYS.WELCOME_DONE);
      localStorage.removeItem(STORAGE_KEYS.WELCOME_ANSWERS);
      localStorage.removeItem(STORAGE_KEYS.PENDING_TEMPLATES);
      setTemplates([]);
      setActiveTab('landing');
    }
  }, []);


  useEffect(() => {
    if (!isLoggedIn && !lastCompletedSession && !activeWorkout && !onboardingSession && activeTab !== 'landing' && activeTab !== 'welcome' && activeTab !== 'login' && activeTab !== 'forgot-password' && activeTab !== 'register') {
      if (!localStorage.getItem(STORAGE_KEYS.WELCOME_DONE)) setActiveTab('landing');
    }
  }, [isLoggedIn, activeTab, lastCompletedSession, activeWorkout, onboardingSession]);

  const mainTabs = userProfile?.userType === 'treinador'
    ? ['dashboard', 'workouts', 'stats', 'store', 'students', 'perfil']
    : ['dashboard', 'workouts', 'stats', 'store', 'trainers', 'perfil'];

  const switchTab = (tab: string) => {
    if (activeTab === tab) return;
    // Route guard: redirect to the correct tab for each user type
    const isTrainer = userProfile?.userType === 'treinador';
    if (tab === 'trainers' && isTrainer) tab = 'students';
    if (tab === 'students' && !isTrainer) tab = 'trainers';
    setSwipeDirection(0);
    setActiveTab(tab as any); // eslint-disable-line
  };

  // Capture onboarding session once, then clear it from shared state
  useEffect(() => {
    if (lastCompletedSession && !isLoggedIn) {
      localStorage.setItem(STORAGE_KEYS.WELCOME_DONE, '1');
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_PENDING);
      // Apply weeklyGoal chosen during onboarding to userStats
      try {
        const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null');
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
  const routerState = { ...appState, switchTab, selectedStudentForProfile, setSelectedStudentForProfile, publishingTemplate, setPublishingTemplate: (t: WorkoutTemplate | null) => setPublishingTemplate(t), studentTemplates, setStudentTemplates, onShowSuggestProfile: () => setShowSuggestProfile(true), onShowStreak: () => { setShowSuggestProfile(false); setShowOnboardingStreak(true); } };

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
          {publishingTemplate && (
            <PublishToStoreModal
              initialTemplate={publishingTemplate}
              templates={filteredTemplates}
              userProfile={userProfile}
              onPublish={async (payload) => {
                const item = await api.publishStoreItem(payload, userProfile);
                setPublishingTemplate(null);
                return item;
              }}
              onClose={() => setPublishingTemplate(null)}
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
