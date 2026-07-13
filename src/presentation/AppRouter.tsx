import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { Student, UserProfile, WorkoutTemplate, WorkoutSession, StoreItem, StorePurchase } from '../domain/entities';
import { DEFAULT_PROFILE } from '../constants';
import type { PublishPayload } from './hooks/useStoreState';
import { STORAGE_KEYS } from '../shared/lib/storageKeys';

// Screens
import { LandingView } from './screens/auth/LandingView';
import { WelcomeView } from './screens/auth/WelcomeView';
import { LoginView } from './screens/auth/LoginView';
import { RegisterView } from './screens/auth/RegisterView';
import { ForgotPasswordView } from './screens/auth/ForgotPasswordView';
import { DashboardView } from './screens/DashboardView';
import { CalendarView } from './screens/CalendarView';
import { WorkoutsView } from './screens/WorkoutsView';
import { StatsContainer } from './screens/StatsContainer';
import { TrainersScreen } from './screens/TrainersScreen';
import { LojasScreen } from './screens/LojasScreen';
import { PurchasedProductsView } from './screens/PurchasedProductsView';
import { StudentsView } from './screens/StudentsView';
import { WorkoutTemplatesView } from './screens/WorkoutTemplatesView';
import { StudentEvolutionView } from './screens/StudentEvolutionView';
import { CreateWorkoutView } from './screens/CreateWorkoutView';
import { ActiveWorkoutView } from './screens/ActiveWorkoutView';
import { BodyAssessmentView as NewAssessmentView } from './screens/BodyAssessmentView';
import { generateWorkoutAI } from '../data/services/aiService';
import { ProfileGuestView, ProfileUserView } from '../features/profile';


interface AppRouterProps {
  state: any;
  workout: any;
  dataSync: any;
}

