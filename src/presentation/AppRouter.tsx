import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { Student, UserProfile, WorkoutTemplate, WorkoutSession, StoreItem, StorePurchase } from '../domain/entities';
import { fullName } from '../domain/entities';
import { DEFAULT_PROFILE } from '../constants';
import type { PublishPayload } from './hooks/useStoreState';

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
import { NotificationsView } from './screens/NotificationsView';
import { TrainersScreen } from './screens/TrainersScreen';
import { LojasScreen } from './screens/LojasScreen';
import { PurchasedProductsView } from './screens/PurchasedProductsView';
import { ExerciseLibraryView } from './screens/ExerciseLibraryView';
import { StudentsView } from './screens/StudentsView';
import { ChatView } from './screens/ChatView';
import { WorkoutTemplatesView } from './screens/WorkoutTemplatesView';
import { StudentEvolutionView } from './screens/StudentEvolutionView';
import { CreateWorkoutView } from './screens/CreateWorkoutView';
import { ActiveWorkoutView } from './screens/ActiveWorkoutView';
import { BodyAssessmentView as NewAssessmentView } from './screens/BodyAssessmentView';
import { generateFirstWorkoutAI } from '../data/services/aiService';
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
    notifications, setNotifications,
    students, setStudents,
    trainers,
    studentConnections, setStudentConnections,
    trainerConnections,
    activeChatStudent, setActiveChatStudent,
    chatMessages,
    selectedStudentForWorkouts, setSelectedStudentForWorkouts,
    selectedStudentForEvolution, setSelectedStudentForEvolution,
    selectedStudentForProfile, setSelectedStudentForProfile,
    studentTemplates, setStudentTemplates,
    setDeletingTemplateId,
    setScrollToHistory, scrollToHistory,
    setShowLogoutConfirm,
    progressScore, aiAdvice, isAiLoading,
    calculatedStreak, personalRecords,
    api, switchTab,
    onShowSuggestProfile, onShowStreak,
    storeItems, myPurchases, myListings, isLoadingItems,
  } = state;

  const previousTabRef = useRef<string>('landing');
  if (activeTab !== 'login' && activeTab !== 'register' && activeTab !== 'forgot-password') {
    previousTabRef.current = activeTab;
    try { localStorage.setItem('previous-tab', activeTab); } catch {}
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
      const wa = (() => { try { return JSON.parse(localStorage.getItem('welcome-answers') ?? 'null'); } catch { return null; } })();
      const sports: string[] = wa?.sports ?? [];
      const now = new Date();
      const end = new Date(now); end.setMonth(end.getMonth() + 3);
      const age = userProfile?.birthDate
        ? new Date().getFullYear() - new Date(userProfile.birthDate).getFullYear()
        : undefined;

      let template: WorkoutTemplate | null = null;
      try {
        const ai = await generateFirstWorkoutAI({
          sports,
          objective: wa?.objective ?? userProfile?.objective,
          experience: wa?.experiences ? (Object.values(wa.experiences)[0] as string | undefined) : userProfile?.experienceLevel,
          location: wa?.location ?? userProfile?.trainingLocation,
          height: userProfile?.height,
          weight: userProfile?.initialWeight,
          age,
        });
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
        const fallback = generateFirstWorkout(sports, userProfile?.email ?? 'user', userProfile?.experienceLevel);
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
        if (localStorage.getItem('onboarding-workout-pending')) {
          localStorage.removeItem('onboarding-workout-pending');
          localStorage.removeItem('welcome-done');
          localStorage.removeItem('welcome-answers');
          localStorage.removeItem('pending-templates');
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
            localStorage.removeItem('pending-templates');
            localStorage.removeItem('local_sessions');
            state.setTemplates([]);
            state.setSessions([]);

            // Build template: try AI first, fall back to static
            const buildTemplate = async (): Promise<WorkoutTemplate> => {
              try {
                const ai = await generateFirstWorkoutAI({
                  sports,
                  objective: a.objective,
                  experience: Object.values(a.experiences ?? {})[0] as string | undefined,
                  location: a.location,
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

            try { localStorage.setItem('welcome-answers', JSON.stringify(answers)); } catch {}
            if (a.weeklyGoal) {
              state.setUserStats({ ...state.userStats, weeklyGoal: a.weeklyGoal });
            }

            if (a.skipWorkout) {
              localStorage.setItem('welcome-done', '1');
              state.onShowSuggestProfile?.() ?? setActiveTab('dashboard');
              return;
            }

            localStorage.setItem('welcome-done', '1');
            localStorage.setItem('onboarding-workout-pending', '1');
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
            const defaultTab = localStorage.getItem('app-default-tab') || 'dashboard';
            setActiveTab(defaultTab as any);
          }}
          onForgotPassword={() => setActiveTab('forgot-password')}
          onRegister={() => setActiveTab('register')}
          onBack={() => setActiveTab((localStorage.getItem('previous-tab') || 'landing') as any)}
        />
      );
    case 'register':
      return (
        <RegisterView
          onRegister={async (p: any) => {
            const pending = (() => { try { return JSON.parse(localStorage.getItem('welcome-answers') ?? 'null'); } catch { return null; } })();
            const merged = pending ? {
              ...p,
              objective: pending.objective ?? p.objective,
              height: pending.height ? Number(pending.height) : p.height,
              initialWeight: pending.weight ? Number(pending.weight) : p.initialWeight,
              birthDate: pending.birthDate ?? p.birthDate,
              hasPersonal: pending.hasPersonal ?? p.hasPersonal,
              weeklyGoal: pending.weeklyGoal ?? p.weeklyGoal,
            } : p;
            const data = await api.register(merged);
            localStorage.removeItem('welcome-answers');
            setUserProfile(data.user);
            const defaultTab = localStorage.getItem('app-default-tab') || 'dashboard';
            setActiveTab(defaultTab as any);
          }}
          onBack={() => {
            const previousTab = localStorage.getItem('previous-tab') || 'landing';
            const hasOnboardingAnswers = !!localStorage.getItem('welcome-answers');
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
          aiAdvice={aiAdvice}
          isAiLoading={isAiLoading}
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
    case 'notifications':
      return (
        <NotificationsView
          notifications={notifications}
          onBack={() => setActiveTab('dashboard')}
          onMarkAsRead={async (id: string) => {
            try {
              await api.markNotificationRead(id);
              setNotifications((prev: any) => prev.map((n: any) => n.id === id ? { ...n, read: true } : n));
            } catch (e) { console.error(e); }
          }}
          onClearAll={async () => {
            try {
              await api.clearAllNotifications();
              setNotifications([]);
            } catch (e) { console.error(e); }
          }}
          onAction={(notification: any) => {
            switch (notification.type) {
              case 'connection_request':
                if (userProfile?.userType === 'treinador') setActiveTab('students');
                break;
              case 'connection_response':
                if (userProfile?.userType === 'atleta') setActiveTab('trainers');
                break;
              case 'workout_assigned':
                setActiveTab('workouts');
                break;
              case 'chat_message': {
                const senderEmail = notification.data?.senderEmail;
                if (senderEmail) {
                  const student = students.find((s: Student) => s.email === senderEmail);
                  const trainerConn = studentConnections.find((c: any) => c.trainerEmail === senderEmail);
                  if (student) {
                    setActiveChatStudent(student);
                    setActiveTab('chat');
                  } else if (trainerConn) {
                    setActiveChatStudent({
                      id: trainerConn.trainerEmail, name: trainerConn.trainerName,
                      email: trainerConn.trainerEmail,
                      lastWorkout: '', status: 'new', progress: 0, streak: 0,
                      weeklyWorkouts: [0,0,0,0,0,0,0], score: 0,
                    } as Student);
                    setActiveTab('chat');
                  }
                }
                break;
              }
            }
          }}
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
          onMessage={(t: Student) => { setActiveChatStudent(t); setActiveTab('chat'); }}
          onConnect={async (code: string) => {
            await api.requestConnection(code);
            const [connections, profile, notifs] = await Promise.all([
              api.getStudentConnections(), api.getProfile(), api.getNotifications(),
            ]);
            setStudentConnections(connections);
            setUserProfile((profile as UserProfile) || DEFAULT_PROFILE);
            setNotifications(notifs);
          }}
          onDisconnect={async (trainerEmail: string) => {
            await api.disconnectTrainer(trainerEmail);
            const [connections, profile, notifs] = await Promise.all([
              api.getStudentConnections(), api.getProfile(), api.getNotifications(),
            ]);
            setStudentConnections(connections);
            setUserProfile((profile as UserProfile) || DEFAULT_PROFILE);
            setNotifications(notifs);
          }}
          studentConnections={studentConnections}
        />
      );
    case 'purchased-products':
      return <PurchasedProductsView onBack={() => switchTab('store')} />;
    case 'library':
      return <ExerciseLibraryView />;
    case 'students':
      return (
        <StudentsView
          students={students} userProfile={userProfile}
          pendingRequests={trainerConnections.filter((c: any) => c.status === 'pending')}
          onRespond={async (id: string, status: any) => {
            await api.respondToConnection(id, status);
            await Promise.all([api.getStudents(), api.getTrainerConnections()]);
          }}
          onMessage={(student: Student) => { setActiveChatStudent(student); setActiveTab('chat'); }}
          onReminder={async (student: Student) => {
            try {
              await api.sendNotification(student.email, {
                title: 'Lembrete de Pagamento',
                message: `Seu pagamento vence em breve. Entre em contato com seu treinador ${fullName(userProfile)} para regularizar.`,
                timestamp: new Date().toISOString(), type: 'warning',
              });
              toast.success(`Lembrete enviado para ${student.name}!`);
            } catch (e) { toast.error('Erro ao enviar lembrete.'); }
          }}
          onDisconnect={async (email: string) => { await api.disconnectStudent(email); }}
          onViewWorkouts={(student: Student) => { setSelectedStudentForWorkouts(student); setActiveTab('student-workouts'); }}
          onViewEvolution={(student: Student) => { setSelectedStudentForEvolution(student); setActiveTab('student-evolution'); }}
          selectedStudentForProfile={selectedStudentForProfile}
          setSelectedStudentForProfile={(s: Student | null) => setSelectedStudentForProfile(s)}
        />
      );
    case 'chat':
      return activeChatStudent ? (
        <ChatView
          student={activeChatStudent}
          messages={chatMessages[activeChatStudent.id] || []}
          userProfile={userProfile}
          onSendMessage={async (text: string) => {
            try { await api.sendMessage(activeChatStudent.email, text); } catch (e) { console.error(e); }
          }}
          onBack={() => switchTab(userProfile?.userType === 'treinador' ? 'students' : 'trainers')}
        />
      ) : null;
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
      // Sports: from welcome-answers (athletes) or specialties (trainers)
      const sports: string[] = (() => {
        try {
          const wa = JSON.parse(localStorage.getItem('welcome-answers') ?? 'null');
          if (wa?.sports?.length) return wa.sports as string[];
        } catch {}
        if (userProfile?.specialties?.length) return userProfile.specialties;
        return [];
      })();
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
