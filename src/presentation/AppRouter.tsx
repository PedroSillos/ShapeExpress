import { toast } from 'sonner';
import { Student, UserProfile, WorkoutTemplate, WorkoutSession, BodyAssessment } from '../domain/entities';
import { DEFAULT_PROFILE } from '../constants';

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
import { AchievementsView } from './screens/AchievementsView';
import { ProfileView } from './screens/ProfileView';
import { NotificationsView } from './screens/NotificationsView';
import { EditProfileView } from './screens/EditProfileView';
import { CommunityView } from './screens/CommunityView';
import { ExpressView } from './screens/ExpressView';
import { PurchasedProductsView } from './screens/PurchasedProductsView';
import { ExerciseLibraryView } from './screens/ExerciseLibraryView';
import { StudentsView } from './screens/StudentsView';
import { ChatView } from './screens/ChatView';
import { WorkoutTemplatesView } from './screens/WorkoutTemplatesView';
import { StudentEvolutionView } from './screens/StudentEvolutionView';
import { CreateWorkoutView } from './screens/CreateWorkoutView';
import { ActiveWorkoutView } from './screens/ActiveWorkoutView';
import { BodyAssessmentView as NewAssessmentView } from './screens/BodyAssessmentView';
import { SettingsGoalView } from './screens/SettingsGoalView';
import { SettingsNotificationsView } from './screens/SettingsNotificationsView';
import { HelpView } from './screens/HelpView';
import { generateFirstWorkoutAI } from '../data/services/aiService';


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
    userStats,
    userSessions, filteredSessions, filteredTemplates,
    userTrainingProfile, exerciseUserStats, userCalorieProfile,
    assessments,
    notifications, setNotifications,
    students, setStudents,
    trainers,
    studentConnections, setStudentConnections,
    trainerConnections,
    activeChatStudent, setActiveChatStudent,
    chatMessages,
    communityMessages, setCommunityMessages,
    recommendedCommunities, setRecommendedCommunities,
    posts, setPosts,
    communityInitialTab, communityInitialRankingType,
    selectedStudentForWorkouts, setSelectedStudentForWorkouts,
    selectedStudentForEvolution, setSelectedStudentForEvolution,
    selectedStudentForProfile, setSelectedStudentForProfile,
    studentTemplates, setStudentTemplates,
    setDeletingTemplateId,
    setScrollToHistory, scrollToHistory,
    setShowLogoutConfirm,
    setCreatingAdTemplate,
    progressScore, aiAdvice, isAiLoading,
    calculatedStreak, personalRecords,
    api, switchTab,
  } = state;

  const {
    startWorkout, finishWorkout,
  } = workout;

  const {
    updateProfile, updateStats,
    createTemplate, updateTemplate, deleteTemplate,
    createSession, updateSession, deleteSession,
    createAssessment, updateAssessment, deleteAssessment,
  } = dataSync;

  if (!isLoggedIn && activeTab !== 'landing' && activeTab !== 'welcome' && activeTab !== 'login' && activeTab !== 'forgot-password' && activeTab !== 'register') {
    return null;
  }

  if (activeWorkout) return (
    <ActiveWorkoutView
      session={activeWorkout}
      setSession={setActiveWorkout}
      onFinish={finishWorkout}
      onCancel={() => setActiveWorkout(null)}
      sessions={userSessions}
      templates={filteredTemplates}
      userProfile={userTrainingProfile}
      exerciseStats={exerciseUserStats}
      calorieProfile={userCalorieProfile}
      assessments={assessments}
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
      calorieProfile={userCalorieProfile}
      assessments={assessments}
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
            if (a.skipWorkout) {
              setActiveTab('dashboard');
              return;
            }
            const sports: string[] = a.sports ?? [];
            const now = new Date();
            const end = new Date(now); end.setMonth(end.getMonth() + 3);
            try {
              const ai = await generateFirstWorkoutAI({
                sports,
                objective: a.objective,
                experience: Object.values(a.experiences ?? {})[0] as string | undefined,
                location: a.location,
              });
              if (ai && ai.exercises?.length > 0) {
                const template = {
                  id: `first-${Date.now()}`,
                  userId: userProfile?.email ?? '',
                  name: ai.name,
                  category: 'basic' as const,
                  startDate: now.toISOString(),
                  endDate: end.toISOString(),
                  exercises: ai.exercises,
                  exerciseIds: ai.exercises.map((e: any) => e.exerciseId),
                };
                try { const p = JSON.parse(localStorage.getItem('pending-templates') ?? '[]'); p.push(template); localStorage.setItem('pending-templates', JSON.stringify(p)); } catch {}
                workout.startWorkout(template);
                return;
              }
            } catch { /* fallback below */ }
            // Fallback: static generation
            const { generateFirstWorkout } = await import('../domain/use-cases/generateFirstWorkout');
            const template = generateFirstWorkout(sports, userProfile?.email ?? '');
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
          onBack={() => setActiveTab('landing')}
        />
      );
    case 'register':
      return (
        <RegisterView
          onRegister={async (p: any) => {
            const data = await api.register(p);
            setUserProfile(data.user);
            const defaultTab = localStorage.getItem('app-default-tab') || 'dashboard';
            setActiveTab(defaultTab as any);
          }}
          onBack={() => setActiveTab('login')}
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
          onStartWorkout={() => switchTab('workouts')}
          onViewAchievements={() => setActiveTab('achievements')}
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
          onEditWorkout={(t: WorkoutTemplate) => { setEditingTemplate(t); setActiveTab('edit-workout'); }}
          onDeleteWorkout={(id: string) => setDeletingTemplateId(id)}
          onGoToStore={() => switchTab('express')}
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
          onCreateAd={(t: WorkoutTemplate) => setCreatingAdTemplate(t)}
        />
      );
    case 'stats':
      return (
        <StatsContainer
          sessions={userSessions}
          templates={filteredTemplates}
          assessments={assessments}
          onCreateWorkout={() => setActiveTab('create-workout')}
          onGoToStore={() => switchTab('express')}
          onNewAssessment={() => setActiveTab('new-assessment')}
          onDeleteAssessment={deleteAssessment}
          onEditAssessment={(a: BodyAssessment) => { setEditingAssessment(a); setActiveTab('edit-assessment'); }}
        />
      );
    case 'achievements':
      return <AchievementsView onBack={() => setActiveTab('profile')} />;
    case 'profile':
      return (
        <ProfileView
          user={userProfile}
          trainingProfile={userTrainingProfile}
          onLogout={() => setShowLogoutConfirm(true)}
          onEdit={() => setActiveTab('edit-profile')}
          onSettingsGoal={() => setActiveTab('settings-goal')}
          onSettingsNotifications={() => setActiveTab('settings-notifications')}
          onHelp={() => setActiveTab('help')}
          onDeleteAccount={() => api.deleteAccount()}
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
                      email: trainerConn.trainerEmail, avatarUrl: trainerConn.trainerAvatar,
                      status: 'new', progress: 0, streak: 0, weeklyWorkouts: [0,0,0,0,0,0,0], score: 0,
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
    case 'edit-profile':
      return (
        <EditProfileView
          userProfile={userProfile}
          onSave={(p: UserProfile) => { updateProfile(p); setActiveTab('profile'); }}
          onCancel={() => setActiveTab('profile')}
          api={api}
        />
      );
    case 'evolution':
      return (
        <StatsContainer
          sessions={userSessions}
          templates={filteredTemplates}
          assessments={assessments}
          onCreateWorkout={() => setActiveTab('create-workout')}
          onGoToStore={() => switchTab('express')}
          onNewAssessment={() => setActiveTab('new-assessment')}
          onDeleteAssessment={deleteAssessment}
          onEditAssessment={(a: BodyAssessment) => { setEditingAssessment(a); setActiveTab('edit-assessment'); }}
          initialTab="evolution"
        />
      );
    case 'community':
      return (
        <CommunityView
          userProfile={userProfile} userStats={userStats} api={api}
          communityMessages={communityMessages} setCommunityMessages={setCommunityMessages}
          recommendedCommunities={recommendedCommunities} posts={posts} setPosts={setPosts}
          getLeaderboard={api.getLeaderboard}
          initialTab={communityInitialTab} initialRankingType={communityInitialRankingType}
        />
      );
    case 'leaderboard':
      return (
        <CommunityView
          userProfile={userProfile} userStats={userStats} api={api}
          communityMessages={communityMessages} setCommunityMessages={setCommunityMessages}
          recommendedCommunities={recommendedCommunities} posts={posts} setPosts={setPosts}
          getLeaderboard={api.getLeaderboard}
          initialTab="ranking" initialRankingType="global"
        />
      );
    case 'trainers':
    case 'express':
      return (
        <ExpressView
          userProfile={userProfile} trainers={trainers}
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
          onViewPurchased={() => switchTab('purchased-products')}
        />
      );
    case 'purchased-products':
      return <PurchasedProductsView onBack={() => switchTab('express')} />;
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
                message: `Seu pagamento vence em breve. Entre em contato com seu treinador ${userProfile.name} para regularizar.`,
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
          onBack={() => setActiveTab(userProfile?.userType === 'treinador' ? 'students' : 'trainers')}
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
    case 'settings-goal':
      return (
        <SettingsGoalView
          onSave={() => { setActiveTab('profile'); }}
          onCancel={() => setActiveTab('profile')}
        />
      );
    case 'settings-notifications':
      return <SettingsNotificationsView onSave={() => setActiveTab('profile')} onCancel={() => setActiveTab('profile')} />;
    case 'help':
      return <HelpView onBack={() => setActiveTab('profile')} />;
    default:
      return null;
  }
}