export function AppRouter({ state, workout, dataSync }: AppRouterProps) {
  const {
    activeTab, setActiveTab,
    isLoggedIn,
    activeWorkout, setActiveWorkout,
    editingSession, setEditingSession,
    editingTemplate, setEditingTemplate,
    editingAssessment, setEditingAssessment,
    userProfile, setUserProfile,
    currentUserEmail,
    userStats,
    userSessions, filteredSessions, filteredTemplates,
    setTemplates,
    userTrainingProfile, exerciseUserStats, userCalorieProfile,
    assessments,
    students, setStudents,
    trainers,
    studentConnections, setStudentConnections,
    trainerConnections,
    selectedStudentForWorkouts, setSelectedStudentForWorkouts,
    selectedStudentForEvolution, setSelectedStudentForEvolution,
    selectedStudentForProfile, setSelectedStudentForProfile,
    studentTemplates, setStudentTemplates,
    setDeletingTemplateId,
    setScrollToHistory, scrollToHistory,
    setShowLogoutConfirm,
    progressScore,
    calculatedStreak, personalRecords,
    api, switchTab,
    onShowSuggestProfile, onShowStreak,
    storeItems, myPurchases, myListings, isLoadingItems,
  } = state;

  const previousTabRef = useRef<string>('landing');
  if (activeTab !== 'login' && activeTab !== 'register' && activeTab !== 'forgot-password') {
    previousTabRef.current = activeTab;
    try { localStorage.setItem(STORAGE_KEYS.PREVIOUS_TAB, activeTab); } catch {}
  }

  const {
    startWorkout, finishWorkout,
  } = workout;

  const {
    updateProfile, updateStats,
    createTemplate, updateTemplate, deleteTemplate,
    createSession, updateSession, deleteSession,
    createAssessment, updateAssessment, deleteAssessment,
  } = dataSync;

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [publishingTemplate, setPublishingTemplate] = useState<WorkoutTemplate | null>(null);

  const handleGenerateWithAI = async () => {
    if (isGeneratingAI) return;
    setIsGeneratingAI(true);
    try {
      // Logged-in: use cloud profile fields
      // Guest: fall back to WELCOME_ANSWERS from onboarding
      let sports: string[];
      let objective: string | undefined;
      let experience: string | undefined;
      let height: number | undefined;
      let weight: number | undefined;
      let age: number | undefined;

      if (isLoggedIn) {
        sports = userProfile?.specialties ?? [];
        objective = userProfile?.objective;
        experience = userProfile?.experienceLevel;
        height = userProfile?.height;
        weight = userProfile?.initialWeight;
        age = userProfile?.birthDate
          ? new Date().getFullYear() - new Date(userProfile.birthDate).getFullYear()
          : undefined;
      } else {
        const wa = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null'); } catch { return null; } })();
        sports = wa?.sports ?? [];
        objective = wa?.objective;
        experience = wa?.experiences ? (Object.values(wa.experiences)[0] as string | undefined) : undefined;
        height = undefined;
        weight = undefined;
        age = undefined;
      }

      const now = new Date();
      const end = new Date(now); end.setMonth(end.getMonth() + 3);

      let template: WorkoutTemplate | null = null;
      try {
        const ai = await generateWorkoutAI({ sports, objective, experience, height, weight, age });
        if (ai && ai.exercises?.length > 0) {
          template = {
            id: `ai-${Date.now()}`,
            userId: userProfile?.email ?? 'user',
            name: ai.name,
            category: 'basic' as const,
            startDate: now.toISOString(),
            endDate: end.toISOString(),
            exercises: ai.exercises,
            exerciseIds: ai.exercises.map((e: any) => e.exerciseId),
          };
        }
      } catch { /* fallback below */ }

      if (!template) {
        const { generateFirstWorkout } = await import('../domain/use-cases/generateFirstWorkout');
        const fallback = generateFirstWorkout(sports, userProfile?.email ?? 'user', experience);
        template = fallback;
      }

      await createTemplate(template);
    } catch (err) {
      console.error('Generate AI workout error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (activeWorkout) return (
    <ActiveWorkoutView
      session={activeWorkout}
      setSession={setActiveWorkout}
      onFinish={finishWorkout}
      onCancel={() => {
        if (localStorage.getItem(STORAGE_KEYS.ONBOARDING_PENDING)) {
          localStorage.removeItem(STORAGE_KEYS.ONBOARDING_PENDING);
          localStorage.removeItem(STORAGE_KEYS.WELCOME_DONE);
          localStorage.removeItem(STORAGE_KEYS.WELCOME_ANSWERS);
          localStorage.removeItem(STORAGE_KEYS.PENDING_TEMPLATES);
          state.setTemplates([]);
          setActiveWorkout(null);
          setActiveTab('landing');
        } else {
          setActiveWorkout(null);
        }
      }}
      sessions={userSessions}
      templates={filteredTemplates}
      userProfile={userTrainingProfile}
      exerciseStats={exerciseUserStats}
      mainUserProfile={userProfile}
    />
  );

  if (editingSession) return (
    <ActiveWorkoutView
      isEditing
      session={editingSession}
      setSession={setEditingSession}
      onFinish={() => {
        const updated = {
          ...editingSession,
          totalVolume: editingSession.exercises.reduce((acc: number, ex: any) =>
            acc + ex.sets.reduce((s: number, set: any) => s + (set.completed ? set.reps * set.weight : 0), 0), 0),
        };
        updateSession(updated);
        setEditingSession(null);
      }}
      onCancel={() => setEditingSession(null)}
      sessions={userSessions}
      templates={filteredTemplates}
      userProfile={userTrainingProfile}
      exerciseStats={exerciseUserStats}
      mainUserProfile={userProfile}
    />
  );

  switch (activeTab) {
    case 'landing':
      return (
        <LandingView
          onStart={() => setActiveTab('welcome')}
          onLogin={() => setActiveTab('login')}
        />
      );
    case 'welcome':
      return (
        <WelcomeView
          onBack={() => setActiveTab('landing')}
          onContinue={async (answers) => {
            const a = answers as any;
            const sports: string[] = a.sports ?? [];
            const now = new Date();
            const end = new Date(now); end.setMonth(end.getMonth() + 3);

            // Clear any stale onboarding data from previous runs before creating a fresh template.
            // This prevents ghost templates/sessions from appearing if the user redid the onboarding
            // or if HMR caused the hook to re-mount with leftover localStorage data.
            localStorage.removeItem(STORAGE_KEYS.PENDING_TEMPLATES);
            localStorage.removeItem(STORAGE_KEYS.LOCAL_SESSIONS);
            state.setTemplates([]);
            state.setSessions([]);

            // Build template: try AI first, fall back to static
            const buildTemplate = async (): Promise<WorkoutTemplate> => {
              try {
                const ai = await generateWorkoutAI({
                  sports,
                  objective: a.objective,
                  experience: Object.values(a.experiences ?? {})[0] as string | undefined,
                  height: a.height,
                  weight: a.weight,
                  age: a.birthDate ? new Date().getFullYear() - new Date(a.birthDate).getFullYear() : undefined,
                });
                if (ai && ai.exercises?.length > 0) {
                  return {
                    id: `first-${Date.now()}`,
                    userId: 'guest',
                    name: ai.name,
                    category: 'basic' as const,
                    startDate: now.toISOString(),
                    endDate: end.toISOString(),
                    exercises: ai.exercises,
                    exerciseIds: ai.exercises.map((e: any) => e.exerciseId),
                  };
                }
              } catch { /* fallback below */ }
              const { generateFirstWorkout } = await import('../domain/use-cases/generateFirstWorkout');
              return generateFirstWorkout(sports, 'guest', Object.values(a.experiences ?? {})[0] as string | undefined);
            };

            const template = await buildTemplate();

            // api.createTemplate handles both React state update AND localStorage (pending-templates)
            // atomically — do NOT call state.setTemplates or push to localStorage separately.
            // silent=true: the user is about to start the workout, no need for a toast.
            await api.createTemplate(template, true);

            try { localStorage.setItem(STORAGE_KEYS.WELCOME_ANSWERS, JSON.stringify(answers)); } catch {}
            if (a.weeklyGoal) {
              state.setUserStats({ ...state.userStats, weeklyGoal: a.weeklyGoal });
            }

            if (a.skipWorkout) {
              localStorage.setItem(STORAGE_KEYS.WELCOME_DONE, '1');
              state.onShowSuggestProfile?.() ?? setActiveTab('dashboard');
              return;
            }

            localStorage.setItem(STORAGE_KEYS.WELCOME_DONE, '1');
            localStorage.setItem(STORAGE_KEYS.ONBOARDING_PENDING, '1');
            workout.startWorkout(template);
          }}
        />
      );
    case 'login':
      return (
        <LoginView
          api={api}
          onLogin={async (email: string, password: string) => {
            const data = await api.login(email, password);
            setUserProfile(data.user);
            const defaultTab = localStorage.getItem(STORAGE_KEYS.DEFAULT_TAB) || 'dashboard';
            setActiveTab(defaultTab as any);
          }}
          onForgotPassword={() => setActiveTab('forgot-password')}
          onRegister={() => setActiveTab('register')}
          onBack={() => setActiveTab((localStorage.getItem(STORAGE_KEYS.PREVIOUS_TAB) || 'landing') as any)}
        />
      );
    case 'register':
      return (
        <RegisterView
          onRegister={async (p: any) => {
            const pending = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null'); } catch { return null; } })();
            const merged = pending ? {
              ...p,
              objective: pending.objective ?? p.objective,
              height: pending.height ? Number(pending.height) : p.height,
              initialWeight: pending.weight ? Number(pending.weight) : p.initialWeight,
              birthDate: pending.birthDate ?? p.birthDate,
              weeklyGoal: pending.weeklyGoal ?? p.weeklyGoal,
            } : p;
            const data = await api.register(merged);
            localStorage.removeItem(STORAGE_KEYS.WELCOME_ANSWERS);
            setUserProfile(data.user);
            const defaultTab = localStorage.getItem(STORAGE_KEYS.DEFAULT_TAB) || 'dashboard';
            setActiveTab(defaultTab as any);
          }}
          onBack={() => {
            const previousTab = localStorage.getItem(STORAGE_KEYS.PREVIOUS_TAB) || 'landing';
            const hasOnboardingAnswers = !!localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS);
            if (previousTab === 'perfil') {
              setActiveTab('perfil' as any);
            } else if (hasOnboardingAnswers && onShowSuggestProfile) {
              onShowSuggestProfile();
            } else {
              setActiveTab('login');
            }
          }}
          onGoToLogin={() => setActiveTab('login')}
          api={api}
        />
      );
    case 'forgot-password':
      return <ForgotPasswordView api={api} onBack={() => setActiveTab('login')} />;
    case 'dashboard':
      return (
        <DashboardView
          userStats={{ ...userStats, streak: calculatedStreak }}
          sessions={userSessions}
          templates={filteredTemplates}
          onStartWorkout={(template?: WorkoutTemplate) => {
            if (template) {
              const hasSheets = template.sheets && template.sheets.length > 0;
              if (hasSheets && template.sheets!.length > 1) {
                state.setSelectingSheetTemplate(template);
              } else {
                startWorkout(template, hasSheets ? 0 : undefined);
              }
            } else {
              switchTab('workouts');
            }
          }}
          userProfile={userTrainingProfile}
          exerciseStats={exerciseUserStats}
          calorieProfile={userCalorieProfile}
          assessments={assessments}
          mainUserProfile={userProfile}
          progressScore={progressScore}
          switchTab={switchTab}
          personalRecords={personalRecords}
          studentConnections={studentConnections}
          trainers={trainers}
          isLoggedIn={isLoggedIn}
        />
      );
    case 'calendar':
      return <CalendarView sessions={filteredSessions} />;
    case 'workouts':
      return (
        <WorkoutsView
          templates={filteredTemplates}
          sessions={filteredSessions}
          onStartWorkout={startWorkout}
          onCreateWorkout={() => setActiveTab('create-workout')}
          onGenerateWithAI={handleGenerateWithAI}
          onEditWorkout={(t: WorkoutTemplate) => { setEditingTemplate(t); setActiveTab('edit-workout'); }}
          onDeleteWorkout={(id: string) => setDeletingTemplateId(id)}
          onGoToStore={() => switchTab('store')}
          onEditSession={(s: WorkoutSession) => setEditingSession(s)}
          onDeleteSession={deleteSession}
          scrollToHistory={scrollToHistory}
          onScrollHandled={() => setScrollToHistory(false)}
          userProfile={userTrainingProfile}
          exerciseStats={exerciseUserStats}
          calorieProfile={userCalorieProfile}
          assessments={assessments}
          mainUserProfile={userProfile}
          trainers={trainers}
          onCreateAd={(t: WorkoutTemplate) => setPublishingTemplate(t)}
          isLoggedIn={isLoggedIn}
        />
      );
    case 'stats':
      return (
        <StatsContainer
          sessions={userSessions}
          templates={filteredTemplates}
          mainUserProfile={userProfile}
          onGoToWorkouts={() => switchTab('workouts')}
        />
      );
    case 'store':
      return (
        <LojasScreen
          storeItems={(storeItems as StoreItem[]) ?? []}
          myPurchases={(myPurchases as StorePurchase[]) ?? []}
          isLoadingItems={!!isLoadingItems}
          onGoToWorkouts={() => switchTab('workouts')}
          createCheckoutSession={api.createCheckoutSession}
        />
      );
    case 'trainers':
    case 'express':
      return (
        <TrainersScreen
          trainers={trainers}
          onConnect={async (code: string) => {
            await api.requestConnection(code);
            const [connections, profile] = await Promise.all([
              api.getStudentConnections(), api.getProfile(),
            ]);
            setStudentConnections(connections);
            setUserProfile((profile as UserProfile) || DEFAULT_PROFILE);
          }}
          onDisconnect={async (trainerEmail: string) => {
            await api.disconnectTrainer(trainerEmail);
            const [connections, profile] = await Promise.all([
              api.getStudentConnections(), api.getProfile(),
            ]);
            setStudentConnections(connections);
            setUserProfile((profile as UserProfile) || DEFAULT_PROFILE);
          }}
          studentConnections={studentConnections}
        />
      );
    case 'purchased-products':
      return <PurchasedProductsView onBack={() => switchTab('store')} />;
    case 'students':
      return (
        <StudentsView
          students={students} userProfile={userProfile}
          pendingRequests={trainerConnections.filter((c: any) => c.status === 'pending')}
          onRespond={async (id: string, status: any) => {
            await api.respondToConnection(id, status);
            await Promise.all([api.getStudents(), api.getTrainerConnections()]);
          }}
          onDisconnect={async (email: string) => { await api.disconnectStudent(email); }}
          onViewWorkouts={(student: Student) => { setSelectedStudentForWorkouts(student); setActiveTab('student-workouts'); }}
          onViewEvolution={(student: Student) => { setSelectedStudentForEvolution(student); setActiveTab('student-evolution'); }}
          selectedStudentForProfile={selectedStudentForProfile}
          setSelectedStudentForProfile={(s: Student | null) => setSelectedStudentForProfile(s)}
        />
      );
    case 'student-workouts':
      return selectedStudentForWorkouts ? (
        <WorkoutTemplatesView
          studentName={selectedStudentForWorkouts.name}
          templates={studentTemplates}
          onSelect={(t: WorkoutTemplate) => { setEditingTemplate(t); setActiveTab('edit-workout'); }}
          onAdd={() => setActiveTab('create-workout')}
          onDelete={async (id: string) => {
            await deleteTemplate(id);
            setStudentTemplates((prev: WorkoutTemplate[]) => prev.filter(t => t.id !== id));
          }}
          onBack={() => { setSelectedStudentForWorkouts(null); setActiveTab('students'); }}
        />
      ) : null;
    case 'student-evolution':
      return selectedStudentForEvolution && userProfile ? (
        <StudentEvolutionView
          student={selectedStudentForEvolution}
          trainerEmail={userProfile.email}
          api={api}
          onBack={() => { setSelectedStudentForEvolution(null); setActiveTab('students'); }}
        />
      ) : null;
    case 'create-workout':
      return (
        <CreateWorkoutView
          userProfile={userProfile}
          studentEmail={selectedStudentForWorkouts?.email}
          onSave={async (t: WorkoutTemplate) => {
            await createTemplate(t);
            if (selectedStudentForWorkouts) api.getStudentTemplates(selectedStudentForWorkouts.email).then(setStudentTemplates);
            setActiveTab(selectedStudentForWorkouts ? 'student-workouts' : 'workouts');
          }}
          onCancel={() => setActiveTab(selectedStudentForWorkouts ? 'student-workouts' : 'workouts')}
        />
      );
    case 'edit-workout':
      return editingTemplate ? (
        <CreateWorkoutView
          userProfile={userProfile}
          studentEmail={selectedStudentForWorkouts?.email || editingTemplate.userId}
          initialTemplate={editingTemplate}
          onSave={async (t: WorkoutTemplate) => {
            await updateTemplate(t);
            setEditingTemplate(null);
            if (selectedStudentForWorkouts) api.getStudentTemplates(selectedStudentForWorkouts.email).then(setStudentTemplates);
            setActiveTab(selectedStudentForWorkouts ? 'student-workouts' : 'workouts');
          }}
          onCancel={() => { setEditingTemplate(null); setActiveTab(selectedStudentForWorkouts ? 'student-workouts' : 'workouts'); }}
        />
      ) : null;
    case 'new-assessment':
      return (
        <NewAssessmentView
          assessments={assessments}
          onSave={(a: any) => { createAssessment(a); setActiveTab('stats'); }}
          onDelete={deleteAssessment}
          onBack={() => setActiveTab('stats')}
        />
      );
    case 'edit-assessment':
      return editingAssessment ? (
        <NewAssessmentView
          assessments={assessments}
          onSave={(a: any) => { updateAssessment(a); setEditingAssessment(null); setActiveTab('stats'); }}
          onDelete={deleteAssessment}
          onBack={() => { setEditingAssessment(null); setActiveTab('stats'); }}
        />
      ) : null;
    case 'perfil': {
      // Logged-in: use cloud profile specialties. Guest: fallback to onboarding answers.
      const sports: string[] = isLoggedIn
        ? (userProfile?.specialties ?? [])
        : (() => { try { const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null'); return wa?.sports ?? []; } catch { return []; } })();
      // Friends = trainer connections (athletes) + students (trainers)
      const friendsCount =
        (studentConnections?.length ?? 0) + (students?.length ?? 0) + (trainers?.length ?? 0);
      return isLoggedIn ? (
        <ProfileUserView
          userProfile={{ ...userProfile, email: userProfile.email || currentUserEmail || '' }}
          userStats={userStats}
          streak={state.calculatedStreak ?? userStats.streak ?? 0}
          sports={sports}
          friendsCount={friendsCount}
          onAddFriends={() => switchTab(userProfile?.userType === 'treinador' ? 'students' : 'trainers')}
          onSettings={() => state.setShowSettings(true)}
        />
      ) : (
        <ProfileGuestView
          onCreateProfile={() => setActiveTab('register')}
          onLogin={() => setActiveTab('login')}
        />
      );
    }
    default:
      return null;
  }
}
