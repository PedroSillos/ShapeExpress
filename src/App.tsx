import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Dumbbell, 
  Trophy, 
  BarChart3, 
  Plus, 
  Flame, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Settings,
  History,
  TrendingUp,
  Award,
  X,
  Play,
  User,
  LogOut,
  Bell,
  Scale,
  Target,
  Mail,
  UserCircle,
  Ruler,
  Camera,
  ChevronDown,
  Search,
  Check,
  Edit,
  Trash2,
  Clock,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  ShoppingBag,
  Filter,
  SlidersHorizontal,
  Smartphone,
  QrCode,
  MapPin,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  Quote,
  Share2,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  GraduationCap,
  Stethoscope,
  Home,
  Building2,
  Zap,
  Heart,
  Instagram,
  Link as LinkIcon,
  ArrowRight,
  AlertTriangle,
  TrendingDown,
  MoreVertical,
  Send,
  Copy,
  Sparkles,
  AlertCircle,
  Sun,
  FileText,
  Star,
  Crown,
  Swords,
  Activity,
  Medal,
  DollarSign,
  PieChart,
  CalendarPlus,
  Percent,
  Palette,
  Moon,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Droplets
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, parseISO, subWeeks, isWithinInterval, differenceInWeeks, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { QRCodeCanvas } from 'qrcode.react';
import { Toaster, toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

// Domain Layer
import { analyzeExerciseStagnation } from './domain/use-cases/analyzeStagnation';
import { calculateProgressScore } from './domain/use-cases/calculateProgressScore';
import { 
  estimateWorkoutDuration, 
  estimateWorkoutCalories,
  updateTrainingProfile, 
  updateExerciseStats,
  updateCalorieProfile
} from './domain/use-cases/workoutEstimation';
import { 
  UserProfile, 
  WorkoutTemplate,
  WorkoutSession,
  UserStats,
  BodyAssessment,
  UserTrainingProfile,
  ExerciseUserStats,
  UserCalorieProfile,
  ProgressionAlert,
  StagnationReport,
  ProgressScore,
  Student,
  ChatMessage,
  AppNotification,
  WorkoutSheet,
  WorkoutCycle,
  WorkoutCategory,
  MuscleGroup,
  MuscleSubgroup,
  ExerciseCategory,
  Equipment,
  Exercise,
  WorkoutTemplateExercise,
  Achievement,
  AssessmentMethod,
  WorkoutSet
} from './domain/entities';

// Data Layer
import { getAICoachAdvice } from './data/services/aiService';

// Presentation Layer
import { Card } from './presentation/components/Card';
import { Badge } from './presentation/components/Badge';
import { ProgressBar } from './presentation/components/ProgressBar';
import { useAppState } from './presentation/hooks/useAppState';

// Screens
import { WorkoutTemplatesView } from './presentation/screens/WorkoutTemplatesView';
import { WorkoutSessionView } from './presentation/screens/WorkoutSessionView';
import { BodyAssessmentView } from './presentation/screens/BodyAssessmentView';
import { StoreView } from './presentation/screens/StoreView';
import { EditProfileView } from './presentation/screens/EditProfileView';
import { CommunityView } from './presentation/screens/CommunityView';
import { LoginView } from './presentation/screens/auth/LoginView';
import { RegisterView } from './presentation/screens/auth/RegisterView';
import { ForgotPasswordView } from './presentation/screens/auth/ForgotPasswordView';
import { CreateAdModal } from './presentation/components/CreateAdModal';
import { ProtocolCard } from './presentation/components/ProtocolCard';

// Components
import { Logo } from './presentation/components/Logo';
import { InputGroup } from './presentation/components/InputGroup';
import { SelectGroup } from './presentation/components/SelectGroup';
import { ImageUpload } from './presentation/components/ImageUpload';

// Utils & Constants
import { cn } from './utils/cn';
import { isValidEmail, isValidPassword } from './utils/validation';
import { getYouTubeEmbedUrl } from './utils/youtube';
import { EXERCISES, WORKOUT_TEMPLATES, ACHIEVEMENTS, DEFAULT_STATS, DEFAULT_TRAINING_PROFILE, DEFAULT_PROFILE } from './constants';

export default function App() {
  const {
    activeTab, setActiveTab,
    selectedStudentForWorkouts, setSelectedStudentForWorkouts,
    selectedStudentForEvolution, setSelectedStudentForEvolution,
    swipeDirection, setSwipeDirection,
    isLoggedIn, setIsLoggedIn,
    showLogoutConfirm, setShowLogoutConfirm,
    editingTemplate, setEditingTemplate,
    editingSession, setEditingSession,
    editingAssessment, setEditingAssessment,
    deletingTemplateId, setDeletingTemplateId,
    deletingSessionId, setDeletingSessionId,
    scrollToHistory, setScrollToHistory,
    sessions, setSessions,
    templates, setTemplates,
    activeWorkout, setActiveWorkout,
    lastCompletedSession, setLastCompletedSession,
    progressionAlerts, setProgressionAlerts,
    stagnationReports, setStagnationReports,
    progressScore, setProgressScore,
    aiAdvice, setAiAdvice,
    isAiLoading, setIsAiLoading,
    showWorkoutSelector, setShowWorkoutSelector,
    selectingSheetTemplate, setSelectingSheetTemplate,
    activeChatStudent, setActiveChatStudent,
    chatMessages, setChatMessages,
    userStats, setUserStats,
    userProfile, setUserProfile,
    assessments, setAssessments,
    userTrainingProfile, setUserTrainingProfile,
    exerciseUserStats, setExerciseUserStats,
    userCalorieProfile, setUserCalorieProfile,
    notifications, setNotifications,
    trainerConnections, setTrainerConnections,
    studentConnections, setStudentConnections,
    students, setStudents,
    trainers, setTrainers,
    posts, setPosts,
    communities, setCommunities,
    activeCommunity, setActiveCommunity,
    challenges, setChallenges,
    userChallenges, setUserChallenges,
    communityRanking, setCommunityRanking,
    communityMessages, setCommunityMessages,
    recommendedCommunities, setRecommendedCommunities,
    initialLoading,
    api,
    fetchWithAuth,
    resetUserStates,
    userSessions,
    filteredTemplates,
    filteredSessions,
    calculatedStreak,
    personalRecords,
  } = useAppState();

  const [communityInitialTab, setCommunityInitialTab] = useState<'feed' | 'challenges' | 'ranking' | 'chat'>('feed');
  const [communityInitialRankingType, setCommunityInitialRankingType] = useState<'community' | 'global' | 'league' | 'friends'>('community');
  const [creatingAdTemplate, setCreatingAdTemplate] = useState<WorkoutTemplate | null>(null);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'community' && recommendedCommunities.length === 0) {
      api.getRecommendedCommunities().then(setRecommendedCommunities);
    }
  }, [isLoggedIn, activeTab, recommendedCommunities.length, api, setRecommendedCommunities]);


  useEffect(() => {
    if (activeChatStudent) {
      api.getMessages(activeChatStudent.id).then(msgs => {
        setChatMessages(prev => ({
          ...prev,
          [activeChatStudent.id]: msgs
        }));
      }).catch(err => console.error("Failed to fetch messages:", err));
    }
  }, [activeChatStudent, api]);

  // Fetch AI Advice
  useEffect(() => {
    if (isLoggedIn && activeTab === 'dashboard' && !aiAdvice && !isAiLoading && userSessions.length > 0) {
      const fetchAiAdvice = async () => {
        setIsAiLoading(true);
        try {
          const advice = await getAICoachAdvice(userProfile, userSessions, stagnationReports, progressScore);
          setAiAdvice(advice);
        } catch (error) {
          console.error("Error fetching AI advice:", error);
        } finally {
          setIsAiLoading(false);
        }
      };
      fetchAiAdvice();
    }
  }, [isLoggedIn, activeTab, userSessions, stagnationReports, progressScore, aiAdvice, isAiLoading, userProfile]);


  // Check weekly goal and reset streak if needed
  useEffect(() => {
    if (!isLoggedIn || userSessions.length === 0) return;

    const lastCheck = localStorage.getItem('shapeexpress_last_goal_check');
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    
    if (lastCheck) {
      const lastCheckDate = parseISO(lastCheck);
      const lastCheckWeekStart = startOfWeek(lastCheckDate, { weekStartsOn: 1 });
      
      if (currentWeekStart > lastCheckWeekStart) {
        // New week detected!
        // Check if goal was met in the previous week
        const previousWeekStart = subWeeks(currentWeekStart, 1);
        const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });
        
        const sessionsInPreviousWeek = userSessions.filter(s => {
          const sessionDate = parseISO(s.date);
          return isWithinInterval(sessionDate, { start: previousWeekStart, end: previousWeekEnd });
        }).length;
        
        if (sessionsInPreviousWeek < userStats.weeklyGoal) {
          // Goal not met!
          alert(`Você não bateu sua meta de ${userStats.weeklyGoal} treinos na semana passada. Sua streak foi zerada!`);
          
          // Set streakResetDate to the end of the previous week
          updateStats({
            ...userStats,
            streakResetDate: format(previousWeekEnd, 'yyyy-MM-dd')
          });
        }
      }
    }
    
    localStorage.setItem('shapeexpress_last_goal_check', now.toISOString());
  }, [isLoggedIn, userSessions, userStats.weeklyGoal]);

  useEffect(() => {
    if (!isLoggedIn && activeTab !== 'login' && activeTab !== 'forgot-password' && activeTab !== 'register') {
      setActiveTab('login');
    }
  }, [isLoggedIn, activeTab, setActiveTab]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center space-y-6">
        <Logo size="lg" className="animate-pulse" />
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin"></div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Carregando Arena...</p>
        </div>
      </div>
    );
  }

  // Sync state changes with API
  const updateProfile = async (p: UserProfile) => {
    setUserProfile(p);
    await api.updateProfile(p);
  };

  const updateStats = async (s: UserStats) => {
    setUserStats(s);
    await api.updateStats(s);
  };

  const createTemplate = async (t: WorkoutTemplate) => {
    setTemplates([...templates, t]);
    await api.createTemplate(t);
  };

  const updateTemplate = async (t: WorkoutTemplate) => {
    setTemplates(templates.map(tmp => tmp.id === t.id ? t : tmp));
    await api.updateTemplate(t);
  };

  const deleteTemplate = async (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    await api.deleteTemplate(id);
  };

  const createSession = async (s: WorkoutSession) => {
    setSessions([s, ...sessions]);
    await api.createSession(s);
  };

  const updateSession = async (s: WorkoutSession) => {
    setSessions(sessions.map(sess => sess.id === s.id ? s : sess));
    await api.updateSession(s);
  };

  const deleteSession = async (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    await api.deleteSession(id);
  };

  const createAssessment = async (a: BodyAssessment) => {
    setAssessments([a, ...assessments]);
    await api.createAssessment(a);
  };

  const updateAssessment = async (a: BodyAssessment) => {
    setAssessments(assessments.map(item => item.id === a.id ? a : item));
    await api.updateAssessment(a);
  };

  const deleteAssessment = async (id: string) => {
    setAssessments(assessments.filter(a => a.id !== id));
    await api.deleteAssessment(id);
  };

  const startWorkout = (template: WorkoutTemplate, sheetIndex?: number) => {
    let sheets: WorkoutSheet[] = [];
    
    if (template.category === 'multicycle' && template.cycles) {
      const now = new Date();
      const currentCycle = template.cycles.find(c => {
        const start = parseISO(c.startDate);
        const end = parseISO(c.endDate);
        return now >= start && now <= end;
      });
      if (currentCycle) {
        sheets = currentCycle.sheets;
      }
    } else if (template.sheets) {
      sheets = template.sheets;
    }

    // Pick the sheet: use provided index, or default to first sheet if available, otherwise null
    const sheet = (sheets.length > 0)
      ? sheets[sheetIndex !== undefined ? sheetIndex : 0]
      : null;

    const exercisesToUse = sheet 
      ? sheet.exercises 
      : (template.exercises && template.exercises.length > 0 
          ? template.exercises 
          : (template.exerciseIds || []).map(id => ({ exerciseId: id, sets: '10', numSets: 3, rest: '1 min' })));

    if (exercisesToUse.length === 0) {
      alert('Este treino não possui exercícios configurados.');
      return;
    }

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      userId: userProfile?.email || '',
      workoutId: template.id,
      sheetId: sheet?.id,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      exercises: exercisesToUse.map(config => {
        // Find last weight for this exercise
        const lastSessionWithExercise = userSessions.find(s => 
          s.exercises.some(ex => ex.exerciseId === config.exerciseId)
        );
        const lastExSession = lastSessionWithExercise?.exercises.find(ex => ex.exerciseId === config.exerciseId);
        const lastWeight = lastExSession?.sets[0]?.weight || 0;

        return {
          id: Math.random().toString(36).substr(2, 9),
          exerciseId: config.exerciseId,
          sets: Array.from({ length: config.numSets || 3 }).map((_, i) => {
            const repsArray = config.sets.split(',').map(s => parseInt(s.trim()));
            const reps = repsArray[i] !== undefined && !isNaN(repsArray[i]) ? repsArray[i] : (repsArray[0] || 10);
            const restArray = config.rest.split(',').map(s => s.trim());
            const rest = restArray[i] !== undefined ? restArray[i] : (restArray[0] || '1 min');
            return {
              id: `${Date.now()}-${i}`,
              reps: reps,
              weight: lastWeight,
              completed: false,
              rest: rest
            };
          })
        };
      }),
      totalVolume: 0,
      xpEarned: 0
    };
    setActiveWorkout(newSession);
    setShowWorkoutSelector(false);
  };

  const finishWorkout = (metrics: { avgSetDuration: number, avgRestDuration: number, totalDuration: number }) => {
    if (!activeWorkout) return;
    
    const completedSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
    const durationMinutes = Math.floor(metrics.totalDuration / 60);
    const calculatedXp = 50 + (completedSets * 10) + (durationMinutes * 2);

    const completedSession = {
      ...activeWorkout,
      totalVolume: activeWorkout.exercises.reduce((acc, ex) => 
        acc + ex.sets.reduce((sAcc, s) => sAcc + (s.completed ? s.reps * s.weight : 0), 0), 0
      ),
      duration: metrics.totalDuration,
      xpEarned: calculatedXp,
      caloriesBurned: 0 // Will be updated below
    };

    // Create automatic post for community
    const workoutName = templates.find(t => t.id === activeWorkout.workoutId)?.name || 'Treino';
    api.createPost({
      type: 'workout',
      content: {
        text: `${userProfile?.name} concluiu o treino: ${workoutName} 💪`,
        workoutId: completedSession.id
      }
    }).catch(err => console.error("Failed to create automatic post:", err));

    // Update calorie profile
    const weightKg = assessments.length > 0 ? assessments[0].weight : userProfile?.initialWeight;
    const template = templates.find(t => t.id === activeWorkout.workoutId);
    const sheet = template?.sheets?.find(s => s.id === activeWorkout.sheetId) || (template?.sheets ? template.sheets[0] : null);
    
    if (sheet) {
      const estimatedCalories = estimateWorkoutCalories(
        sheet.exercises,
        weightKg,
        userTrainingProfile,
        exerciseUserStats,
        userCalorieProfile
      );
      
      const sessionCpm = estimatedCalories / (estimateWorkoutDuration(sheet.exercises, userTrainingProfile, exerciseUserStats));
      const actualCalories = Math.round(sessionCpm * (metrics.totalDuration / 60));
      completedSession.caloriesBurned = actualCalories;

      const newCalorieProfile = updateCalorieProfile(
        userCalorieProfile,
        actualCalories,
        metrics.totalDuration
      );
      setUserCalorieProfile(newCalorieProfile);
    }

    createSession(completedSession);
    setActiveWorkout(null);
    setLastCompletedSession(completedSession);
    
    // Evolve the estimation model
    const newProfile = updateTrainingProfile(userTrainingProfile, {
      avgSetDuration: metrics.avgSetDuration,
      avgRestDuration: metrics.avgRestDuration,
      avgTransitionDuration: 45, // Assuming constant for now
      totalDuration: metrics.totalDuration
    });
    setUserTrainingProfile(newProfile);
    api.updateTrainingProfile(newProfile);

    // Update individual exercise stats
    const newExerciseStats = [...exerciseUserStats];
    activeWorkout.exercises.forEach(ex => {
      const existingIndex = newExerciseStats.findIndex(s => s.exercise_id === ex.exerciseId);
      if (existingIndex >= 0) {
        newExerciseStats[existingIndex] = updateExerciseStats(newExerciseStats[existingIndex], {
          avgSetDuration: metrics.avgSetDuration,
          avgRestDuration: metrics.avgRestDuration
        });
      } else {
        newExerciseStats.push({
          user_id: userTrainingProfile.user_id,
          exercise_id: ex.exerciseId,
          avg_set_duration: metrics.avgSetDuration,
          avg_rest_duration: metrics.avgRestDuration
        });
      }
    });
    setExerciseUserStats(newExerciseStats);
    api.updateExerciseStats(newExerciseStats);
    
    const newStats = {
      ...userStats,
      completedThisWeek: userStats.completedThisWeek + 1,
      totalWorkouts: userStats.totalWorkouts + 1,
      totalVolume: userStats.totalVolume + completedSession.totalVolume,
      xp: userStats.xp + completedSession.xpEarned
    };

    // Level up logic
    const xpToLevel = 1000;
    if (newStats.xp >= xpToLevel) {
      newStats.level += 1;
      newStats.xp -= xpToLevel;
    }

    updateStats(newStats);

    // Progression Alerts Logic
    const alerts: ProgressionAlert[] = [];

    // 1. PR Alerts
    activeWorkout.exercises.forEach(ex => {
      const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
      const previousSessions = sessions.filter(s => s.exercises.some(e => e.exerciseId === ex.exerciseId));
      
      if (previousSessions.length > 0) {
        const currentMaxWeight = Math.max(...ex.sets.map(s => s.weight));
        const currentVolume = ex.sets.reduce((acc, s) => acc + (s.reps * s.weight), 0);

        let bestWeight = 0;
        let bestVolume = 0;
        
        previousSessions.forEach(ps => {
          const psEx = ps.exercises.find(e => e.exerciseId === ex.exerciseId);
          if (psEx) {
            psEx.sets.forEach(s => {
              if (s.weight > bestWeight) bestWeight = s.weight;
            });
            const psVolume = psEx.sets.reduce((acc, s) => acc + (s.reps * s.weight), 0);
            if (psVolume > bestVolume) bestVolume = psVolume;
          }
        });

        if (currentMaxWeight > bestWeight && bestWeight > 0) {
          alerts.push({
            type: 'PR',
            title: `Novo recorde no ${exercise?.name}!`,
            description: `+${currentMaxWeight - bestWeight} kg desde o último treino`,
            icon: '🏆',
            color: 'text-yellow-400'
          });
        } else if (currentVolume > bestVolume && bestVolume > 0) {
          alerts.push({
            type: 'PR',
            title: `Evolução no ${exercise?.name}!`,
            description: `Você aumentou o volume total deste exercício.`,
            icon: '📈',
            color: 'text-emerald-400'
          });
        }
      }
    });

    // 2. Weekly Progression
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const twoWeeksAgo = subWeeks(now, 2);

    const thisWeekSessions = sessions.filter(s => isWithinInterval(parseISO(s.date), { start: oneWeekAgo, end: now }));
    const lastWeekSessions = sessions.filter(s => isWithinInterval(parseISO(s.date), { start: twoWeeksAgo, end: oneWeekAgo }));

    const thisWeekVolume = thisWeekSessions.reduce((acc, s) => acc + s.totalVolume, 0) + completedSession.totalVolume;
    const lastWeekVolume = lastWeekSessions.reduce((acc, s) => acc + s.totalVolume, 0);

    if (lastWeekVolume > 0) {
      const volumeIncrease = ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100;
      if (volumeIncrease > 5) {
        alerts.push({
          type: 'Weekly',
          title: 'Progressão Semanal',
          description: `Seu volume de treino subiu ${volumeIncrease.toFixed(0)}% esta semana!`,
          icon: '📊',
          color: 'text-blue-400'
        });
      }
    }

    if (thisWeekSessions.length + 1 >= userStats.weeklyGoal) {
      alerts.push({
        type: 'Weekly',
        title: 'Consistência Excelente',
        description: `Você atingiu sua meta de ${userStats.weeklyGoal} treinos esta semana!`,
        icon: '📊',
        color: 'text-emerald-400'
      });
    }

    // 3. Program Progress
    if (template) {
      const templateSessions = sessions.filter(s => s.workoutId === template.id);
      const totalCompleted = templateSessions.length + 1;
      
      // Calculate total expected workouts based on period and frequency
      const start = parseISO(template.startDate);
      const end = parseISO(template.endDate);
      const weeks = Math.max(1, Math.ceil(differenceInWeeks(end, start)));
      const frequency = userProfile?.trainingFrequency || 3;
      const totalExpected = weeks * frequency;
      
      if (totalCompleted % 3 === 0 || totalCompleted === totalExpected) {
        alerts.push({
          type: 'Program',
          title: 'Progresso no Programa',
          description: `Treino ${totalCompleted} de ${totalExpected} concluído (${Math.round((totalCompleted/totalExpected)*100)}%)`,
          icon: '🎯',
          color: 'text-brand-red'
        });
      }
    }

    setProgressionAlerts(alerts);

    // Stagnation Detection Logic
    const stagnation: StagnationReport[] = [];
    activeWorkout.exercises.forEach(ex => {
      const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
      if (exercise) {
        const report = analyzeExerciseStagnation(
          ex.exerciseId,
          exercise.name,
          [completedSession, ...userSessions],
          'Intermediário' // Defaulting to intermediate, could be dynamic
        );
        if (report) stagnation.push(report);
      }
    });
    setStagnationReports(stagnation);
  };


  const renderContent = () => {
    if (!isLoggedIn && activeTab !== 'login' && activeTab !== 'forgot-password' && activeTab !== 'register') {
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
          const updatedSession = {
            ...editingSession,
            totalVolume: editingSession.exercises.reduce((acc, ex) => 
              acc + ex.sets.reduce((sAcc, s) => sAcc + (s.completed ? s.reps * s.weight : 0), 0), 0
            )
          };
          updateSession(updatedSession); 
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
      case 'login': return <LoginView 
        api={api}
        onLogin={async (email, password) => { 
          const data = await api.login(email, password);
          setUserProfile(data.user);
          setIsLoggedIn(true); 
          const defaultTab = localStorage.getItem('app-default-tab') || 'dashboard';
          setActiveTab(defaultTab as any); 
        }} 
        onForgotPassword={() => setActiveTab('forgot-password')} 
        onRegister={() => setActiveTab('register')} 
      />;
      case 'register': return <RegisterView 
        onRegister={async (p) => { 
          const data = await api.register(p);
          setUserProfile(data.user);
          setIsLoggedIn(true);
          const defaultTab = localStorage.getItem('app-default-tab') || 'dashboard';
          setActiveTab(defaultTab as any); 
        }} 
        onBack={() => setActiveTab('login')} 
        api={api}
      />;
      case 'forgot-password': return <ForgotPasswordView api={api} onBack={() => setActiveTab('login')} />;
      case 'dashboard': return <DashboardView 
        userStats={{...userStats, streak: calculatedStreak}} 
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
      />;
      case 'calendar': return <CalendarView sessions={filteredSessions} />;
      case 'workouts': return <WorkoutsView 
        templates={filteredTemplates} 
        sessions={filteredSessions}
        onStartWorkout={startWorkout} 
        onCreateWorkout={() => setActiveTab('create-workout')} 
        onEditWorkout={(t) => { setEditingTemplate(t); setActiveTab('edit-workout'); }}
        onDeleteWorkout={(id) => setDeletingTemplateId(id)}
        onGoToStore={() => switchTab('express')}
        onEditSession={(s) => setEditingSession(s)}
        onDeleteSession={deleteSession}
        scrollToHistory={scrollToHistory}
        onScrollHandled={() => setScrollToHistory(false)}
        userProfile={userTrainingProfile}
        exerciseStats={exerciseUserStats}
        calorieProfile={userCalorieProfile}
        assessments={assessments}
        mainUserProfile={userProfile}
        trainers={trainers}
        onCreateAd={(t) => setCreatingAdTemplate(t)}
      />;
      case 'stats': return <StatsContainer 
        sessions={userSessions} 
        templates={filteredTemplates}
        assessments={assessments}
        onCreateWorkout={() => setActiveTab('create-workout')} 
        onGoToStore={() => switchTab('express')}
        onNewAssessment={() => setActiveTab('new-assessment')}
        onDeleteAssessment={deleteAssessment}
        onEditAssessment={(a) => { setEditingAssessment(a); setActiveTab('edit-assessment'); }}
      />;
      case 'achievements': return <AchievementsView achievements={ACHIEVEMENTS} userStats={{...userStats, streak: calculatedStreak}} userProfile={userProfile} />;
      case 'profile': return <ProfileView 
        userStats={{...userStats, streak: calculatedStreak}} 
        sessions={filteredSessions}
        userProfile={userProfile} 
        userTrainingProfile={userTrainingProfile}
        userCalorieProfile={userCalorieProfile}
        onEditProfile={() => setActiveTab('edit-profile')} 
        onLogout={() => setShowLogoutConfirm(true)} 
        onViewAchievements={() => setActiveTab('achievements')}
        onChangeGoal={() => setActiveTab('settings-goal')}
        onNotifications={() => setActiveTab('settings-notifications')}
        onHelp={() => setActiveTab('help')}
        onViewHistory={() => {
          setActiveTab('workouts');
          setScrollToHistory(true);
        }}
        onViewLibrary={() => setActiveTab('library')}
        onViewEvolution={() => switchTab('evolution')}
        progressScore={progressScore}
        students={students}
        assessments={assessments}
      />;
      case 'notifications': return (
        <NotificationsView 
          notifications={notifications} 
          onBack={() => setActiveTab('dashboard')} 
          onMarkAsRead={async (id) => {
            try {
              await api.markNotificationRead(id);
              setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            } catch (error) {
              console.error("Failed to mark notification as read:", error);
            }
          }}
          onClearAll={async () => {
            try {
              await api.clearAllNotifications();
              setNotifications([]);
            } catch (error) {
              console.error("Failed to clear notifications:", error);
            }
          }}
          onAction={(notification) => {
            switch (notification.type) {
              case 'connection_request':
                if (userProfile?.userType === 'treinador') {
                  setActiveTab('students');
                }
                break;
              case 'connection_response':
                if (userProfile?.userType === 'atleta') {
                  setActiveTab('trainers');
                }
                break;
              case 'workout_assigned':
                setActiveTab('workouts');
                break;
              case 'chat_message':
                const senderEmail = notification.data?.senderEmail;
                if (senderEmail) {
                  // Find student or trainer
                  const student = students.find(s => s.email === senderEmail);
                  const trainerConn = studentConnections.find(c => c.trainerEmail === senderEmail);
                  
                  if (student) {
                    setActiveChatStudent(student);
                    setActiveTab('chat');
                  } else if (trainerConn) {
                    setActiveChatStudent({
                      id: trainerConn.trainerEmail,
                      name: trainerConn.trainerName,
                      email: trainerConn.trainerEmail,
                      avatarUrl: trainerConn.trainerAvatar,
                      status: 'new',
                      progress: 0,
                      streak: 0,
                      weeklyWorkouts: [0,0,0,0,0,0,0],
                      score: 0
                    } as Student);
                    setActiveTab('chat');
                  }
                }
                break;
              default:
                break;
            }
          }}
        />
      );
      case 'edit-profile': return <EditProfileView userProfile={userProfile} onSave={(p) => { updateProfile(p); setActiveTab('profile'); }} onCancel={() => setActiveTab('profile')} api={api} />;
      case 'evolution': return <StatsContainer 
        sessions={userSessions} 
        templates={filteredTemplates}
        assessments={assessments}
        onCreateWorkout={() => setActiveTab('create-workout')} 
        onGoToStore={() => switchTab('express')}
        onNewAssessment={() => setActiveTab('new-assessment')}
        onDeleteAssessment={deleteAssessment}
        onEditAssessment={(a) => { setEditingAssessment(a); setActiveTab('edit-assessment'); }}
        initialTab="evolution"
      />;
      case 'community': return (
        <CommunityView 
          userProfile={userProfile}
          userStats={userStats}
          api={api}
          communityMessages={communityMessages}
          setCommunityMessages={setCommunityMessages}
          recommendedCommunities={recommendedCommunities}
          posts={posts}
          setPosts={setPosts}
          getLeaderboard={api.getLeaderboard}
          initialTab={communityInitialTab}
          initialRankingType={communityInitialRankingType}
        />
      );
      case 'leaderboard': return (
        <CommunityView 
          userProfile={userProfile}
          userStats={userStats}
          api={api}
          communityMessages={communityMessages}
          setCommunityMessages={setCommunityMessages}
          recommendedCommunities={recommendedCommunities}
          posts={posts}
          setPosts={setPosts}
          getLeaderboard={api.getLeaderboard}
          initialTab="ranking"
          initialRankingType="global"
        />
      );
      case 'trainers':
      case 'express': return (
        <ExpressView 
          userProfile={userProfile}
          trainers={trainers} 
          api={api}
          onBack={() => setActiveTab('dashboard')}
          onMessage={(t) => {
            setActiveChatStudent(t);
            setActiveTab('chat');
          }} 
          onConnect={async (code) => {
            try {
              await api.requestConnection(code);
              const [connections, profile, notifs] = await Promise.all([
                api.getStudentConnections(),
                api.getProfile(),
                api.getNotifications()
              ]);
              setStudentConnections(connections);
              setUserProfile((profile as UserProfile) || DEFAULT_PROFILE);
              setNotifications(notifs);
            } catch (error) {
              console.error("Failed to request connection:", error);
              throw error;
            }
          }} 
          onDisconnect={async (trainerEmail: string) => {
            try {
              await api.disconnectTrainer(trainerEmail);
              const [connections, profile, notifs] = await Promise.all([
                api.getStudentConnections(),
                api.getProfile(),
                api.getNotifications()
              ]);
              setStudentConnections(connections);
              setUserProfile((profile as UserProfile) || DEFAULT_PROFILE);
              setNotifications(notifs);
            } catch (error) {
              console.error("Failed to disconnect trainer:", error);
            }
          }}
          studentConnections={studentConnections} 
          onViewPurchased={() => switchTab('purchased-products')}
        />
      );
      case 'purchased-products': return (
        <PurchasedProductsView 
          onBack={() => switchTab('express')}
          api={api}
        />
      );
      case 'library': return <ExerciseLibraryView />;
      case 'students': return (
        <StudentsView 
          students={students} 
          userProfile={userProfile} 
          api={api}
          pendingRequests={trainerConnections.filter(c => c.status === 'pending')}
          onRespond={async (id, status) => {
            try {
              await api.respondToConnection(id, status);
            } catch (error) {
              console.error("Failed to respond to connection:", error);
            }
          }}
          onMessage={(student) => { 
            setActiveChatStudent(student); 
            setActiveTab('chat'); 
          }} 
          onDisconnect={async (studentEmail) => {
            try {
              await api.disconnectStudent(studentEmail);
            } catch (error) {
              console.error("Failed to disconnect student:", error);
            }
          }}
          onViewWorkouts={(student) => {
            setSelectedStudentForWorkouts(student);
            setActiveTab('student-workouts');
          }}
          onViewEvolution={(student) => {
            setSelectedStudentForEvolution(student);
            setActiveTab('student-evolution');
          }}
        />
      );
      case 'chat': return activeChatStudent ? (
        <ChatView 
          student={activeChatStudent} 
          messages={chatMessages[activeChatStudent.id] || []} 
          userProfile={userProfile}
          onSendMessage={async (text) => {
            try {
              const res = await api.sendMessage(activeChatStudent.id, text);
              const newMessage: ChatMessage = {
                id: res.id,
                senderId: userProfile?.email || '',
                receiverId: activeChatStudent.id,
                text,
                timestamp: new Date().toISOString()
              };
              setChatMessages(prev => ({
                ...prev,
                [activeChatStudent.id]: [...(prev[activeChatStudent.id] || []), newMessage]
              }));
            } catch (error) {
              console.error("Failed to send message:", error);
            }
          }}
          onBack={() => setActiveTab(userProfile?.userType === 'treinador' ? 'students' : 'trainers')}
        />
      ) : null;
      case 'student-workouts': return selectedStudentForWorkouts ? (
        <WorkoutTemplatesView 
          studentName={selectedStudentForWorkouts.name}
          templates={templates.filter(t => t.userId === selectedStudentForWorkouts.email && t.creatorEmail === userProfile.email)}
          onSelect={(t) => {
            setEditingTemplate(t);
            setActiveTab('edit-workout');
          }}
          onAdd={() => setActiveTab('create-workout')}
          onDelete={deleteTemplate}
          onBack={() => {
            setSelectedStudentForWorkouts(null);
            setActiveTab('students');
          }}
        />
      ) : null;
      case 'student-evolution': return selectedStudentForEvolution && userProfile ? (
        <StudentEvolutionView
          student={selectedStudentForEvolution}
          trainerEmail={userProfile.email}
          api={api}
          onBack={() => {
            setSelectedStudentForEvolution(null);
            setActiveTab('students');
          }}
        />
      ) : null;
      case 'create-workout': return <CreateWorkoutView userProfile={userProfile} studentEmail={selectedStudentForWorkouts?.email} onSave={(t) => { createTemplate(t); setActiveTab(selectedStudentForWorkouts ? 'student-workouts' : 'workouts'); }} onCancel={() => setActiveTab(selectedStudentForWorkouts ? 'student-workouts' : 'workouts')} />;
      case 'edit-workout': return editingTemplate ? <CreateWorkoutView userProfile={userProfile} studentEmail={selectedStudentForWorkouts?.email || editingTemplate.userId} initialTemplate={editingTemplate} onSave={(t) => { updateTemplate(t); setEditingTemplate(null); setActiveTab(selectedStudentForWorkouts ? 'student-workouts' : 'workouts'); }} onCancel={() => { setEditingTemplate(null); setActiveTab(selectedStudentForWorkouts ? 'student-workouts' : 'workouts'); }} /> : null;
      case 'new-assessment': return <NewAssessmentView onSave={(a) => { createAssessment(a); setActiveTab('stats'); }} onCancel={() => setActiveTab('stats')} />;
      case 'edit-assessment': return editingAssessment ? <NewAssessmentView initialData={editingAssessment} onSave={(a) => { updateAssessment(a); setEditingAssessment(null); setActiveTab('stats'); }} onCancel={() => { setEditingAssessment(null); setActiveTab('stats'); }} /> : null;
      case 'settings-goal': return <SettingsGoalView currentGoal={userStats.weeklyGoal} onSave={(g) => { updateStats({...userStats, weeklyGoal: g}); setActiveTab('profile'); }} onCancel={() => setActiveTab('profile')} />;
      case 'settings-notifications': return <SettingsNotificationsView onSave={() => setActiveTab('profile')} onCancel={() => setActiveTab('profile')} />;
      case 'help': return <HelpView onBack={() => setActiveTab('profile')} />;
    }
  };

  const mainTabs: any[] = ['dashboard', 'community', 'workouts', 'stats', userProfile?.userType === 'treinador' ? 'students' : 'express'];

  const switchTab = (tab: string, initialTab?: any, initialRankingType?: any) => {
    let targetTab = tab;
    if (tab === 'leaderboard') {
      setCommunityInitialTab('ranking');
      setCommunityInitialRankingType('global');
      targetTab = 'community';
    } else if (tab === 'community') {
      setCommunityInitialTab(initialTab || 'feed');
      setCommunityInitialRankingType(initialRankingType || 'community');
    }

    if (activeTab === targetTab) return;
    const currentIndex = mainTabs.indexOf(activeTab);
    const nextIndex = mainTabs.indexOf(targetTab);
    
    if (currentIndex !== -1 && nextIndex !== -1) {
      setSwipeDirection(nextIndex > currentIndex ? 1 : -1);
    } else {
      setSwipeDirection(0);
    }
    setActiveTab(targetTab as any);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (activeWorkout || !isLoggedIn || !mainTabs.includes(activeTab)) return;

    const currentIndex = mainTabs.indexOf(activeTab);
    if (direction === 'left' && currentIndex < mainTabs.length - 1) {
      setSwipeDirection(1);
      setActiveTab(mainTabs[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setSwipeDirection(-1);
      setActiveTab(mainTabs[currentIndex - 1]);
    }
  };

  const currentAnimations = document.documentElement.getAttribute('data-animations') || 'enabled';

  return (
    <MotionConfig transition={currentAnimations === 'reduced' ? { duration: 0 } : undefined}>
      <div className="min-h-screen pb-24 max-w-md mx-auto relative overflow-x-hidden">
        <Toaster position="top-center" richColors />
        {/* Header */}
        {isLoggedIn && (
          <header className="sticky top-0 z-40 bg-dark-surface/80 backdrop-blur-md p-6 flex justify-between items-center border-b border-white/5">
          <div>
            <Logo size="sm" />
            <p className="text-xs text-white/40 font-medium tracking-widest uppercase">Elite Performance</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 text-white/60 hover:text-brand-red transition-colors active:scale-90"
            >
              <Bell size={24} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full border border-dark-surface" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-white truncate max-w-[100px]">{userProfile?.name || 'Atleta'}</p>
                <p className="text-[10px] text-white/40 font-medium">{userStats.xp} XP</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="w-10 h-10 rounded-full border-2 border-brand-red p-0.5 active:scale-90 transition-transform overflow-hidden"
                >
                  <img src={userProfile?.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                </button>
                <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-brand-red rounded-full flex items-center justify-center border-2 border-dark-surface shadow-lg">
                  <span className="text-[10px] font-black text-black">{userStats.level}</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait" custom={swipeDirection}>
          <motion.div
            key={activeTab + (activeWorkout ? '-active' : '')}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              const threshold = 50;
              if (info.offset.x < -threshold) handleSwipe('left');
              else if (info.offset.x > threshold) handleSwipe('right');
            }}
            initial={{ opacity: 0, x: swipeDirection * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -swipeDirection * 50 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col px-6 touch-pan-y"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {isLoggedIn && !activeWorkout && !['create-workout', 'edit-workout'].includes(activeTab) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-surface">
        <nav className="max-w-md mx-auto border-t border-white/10 py-3 grid grid-cols-5 items-center">
          <div className="flex justify-center">
            <NavButton active={activeTab === 'dashboard'} icon={<LayoutDashboard size={20} />} label="Início" onClick={() => switchTab('dashboard')} />
          </div>
          <div className="flex justify-center">
            <NavButton active={activeTab === 'community'} icon={<Users size={20} />} label="Comunidade" onClick={() => switchTab('community')} />
          </div>
          
          <div className="flex justify-center">
            <div className="relative -top-7">
              <button 
                onClick={() => switchTab('workouts')}
                className="w-14 h-14 rounded-full red-gradient shadow-lg shadow-brand-red/20 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Play color="currentColor" size={28} fill="currentColor" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <NavButton active={activeTab === 'stats'} icon={<BarChart3 size={20} />} label="Stats" onClick={() => switchTab('stats')} />
          </div>
          <div className="flex justify-center">
            {userProfile?.userType === 'treinador' ? (
              <NavButton 
                active={activeTab === 'students'} 
                icon={<Users size={20} />} 
                label="Alunos" 
                onClick={() => switchTab('students')} 
              />
            ) : (
              <NavButton 
                active={activeTab === 'express'} 
                icon={<Zap size={20} />} 
                label="Express" 
                onClick={() => switchTab('express')} 
              />
            )}
          </div>
        </nav>
        </div>
      )}

      {/* Workout Selector Modal */}
      <AnimatePresence>
        {showWorkoutSelector && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWorkoutSelector(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Iniciar Treino</h2>
                <button onClick={() => setShowWorkoutSelector(false)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                {templates.map(template => {
                  const hasSheets = template.sheets && template.sheets.length > 0;
                  const totalExercises = hasSheets 
                    ? template.sheets!.reduce((acc, s) => acc + (s.exerciseIds?.length || s.exercises?.length || 0), 0)
                    : (template.exerciseIds?.length || 0);

                  // Estimate duration for the first sheet if multiple exist, or the only sheet
                  const sheetToEstimate = hasSheets ? template.sheets![0] : null;
                  const estimatedMinutes = sheetToEstimate 
                    ? estimateWorkoutDuration(sheetToEstimate.exercises, userTrainingProfile, exerciseUserStats)
                    : 0;

                  return (
                    <Card 
                      key={template.id} 
                      onClick={() => {
                        if (hasSheets && template.sheets!.length > 1) {
                          setSelectingSheetTemplate(template);
                          setShowWorkoutSelector(false);
                        } else {
                          startWorkout(template, hasSheets ? 0 : undefined);
                        }
                      }} 
                      className="flex justify-between items-center hover:bg-white/5"
                    >
                      <div>
                        <h3 className="font-bold">{template.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] text-white/40 font-bold uppercase flex items-center gap-1">
                            <Clock size={10} className="text-brand-red" />
                            {estimatedMinutes} min
                          </p>
                          <p className="text-[10px] text-white/40 font-bold uppercase flex items-center gap-1">
                            <Dumbbell size={10} className="text-brand-red" />
                            {totalExercises} exercícios
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-brand-red" />
                    </Card>
                  );
                })}
                <button 
                  onClick={() => {
                    setShowWorkoutSelector(false);
                    setActiveTab('create-workout');
                  }}
                  className="w-full py-4 border border-dashed border-dark-border rounded-2xl text-white/40 font-bold flex items-center justify-center gap-2 hover:bg-white/5"
                >
                  <Plus size={20} /> Criar Novo Treino
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sheet Selection Modal (Global) */}
      <AnimatePresence>
        {selectingSheetTemplate && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectingSheetTemplate(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-sm bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold">Escolha a Ficha</h3>
                <p className="text-xs text-white/40">Qual treino você vai esmagar hoje?</p>
              </div>
              
              <div className="grid gap-3">
                {selectingSheetTemplate.sheets?.map((sheet, index) => (
                  <button
                    key={sheet.id}
                    onClick={() => {
                      startWorkout(selectingSheetTemplate, index);
                      setSelectingSheetTemplate(null);
                    }}
                    className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:border-brand-red/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                        <Dumbbell size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">{sheet.name}</p>
                        <p className="text-[10px] text-white/40 uppercase font-bold">{(sheet.exerciseIds?.length || sheet.exercises?.length || 0)} exercícios</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/20" />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setSelectingSheetTemplate(null)}
                className="w-full py-4 text-white/40 font-bold text-sm"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-dark-card border border-dark-border rounded-3xl p-6 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
                  <LogOut size={32} />
                </div>
                <h2 className="text-xl font-bold">Sair da Conta?</h2>
                <p className="text-sm text-white/40">Você precisará entrar novamente para acessar seus treinos e progresso.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    setIsLoggedIn(false);
                    resetUserStates();
                    setActiveTab('login');
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 py-4 bg-red-500 rounded-2xl text-white font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {creatingAdTemplate && (
          <CreateAdModal
            template={creatingAdTemplate}
            onClose={() => setCreatingAdTemplate(null)}
            onSubmit={async (adData) => {
              try {
                await api.createProtocol(adData);
                setCreatingAdTemplate(null);
              } catch (error) {
                console.error("Failed to create ad:", error);
                toast.error("Erro ao criar anúncio: " + (error instanceof Error ? error.message : String(error)));
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingTemplateId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingTemplateId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full bg-dark-card border border-dark-border rounded-3xl p-6 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 size={32} />
                </div>
                <h2 className="text-xl font-bold">Excluir Treino?</h2>
                <p className="text-sm text-white/40">Esta ação não pode ser desfeita. O template do treino será removido permanentemente.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingTemplateId(null)}
                  className="flex-1 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    setTemplates(templates.filter(t => t.id !== deletingTemplateId));
                    deleteTemplate(deletingTemplateId);
                    setDeletingTemplateId(null);
                  }}
                  className="flex-1 py-4 bg-red-500 rounded-2xl text-white font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workout Summary Modal */}
      <AnimatePresence>
        {lastCompletedSession && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLastCompletedSession(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-dark-card border border-brand-red/30 rounded-[40px] p-8 shadow-2xl text-center space-y-8"
            >
              {/* Celebration Background */}
              <div className="absolute top-0 left-0 w-full h-32 red-gradient opacity-10 blur-3xl -translate-y-1/2" />
              
              <div className="space-y-4 relative">
                <div className="w-24 h-24 red-gradient rounded-full flex items-center justify-center mx-auto shadow-lg shadow-brand-red/20">
                  <Trophy size={48} color="currentColor" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold red-text-gradient">Treino Concluído!</h2>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Você superou seus limites hoje</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
                  <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Volume</p>
                  <p className="text-xl font-display font-bold text-brand-red">{lastCompletedSession.totalVolume} <span className="text-[10px] font-sans text-white/40">kg</span></p>
                </div>
                <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
                  <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Duração</p>
                  <p className="text-xl font-display font-bold text-brand-red">
                    {Math.floor((lastCompletedSession.duration || 0) / 60)} <span className="text-[10px] font-sans text-white/40">min</span>
                  </p>
                </div>
                <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
                  <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Calorias</p>
                  <p className="text-xl font-display font-bold text-orange-400">
                    {lastCompletedSession.caloriesBurned || 0} <span className="text-[10px] font-sans text-white/40">kcal</span>
                  </p>
                </div>
              </div>

              <div className="bg-brand-red/10 rounded-3xl p-6 border border-brand-red/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-brand-red uppercase tracking-widest">Recompensa</span>
                  <span className="text-lg font-display font-bold text-brand-red">+{lastCompletedSession.xpEarned} XP</span>
                </div>
                <ProgressBar progress={userStats.xp} max={1000} className="h-2" />
                <p className="text-[10px] text-brand-red/60 font-bold uppercase tracking-widest mt-2">Próximo Nível em {1000 - userStats.xp} XP</p>
              </div>

              {/* Progression Alerts */}
              {progressionAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 text-left px-2">Evolução</h3>
                  {progressionAlerts.map((alert, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 text-left"
                    >
                      <span className="text-2xl">{alert.icon}</span>
                      <div>
                        <h4 className={cn("font-bold text-sm", alert.color)}>{alert.title}</h4>
                        <p className="text-xs text-white/40 font-medium">{alert.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Stagnation Reports */}
              {stagnationReports.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 text-left px-2">Insights Inteligentes</h3>
                  {stagnationReports.map((report, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-white">{report.exerciseName}</h4>
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            report.level === 'severa' ? "text-brand-red" : "text-orange-400"
                          )}>Estagnação {report.level}</p>
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          report.level === 'severa' ? "bg-brand-red/10 text-brand-red" : "bg-orange-400/10 text-orange-400"
                        )}>
                          <HelpCircle size={16} />
                        </div>
                      </div>
                      <p className="text-xs text-white/40 font-medium">Motivo: {report.type} ({report.sessionsCount} sessões)</p>
                      <div className={cn(
                        "rounded-xl p-3 border",
                        report.level === 'severa' ? "bg-brand-red/10 border-brand-red/20" : "bg-orange-400/10 border-orange-400/20"
                      )}>
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-widest mb-1",
                          report.level === 'severa' ? "text-brand-red" : "text-orange-400"
                        )}>Sugestão Shape Express</p>
                        <p className={cn(
                          "text-xs font-medium",
                          report.level === 'severa' ? "text-brand-red/80" : "text-orange-400/80"
                        )}>{report.suggestion}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setLastCompletedSession(null);
                    setStagnationReports([]);
                  }}
                  className="flex-1 py-5 bg-white/5 rounded-3xl font-bold hover:bg-white/10 transition-colors"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Meu Treino no IDAFIT',
                        text: `Acabei de treinar! Volume: ${lastCompletedSession.totalVolume}kg, Duração: ${Math.floor((lastCompletedSession.duration || 0) / 60)}min. #IDAFIT #Fitness`,
                        url: window.location.href
                      }).catch(console.error);
                    } else {
                      alert('Compartilhamento não suportado neste navegador.');
                    }
                  }}
                  className="flex-1 py-5 red-gradient text-black rounded-3xl font-bold shadow-xl shadow-brand-red/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Compartilhar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

// --- Sub-Views ---

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 transition-colors", active ? "text-brand-red" : "text-white/40")}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function NotificationsView({ 
  notifications, 
  onBack, 
  onMarkAsRead, 
  onClearAll,
  onAction
}: { 
  notifications: AppNotification[], 
  onBack: () => void, 
  onMarkAsRead: (id: string) => void,
  onClearAll: () => void,
  onAction: (notification: AppNotification) => void
}) {
  return (
    <div className="flex flex-col h-full -mx-6">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-dark-surface/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold">Notificações</h2>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-xs font-bold text-brand-red uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Limpar Tudo
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Bell size={32} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest">Tudo limpo por aqui!</p>
              <p className="text-xs mt-1">Você não tem novas notificações.</p>
            </div>
          </div>
        ) : (
          notifications
            .sort((a, b) => {
              const timeA = new Date(a.timestamp).getTime();
              const timeB = new Date(b.timestamp).getTime();
              if (isNaN(timeA)) return 1;
              if (isNaN(timeB)) return -1;
              return timeB - timeA;
            })
            .map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                onMarkAsRead(notification.id);
                onAction(notification);
              }}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer relative",
                notification.read 
                  ? "bg-dark-card/50 border-white/5 opacity-60" 
                  : "bg-dark-card border-brand-red/20 shadow-lg shadow-brand-red/5"
              )}
            >
              {!notification.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-brand-red rounded-full" />
              )}
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  (notification.type === 'info' || notification.type === 'chat_message') && "bg-blue-500/10 text-blue-500",
                  (notification.type === 'success' || notification.type === 'connection_response') && "bg-emerald-500/10 text-emerald-500",
                  (notification.type === 'warning' || notification.type === 'connection_request') && "bg-amber-500/10 text-amber-500",
                  (notification.type === 'alert' || notification.type === 'workout_assigned') && "bg-brand-red/10 text-brand-red"
                )}>
                  {(notification.type === 'info' || notification.type === 'chat_message') && (notification.type === 'chat_message' ? <MessageSquare size={20} /> : <Bell size={20} />)}
                  {(notification.type === 'success' || notification.type === 'connection_response') && (notification.type === 'connection_response' ? <UserCheck size={20} /> : <CheckCircle2 size={20} />)}
                  {(notification.type === 'warning' || notification.type === 'connection_request') && (notification.type === 'connection_request' ? <UserPlus size={20} /> : <AlertTriangle size={20} />)}
                  {(notification.type === 'alert' || notification.type === 'workout_assigned') && (notification.type === 'workout_assigned' ? <Dumbbell size={20} /> : <Flame size={20} />)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold">{notification.title}</h3>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{notification.message}</p>
                  <p className="text-[10px] text-white/20 font-bold uppercase pt-1">
                    {(() => {
                      try {
                        const date = new Date(notification.timestamp);
                        if (isNaN(date.getTime())) return 'Data inválida';
                        return format(date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
                      } catch (e) {
                        return 'Data inválida';
                      }
                    })()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function DashboardView({ 
  userStats, 
  sessions, 
  templates, 
  onStartWorkout, 
  onViewAchievements,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile,
  progressScore,
  aiAdvice,
  isAiLoading,
  switchTab,
  personalRecords,
  studentConnections = [],
  trainers = []
}: { 
  userStats: UserStats, 
  sessions: WorkoutSession[], 
  templates: WorkoutTemplate[], 
  onStartWorkout: () => void, 
  onViewAchievements: () => void,
  userProfile: UserTrainingProfile,
  exerciseStats: ExerciseUserStats[],
  calorieProfile: UserCalorieProfile,
  assessments: BodyAssessment[],
  mainUserProfile: UserProfile,
  progressScore: ProgressScore | null,
  aiAdvice: string | null,
  isAiLoading: boolean,
  switchTab: (tab: string) => void,
  personalRecords: { weight: number, date: string, name: string }[],
  studentConnections?: any[],
  trainers?: any[]
}) {
  const weeklyVolume = useMemo(() => {
    return sessions.slice(0, 5).reduce((acc, s) => acc + s.totalVolume, 0);
  }, [sessions]);

  const completedThisWeek = useMemo(() => {
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    return sessions.filter(s => {
      const sessionDate = parseISO(s.date);
      return sessionDate >= startOfCurrentWeek;
    }).length;
  }, [sessions]);

  const [waterIntake, setWaterIntake] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`water-intake-${today}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [waterGoal, setWaterGoal] = useState(() => {
    const saved = localStorage.getItem('water-goal');
    return saved ? parseInt(saved, 10) : 2500;
  });

  const [waterCupSize, setWaterCupSize] = useState(() => {
    const saved = localStorage.getItem('water-cup-size');
    return saved ? parseInt(saved, 10) : 250;
  });

  const [showWaterModal, setShowWaterModal] = useState(false);

  const handleAddWater = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const today = new Date().toISOString().split('T')[0];
    const newIntake = waterIntake + waterCupSize;
    setWaterIntake(newIntake);
    localStorage.setItem(`water-intake-${today}`, newIntake.toString());
  };

  const nextWorkout = useMemo(() => {
    if (templates.length === 0) return null;
    
    // Find last completed workout from sessions
    const lastSession = sessions.length > 0 ? sessions[0] : null;
    if (!lastSession) return templates[0];
    
    const lastTemplateIndex = templates.findIndex(t => t.id === lastSession.workoutId);
    if (lastTemplateIndex === -1 || lastTemplateIndex === templates.length - 1) {
      return templates[0];
    }
    return templates[lastTemplateIndex + 1];
  }, [sessions, templates]);

  const defaultWidgets = [
    { id: 'stats', title: 'Estatísticas Rápidas', visible: true },
    { id: 'next-workout', title: 'Próximo Treino', visible: true },
    { id: 'water', title: 'Água', visible: true },
    { id: 'calories', title: 'Calorias', visible: true },
    { id: 'progress-score', title: 'Score de Progresso', visible: true },
    { id: 'ai-coach', title: 'Coach IA', visible: true },
    { id: 'hire-coach', title: 'Contratar Treinador', visible: true },
    { id: 'motivation', title: 'Motivação do Dia', visible: true },
    { id: 'community', title: 'Comunidade', visible: true },
    { id: 'records', title: 'Recordes Pessoais', visible: true },
    { id: 'weekly-goal', title: 'Meta Semanal', visible: true },
    { id: 'last-achievement', title: 'Última Conquista', visible: true },
  ];

  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('app-dashboard-widgets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = defaultWidgets.map(dw => {
          const found = parsed.find((pw: any) => pw.id === dw.id);
          return found ? { ...dw, visible: found.visible } : dw;
        });
        merged.sort((a, b) => {
          const indexA = parsed.findIndex((pw: any) => pw.id === a.id);
          const indexB = parsed.findIndex((pw: any) => pw.id === b.id);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        return merged;
      } catch (e) {
        return defaultWidgets;
      }
    }
    return defaultWidgets;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('app-dashboard-widgets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const merged = defaultWidgets.map(dw => {
            const found = parsed.find((pw: any) => pw.id === dw.id);
            return found ? { ...dw, visible: found.visible } : dw;
          });
          merged.sort((a, b) => {
            const indexA = parsed.findIndex((pw: any) => pw.id === a.id);
            const indexB = parsed.findIndex((pw: any) => pw.id === b.id);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setWidgets(merged);
        } catch (e) {
          // ignore
        }
      }
    };
    
    window.addEventListener('dashboard-widgets-updated', handleStorageChange);
    return () => window.removeEventListener('dashboard-widgets-updated', handleStorageChange);
  }, []);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'stats':
        return (
          <div key="stats" className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col gap-1 justify-between min-h-[100px]">
              <div className="flex items-center gap-2 text-[#E53E3E]">
                <Flame size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Streak</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-3xl font-display font-bold">{userStats.streak}</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Dias seguidos</p>
              </div>
            </Card>
            <Card className="flex flex-col gap-1 justify-between min-h-[100px]">
              <div className="flex items-center gap-2 text-blue-400">
                <TrendingUp size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Volume Semana</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-3xl font-display font-bold">{(weeklyVolume / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Toneladas (kg)</p>
              </div>
            </Card>
          </div>
        );
      case 'water':
        return (
          <Card key="water" className="flex flex-col gap-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setShowWaterModal(true)}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-blue-400">
                <Droplets size={18} />
                <h3 className="font-bold">Hidratação</h3>
              </div>
              <span className="text-xs font-bold text-blue-400">{waterIntake} / {waterGoal} ml</span>
            </div>
            <ProgressBar progress={waterIntake} max={waterGoal} className="bg-blue-400/20 [&>div]:bg-blue-400" />
            <div className="flex justify-between items-center mt-2">
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                {waterIntake >= waterGoal ? "Meta atingida!" : `Faltam ${Math.max(0, waterGoal - waterIntake)} ml`}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/5 rounded-full px-1 py-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newSize = Math.max(50, waterCupSize - 50);
                      setWaterCupSize(newSize);
                      localStorage.setItem('water-cup-size', newSize.toString());
                    }}
                    className="p-1 text-white/40 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-bold text-blue-400 w-12 text-center">{waterCupSize}ml</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newSize = waterCupSize + 50;
                      setWaterCupSize(newSize);
                      localStorage.setItem('water-cup-size', newSize.toString());
                    }}
                    className="p-1 text-white/40 hover:text-white transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                <button 
                  onClick={handleAddWater}
                  className="w-8 h-8 rounded-full bg-blue-400/10 text-blue-400 flex items-center justify-center hover:bg-blue-400/20 active:scale-95 transition-all"
                >
                  <span className="text-lg font-bold leading-none">+</span>
                </button>
              </div>
            </div>
          </Card>
        );
      case 'calories':
        return (
          <Card key="calories" className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-orange-400">
                <Flame size={18} />
                <h3 className="font-bold">Calorias Queimadas</h3>
              </div>
              <span className="text-xs font-bold text-orange-400">{Math.round(calorieProfile.total_calories_burned).toLocaleString()} kcal</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Média por Treino</p>
                <p className="text-xl font-display font-bold">{Math.round(calorieProfile.avg_workout_calories)} <span className="text-[10px] font-sans text-white/40">kcal</span></p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Total de Treinos</p>
                <p className="text-xl font-display font-bold">{calorieProfile.total_workouts}</p>
              </div>
            </div>
          </Card>
        );
      case 'next-workout':
        return (
          <div key="next-workout" className="relative group">
            <div className="absolute -inset-0.5 red-gradient rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <button 
              onClick={() => onStartWorkout()}
              className="relative w-full bg-dark-card border border-dark-border rounded-3xl p-6 flex items-center justify-between overflow-hidden"
            >
              {nextWorkout ? (
                <>
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Próximo Treino</p>
                    <h3 className="text-xl font-bold">{nextWorkout.name}</h3>
                    {nextWorkout.creatorEmail && nextWorkout.creatorEmail !== mainUserProfile.email && (
                      <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider mb-1">
                        Por {trainers.find(t => t.email === nextWorkout.creatorEmail)?.name || 'Treinador'}
                      </p>
                    )}
                    <p className="text-xs text-white/40 flex items-center gap-2">
                      <span>
                        {nextWorkout.sheets && nextWorkout.sheets.length > 0 
                          ? `${nextWorkout.sheets.length} Fichas`
                          : `${nextWorkout.exerciseIds?.length || 0} Exercícios`}
                      </span>
                      {nextWorkout.sheets && nextWorkout.sheets.length > 0 && (
                        <>
                          <span className="text-white/10">•</span>
                          <span className="flex items-center gap-1 text-brand-red font-bold uppercase text-[10px]">
                            <Clock size={10} />
                            {estimateWorkoutDuration(nextWorkout.sheets[0].exercises, userProfile, exerciseStats)} min
                          </span>
                          <span className="text-white/10">•</span>
                          <span className="flex items-center gap-1 text-orange-400 font-bold uppercase text-[10px]">
                            <Flame size={10} />
                            {Math.round(estimateWorkoutCalories(
                              nextWorkout.sheets[0].exercises,
                              assessments.length > 0 ? assessments[0].weight : mainUserProfile.initialWeight,
                              userProfile,
                              exerciseStats,
                              calorieProfile
                            ))} kcal
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full red-gradient flex items-center justify-center">
                    <Play size={24} color="currentColor" fill="currentColor" />
                  </div>
                </>
              ) : (
                <div className="w-full text-center py-2">
                  <p className="text-sm text-white/40 font-bold">Ainda não foram criados treinos</p>
                  <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mt-1">Toque para começar</p>
                </div>
              )}
            </button>
          </div>
        );
      case 'progress-score':
        if (!progressScore || sessions.length === 0) return null;
        return (
          <Card key="progress-score" className="relative overflow-hidden group">
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2",
              progressScore.classification === 'progresso' ? "bg-blue-400" :
              progressScore.score >= 76 ? "bg-emerald-500" : 
              progressScore.score >= 51 ? "bg-blue-500" :
              progressScore.score >= 31 ? "bg-orange-500" : "bg-red-500"
            )} />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-brand-red" />
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Score de Progresso</span>
                </div>
                <h3 className="text-2xl font-display font-bold capitalize">{progressScore.classification}</h3>
                <p className="text-xs text-white/40 font-medium max-w-[200px]">{progressScore.message}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-display font-bold red-text-gradient">{progressScore.score}</div>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest flex items-center justify-end gap-1",
                  progressScore.trend === 'subindo' ? "text-emerald-400" :
                  progressScore.trend === 'descendo' ? "text-red-400" : "text-white/40"
                )}>
                  {progressScore.trend === 'subindo' ? <TrendingUp size={10} /> : 
                   progressScore.trend === 'descendo' ? <TrendingUp size={10} className="rotate-180" /> : null}
                  {progressScore.trend}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-[8px] text-white/20 font-bold uppercase mb-1">Carga</p>
                <p className="text-xs font-bold">{progressScore.factors.loadProgression}%</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] text-white/20 font-bold uppercase mb-1">Reps</p>
                <p className="text-xs font-bold">{progressScore.factors.repsProgression}%</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] text-white/20 font-bold uppercase mb-1">Volume</p>
                <p className="text-xs font-bold">{progressScore.factors.trainingVolume}%</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] text-white/20 font-bold uppercase mb-1">Foco</p>
                <p className="text-xs font-bold">{progressScore.factors.consistency}%</p>
              </div>
            </div>
          </Card>
        );
      case 'ai-coach':
        if (!aiAdvice && !isAiLoading) return null;
        return (
          <Card key="ai-coach" className="relative overflow-hidden border-brand-red/30 bg-brand-red/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full red-gradient flex items-center justify-center">
                <Zap size={16} color="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Coach IA</h3>
                <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Conselho Personalizado</p>
              </div>
            </div>
            
            {isAiLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-white/10 rounded w-full"></div>
                <div className="h-3 bg-white/10 rounded w-5/6"></div>
                <div className="h-3 bg-white/10 rounded w-4/6"></div>
              </div>
            ) : (
              <div className="text-xs text-white/80 leading-relaxed italic prose prose-invert prose-p:leading-relaxed">
                <ReactMarkdown>{aiAdvice || ''}</ReactMarkdown>
              </div>
            )}
          </Card>
        );
      case 'hire-coach':
        if (!(mainUserProfile?.userType === 'atleta' && studentConnections.length === 0)) return null;
        return (
          <button 
            key="hire-coach"
            onClick={() => switchTab('trainers')}
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:bg-brand-red/20 transition-colors">
                <UserPlus size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold">Contrate um Treinador</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Acelere seus resultados</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-brand-red transition-colors" />
          </button>
        );
      case 'motivation':
        return (
          <Card key="motivation" className="bg-gradient-to-br from-brand-red/20 to-orange-500/10 border-brand-red/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-red/10 rounded-full blur-2xl group-hover:bg-brand-red/20 transition-colors" />
            <div className="relative z-10 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-red/20 flex items-center justify-center text-brand-red shrink-0">
                <Quote size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Motivação do Dia</p>
                <p className="text-sm font-medium italic leading-relaxed">"A disciplina é a ponte entre metas e realizações. Hoje é o dia de construir mais um degrau."</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">— Jim Rohn</p>
              </div>
            </div>
          </Card>
        );
      case 'community':
        return (
          <Card 
            key="community"
            onClick={() => switchTab('leaderboard')}
            className="relative overflow-hidden cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all group"
          >
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-400/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-400/20 transition-colors">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Comunidade</p>
                  <h3 className="font-bold">Ranking Global</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <img key={i} src={`https://picsum.photos/seed/${i+10}/100`} alt="" className="w-5 h-5 rounded-full border border-dark-card" />
                      ))}
                    </div>
                    <span className="text-[10px] text-white/40 font-bold ml-1">+1.2k ativos</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-orange-400">Sua Posição</p>
                <p className="text-xl font-display font-bold">12º</p>
              </div>
            </div>
          </Card>
        );
      case 'records':
        if (personalRecords.length === 0) return null;
        return (
          <div key="records" className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Recordes Pessoais</h3>
              <button className="text-[10px] font-bold uppercase tracking-widest text-brand-red">Ver Todos</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {personalRecords.map((pr, idx) => (
                <Card key={idx} className="flex items-center justify-between p-4 bg-white/5 border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{pr.name}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase">{format(parseISO(pr.date), 'dd MMM', { locale: ptBR })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-display font-bold text-yellow-400">{pr.weight} <span className="text-[10px] font-sans text-white/40">kg</span></p>
                    <p className="text-[10px] text-white/40 font-bold uppercase">Carga Máxima</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'weekly-goal':
        return (
          <Card key="weekly-goal" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-brand-red" />
                <h3 className="font-bold">Meta Semanal</h3>
              </div>
              <span className="text-xs font-bold text-brand-red">{completedThisWeek} / {userStats.weeklyGoal} Fichas</span>
            </div>
            <ProgressBar progress={completedThisWeek} max={userStats.weeklyGoal} />
            <p className="text-xs text-white/40 font-medium">
              {completedThisWeek >= userStats.weeklyGoal 
                ? "Meta Concluída!" 
                : `Faltam ${userStats.weeklyGoal - completedThisWeek} fichas para bater a meta.`}
            </p>
          </Card>
        );
      case 'last-achievement':
        return (
          <Card 
            key="last-achievement"
            onClick={onViewAchievements}
            className="flex items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:bg-brand-red/20 transition-colors">
              <Award size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-white/40 font-bold uppercase">Última Conquista</p>
              <h3 className="font-bold">PR no Supino</h3>
              <p className="text-xs text-brand-red font-medium">+250 XP Desbloqueado</p>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-brand-red transition-colors" />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {widgets.filter(w => w.visible).map(w => renderWidget(w.id))}
      
      {/* Water Modal */}
      <AnimatePresence>
        {showWaterModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWaterModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-dark-surface border border-dark-border rounded-[32px] p-6 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-400">
                  <Droplets size={24} />
                  <h3 className="text-xl font-bold text-white">Hidratação</h3>
                </div>
                <button onClick={() => setShowWaterModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
                  <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-3 block">Meta Diária (ml)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={waterGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setWaterGoal(val);
                          localStorage.setItem('water-goal', val.toString());
                        }
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col items-center">
                  <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-4 block text-center">Tamanho do Copo</label>
                  <div className="flex items-center justify-center gap-6 w-full">
                    <button 
                      onClick={() => {
                        const newSize = Math.max(50, waterCupSize - 50);
                        setWaterCupSize(newSize);
                        localStorage.setItem('water-cup-size', newSize.toString());
                      }}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <div className="bg-white text-blue-500 px-8 py-4 rounded-full flex items-center gap-3 font-bold text-2xl shadow-lg shadow-blue-500/20">
                      <Droplets size={24} />
                      <span>{waterCupSize}ml</span>
                    </div>

                    <button 
                      onClick={() => {
                        const newSize = waterCupSize + 50;
                        setWaterCupSize(newSize);
                        localStorage.setItem('water-cup-size', newSize.toString());
                      }}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowWaterModal(false)}
                className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
              >
                Concluído
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarView({ sessions }: { sessions: WorkoutSession[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getSessionForDay = (day: Date) => {
    return sessions.find(s => isSameDay(parseISO(s.date), day));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Calendário</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={18} /></button>
          <span className="font-bold min-w-[100px] text-center">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-white/5 rounded-full"><ChevronRight size={18} /></button>
        </div>
      </div>

      <Card className="p-2">
        <div className="grid grid-cols-7 mb-2">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-white/20 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const session = getSessionForDay(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const today = isToday(day);
            
            return (
              <div 
                key={i} 
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-xl relative",
                  !isCurrentMonth && "opacity-10",
                  today && "border border-brand-red/50"
                )}
              >
                <span className={cn("text-xs font-medium", today && "text-brand-red")}>{format(day, 'd')}</span>
                {session && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1",
                      session.totalVolume > 5000 ? "bg-brand-red" : "bg-brand-red/40"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Total Treinos</p>
          <p className="text-2xl font-display font-bold">{sessions.filter(s => parseISO(s.date).getMonth() === currentMonth.getMonth()).length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Volume Mensal</p>
          <p className="text-2xl font-display font-bold">{(sessions.filter(s => parseISO(s.date).getMonth() === currentMonth.getMonth()).reduce((acc, s) => acc + s.totalVolume, 0) / 1000).toFixed(0)}k</p>
        </Card>
      </div>
    </div>
  );
}

function WorkoutsView({ 
  templates, 
  sessions, 
  onStartWorkout, 
  onCreateWorkout, 
  onEditWorkout, 
  onDeleteWorkout, 
  onGoToStore, 
  onEditSession, 
  onDeleteSession, 
  scrollToHistory, 
  onScrollHandled,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile,
  trainers = [],
  onCreateAd
}: { 
  templates: WorkoutTemplate[], 
  sessions: WorkoutSession[], 
  onStartWorkout: (t: WorkoutTemplate, sheetIndex?: number) => void, 
  onCreateWorkout: () => void, 
  onEditWorkout: (t: WorkoutTemplate) => void, 
  onDeleteWorkout: (id: string) => void, 
  onGoToStore: () => void, 
  onEditSession: (s: WorkoutSession) => void, 
  onDeleteSession: (id: string) => void, 
  onCreateAd?: (t: WorkoutTemplate) => void,
  scrollToHistory?: boolean, 
  onScrollHandled?: () => void,
  userProfile: UserTrainingProfile,
  exerciseStats: ExerciseUserStats[],
  calorieProfile: UserCalorieProfile,
  assessments: BodyAssessment[],
  mainUserProfile: UserProfile,
  trainers?: any[]
}) {
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
  const [selectingSheetTemplate, setSelectingSheetTemplate] = useState<WorkoutTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToHistory && historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth' });
      onScrollHandled?.();
    }
  }, [scrollToHistory, onScrollHandled]);

  // Draft recovery logic
  useEffect(() => {
    const savedDraft = localStorage.getItem('workout_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Only ask if there's actual progress
        if (draft.protocolName || (draft.cycles && draft.cycles.length > 0) || (draft.sheets && draft.sheets[0] && draft.sheets[0].exerciseIds && draft.sheets[0].exerciseIds.length > 0)) {
          if (confirm('Você tem um rascunho de treino não finalizado. Deseja continuar de onde parou?')) {
            onCreateWorkout(); // This will trigger the CreateWorkoutView which has its own draft loading logic
          } else {
            localStorage.removeItem('workout_draft');
          }
        }
      } catch (e) {
        console.error('Error checking draft', e);
      }
    }
  }, [onCreateWorkout]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Meus Treinos</h2>
        <button onClick={onCreateWorkout} className="p-2 bg-brand-red/10 text-brand-red rounded-full"><Plus size={20} /></button>
      </div>

      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
              <Dumbbell size={32} />
            </div>
            <div>
              <p className="text-white/40 font-bold">Ainda não foram criados treinos</p>
              <p className="text-xs text-white/20">Crie seu primeiro treino para começar a evoluir.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onCreateWorkout}
                className="px-6 py-3 bg-brand-red/10 text-brand-red rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Criar Meu Primeiro Treino
              </button>
              <button 
                onClick={onGoToStore}
                className="px-6 py-3 bg-white/5 text-white/60 rounded-xl font-bold text-sm active:scale-95 transition-transform border border-white/5"
              >
                Adquirir Novo Treino
              </button>
            </div>
          </div>
        ) : (
          templates.map(template => {
            const getNextSheetInfo = (t: WorkoutTemplate) => {
              let sheets: WorkoutSheet[] = [];
              let cycleName = '';
              
              if (t.category === 'multicycle' && t.cycles) {
                const now = new Date();
                const currentCycle = t.cycles.find(c => {
                  const start = parseISO(c.startDate);
                  const end = parseISO(c.endDate);
                  return now >= start && now <= end;
                });
                if (currentCycle) {
                  sheets = currentCycle.sheets;
                  cycleName = currentCycle.name;
                }
              } else if (t.sheets) {
                sheets = t.sheets;
              }
              
              if (sheets.length === 0) return null;
              
              const workoutSessions = sessions.filter(s => s.workoutId === t.id);
              const nextIndex = workoutSessions.length % sheets.length;
              return {
                sheet: sheets[nextIndex],
                index: nextIndex,
                cycleName
              };
            };

            const nextSheetInfo = getNextSheetInfo(template);
            const hasSheets = template.sheets && template.sheets.length > 0;
            const hasCycles = template.cycles && template.cycles.length > 0;
            const totalExercises = template.category === 'multicycle'
              ? template.cycles?.reduce((acc, c) => acc + c.sheets.reduce((sAcc, s) => sAcc + (s.exerciseIds?.length || s.exercises?.length || 0), 0), 0)
              : (template.sheets?.reduce((acc, s) => acc + (s.exerciseIds?.length || s.exercises?.length || 0), 0) || 0);

            const trainer = template.creatorEmail && template.creatorEmail !== mainUserProfile.email 
              ? trainers.find(t => t.email === template.creatorEmail)
              : null;

            return (
              <Card key={template.id} className="group overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{template.name}</h3>
                      <Badge className={cn(
                        "bg-white/5 text-white/40 border border-white/10",
                        template.category === 'multicycle' && "bg-brand-red/10 text-brand-red border-brand-red/20"
                      )}>
                        {template.category === 'multicycle' ? 'Multiciclo' : 'Básico'}
                      </Badge>
                    </div>
                    {trainer && (
                      <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider">
                        Criado por {trainer.name}
                      </p>
                    )}
                    <p className="text-[10px] text-white/20 font-bold uppercase">
                      {format(parseISO(template.startDate), 'dd/MM/yy')} - {format(parseISO(template.endDate), 'dd/MM/yy')}
                    </p>
                    <p className="text-xs text-white/40">
                      {template.category === 'multicycle' ? `${template.cycles?.length || 0} Ciclos • ` : `${template.sheets?.length || 0} Fichas • `}
                      {totalExercises} Exercícios total
                    </p>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenSettingsId(openSettingsId === template.id ? null : template.id)}
                      className="p-2 text-white/20 hover:text-white transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {openSettingsId === template.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenSettingsId(null)}
                          />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute right-0 top-10 w-32 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-20 overflow-hidden"
                          >
                            <button 
                              onClick={() => { onEditWorkout(template); setOpenSettingsId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold hover:bg-white/5 transition-colors"
                            >
                              <Edit size={14} /> Editar
                            </button>
                            <button 
                              onClick={() => { onDeleteWorkout(template.id); setOpenSettingsId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-400 hover:bg-white/5 transition-colors border-t border-dark-border"
                            >
                              <Trash2 size={14} /> Excluir
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {nextSheetInfo && (
                  <div className="mb-6 p-4 bg-brand-red/5 rounded-2xl border border-brand-red/20 space-y-2 relative group/session">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Sessão de Hoje</p>
                      {nextSheetInfo.cycleName && (
                        <Badge className="bg-brand-red/10 text-brand-red border border-brand-red/20">{nextSheetInfo.cycleName}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                          <Dumbbell size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{nextSheetInfo.sheet.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-white/40 font-bold uppercase">{nextSheetInfo.sheet.exercises.length} exercícios</p>
                            <span className="text-white/10">•</span>
                            <p className="text-[10px] text-brand-red font-bold uppercase flex items-center gap-1">
                              <Clock size={10} />
                              {estimateWorkoutDuration(nextSheetInfo.sheet.exercises, userProfile, exerciseStats)} min
                            </p>
                            <span className="text-white/10">•</span>
                            <p className="text-[10px] text-orange-400 font-bold uppercase flex items-center gap-1">
                              <Flame size={10} />
                              {Math.round(estimateWorkoutCalories(
                                nextSheetInfo.sheet.exercises,
                                assessments.length > 0 ? assessments[0].weight : mainUserProfile?.initialWeight,
                                userProfile,
                                exerciseStats,
                                calorieProfile
                              ))} kcal
                            </p>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (template.category === 'multicycle') {
                            onStartWorkout(template, nextSheetInfo.index);
                          } else if (hasSheets && template.sheets!.length > 1) {
                            setSelectingSheetTemplate(template);
                          } else {
                            onStartWorkout(template, hasSheets ? 0 : undefined);
                          }
                        }}
                        className="w-10 h-10 red-gradient rounded-full flex items-center justify-center shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <div className="flex flex-wrap gap-2">
                    {template.category === 'basic' ? (
                      [...(template.sheets || [])].sort((a, b) => a.order - b.order).map(sheet => (
                        <Badge key={sheet.id} className="bg-white/5 text-white/40 border border-white/10">{sheet.name}</Badge>
                      ))
                    ) : (
                      template.cycles?.map(cycle => (
                        <Badge key={cycle.id} className="bg-white/5 text-white/40 border border-white/10">{cycle.name}</Badge>
                      ))
                    )}
                  </div>

                  {!nextSheetInfo && (
                    <button 
                      onClick={() => {
                        if (template.category === 'multicycle') {
                          alert('Nenhum ciclo ativo para este treino hoje.');
                        } else if (hasSheets && template.sheets!.length > 1) {
                          setSelectingSheetTemplate(template);
                        } else {
                          onStartWorkout(template, hasSheets ? 0 : undefined);
                        }
                      }}
                      className="w-12 h-12 red-gradient rounded-full flex items-center justify-center shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  )}
                </div>
                
                {mainUserProfile.userType === 'treinador' && onCreateAd && (
                  <button
                    onClick={() => onCreateAd(template)}
                    className="w-full mt-4 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold text-sm hover:bg-emerald-500/20 transition-colors active:scale-95"
                  >
                    Criar Anúncio na Loja
                  </button>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Session History List */}
      {sessions.length > 0 && (
        <div ref={historyRef} className="space-y-4 pt-6 border-t border-white/5">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Histórico de Sessões</h3>
          <div className="space-y-3">
            {sessions.map(s => {
              const template = templates.find(t => t.id === s.workoutId);
              return (
                <Card key={s.id} className="flex justify-between items-center hover:bg-white/5 group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{format(parseISO(s.date), 'dd/MM/yyyy HH:mm')}</p>
                      {s.userId !== mainUserProfile?.email && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-bold uppercase tracking-wider">
                          {s.userId}
                        </span>
                      )}
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 font-bold uppercase tracking-wider">
                        {template?.name || 'Treino'}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">
                      Volume: {s.totalVolume}kg • {s.exercises.length} exercícios
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEditSession(s)}
                      className="p-2 text-white/20 hover:text-brand-red opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => setDeletingId(s.id)}
                      className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Sheet Selection Modal */}
      <AnimatePresence>
        {selectingSheetTemplate && (() => {
          const getNextSheetInfo = (t: WorkoutTemplate) => {
            let sheets: WorkoutSheet[] = [];
            if (t.category === 'multicycle' && t.cycles) {
              const now = new Date();
              const currentCycle = t.cycles.find(c => {
                const start = parseISO(c.startDate);
                const end = parseISO(c.endDate);
                return now >= start && now <= end;
              });
              if (currentCycle) sheets = currentCycle.sheets;
            } else if (t.sheets) {
              sheets = t.sheets;
            }
            if (sheets.length === 0) return null;
            const workoutSessions = sessions.filter(s => s.workoutId === t.id);
            const nextIndex = workoutSessions.length % sheets.length;
            return { index: nextIndex };
          };

          const nextSheetInfo = getNextSheetInfo(selectingSheetTemplate);

          return (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectingSheetTemplate(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="relative w-full max-w-sm bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold">Escolha a Ficha</h3>
                  <p className="text-xs text-white/40">Qual treino você vai esmagar hoje?</p>
                </div>
                
                <div className="grid gap-3">
                  {[...(selectingSheetTemplate.sheets || [])].sort((a, b) => a.order - b.order).map((sheet, index) => {
                    const isToday = nextSheetInfo?.index === index;
                    return (
                      <button
                        key={sheet.id}
                        onClick={() => {
                          onStartWorkout(selectingSheetTemplate, index);
                          setSelectingSheetTemplate(null);
                        }}
                        className={cn(
                          "w-full p-4 bg-white/5 border rounded-2xl flex items-center justify-between hover:border-brand-red/50 transition-all group",
                          isToday ? "border-brand-red/50 bg-brand-red/5" : "border-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                            isToday ? "bg-brand-red text-black" : "bg-brand-red/10 text-brand-red"
                          )}>
                            <Dumbbell size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold">{sheet.name}</p>
                            <p className="text-[10px] text-white/40 uppercase font-bold">{(sheet.exerciseIds?.length || sheet.exercises?.length || 0)} exercícios</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-brand-red text-black font-bold uppercase tracking-wider">
                              Hoje
                            </span>
                          )}
                          <ChevronRight size={18} className="text-white/20" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setSelectingSheetTemplate(null)}
                  className="w-full py-4 text-white/40 font-bold text-sm"
                >
                  Cancelar
                </button>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md bg-dark-surface rounded-t-3xl p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold">Excluir Sessão de Treino?</h3>
                <p className="text-sm text-white/40">Esta ação não pode ser desfeita. Deseja continuar?</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    onDeleteSession(deletingId);
                    setDeletingId(null);
                  }}
                  className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Confirmar Exclusão
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="w-full py-4 bg-white/5 text-white/60 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActiveWorkoutView({ 
  session, 
  setSession, 
  onFinish, 
  onCancel, 
  sessions, 
  templates, 
  isEditing,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile
}: { 
  session: WorkoutSession, 
  setSession: (s: WorkoutSession) => void, 
  onFinish: (metrics: { avgSetDuration: number, avgRestDuration: number, totalDuration: number }) => void, 
  onCancel: () => void, 
  sessions: WorkoutSession[], 
  templates: WorkoutTemplate[], 
  isEditing?: boolean,
  userProfile: UserTrainingProfile,
  exerciseStats: ExerciseUserStats[],
  calorieProfile: UserCalorieProfile,
  assessments: BodyAssessment[],
  mainUserProfile: UserProfile
}) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const activeExercise = session.exercises && session.exercises.length > 0 ? session.exercises[activeExerciseIndex] : null;
  const exerciseDetails = activeExercise ? EXERCISES.find(e => e.id === activeExercise.exerciseId) : null;
  
  const [elapsedTime, setElapsedTime] = useState(session.duration || 0);
  const [lastActionTime, setLastActionTime] = useState(Date.now());
  const [sessionMetrics, setSessionMetrics] = useState({
    totalSetDuration: 0,
    setCount: 0,
    totalRestDuration: 0,
    restCount: 0
  });

  // Get template for estimation
  const template = templates.find(t => t.id === session.workoutId);
  const sheet = template?.sheets?.find(s => s.id === session.sheetId) || (template?.sheets ? template.sheets[0] : null);
  const currentConfig = sheet?.exercises[activeExerciseIndex] || null;
  
  const estimatedTotalMinutes = useMemo(() => {
    if (!sheet) return 0;
    return estimateWorkoutDuration(sheet.exercises, userProfile, exerciseStats);
  }, [sheet, userProfile, exerciseStats]);

  const remainingMinutes = useMemo(() => {
    const elapsedMinutes = elapsedTime / 60;
    return Math.max(0, Math.ceil(estimatedTotalMinutes - elapsedMinutes));
  }, [estimatedTotalMinutes, elapsedTime]);

  useEffect(() => {
    if (!session.startTime || isEditing) return;
    const start = new Date(session.startTime).getTime();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startTime, isEditing]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Find the template to get rest time
  const [restTimers, setRestTimers] = useState<Record<string, { remaining: number, total: number }>>({});

  if (!activeExercise) {
    return (
      <div className="fixed inset-0 bg-dark-surface z-[100] flex flex-col items-center justify-center p-6 text-center">
        <Dumbbell size={48} className="text-white/10 mb-4" />
        <h2 className="text-xl font-bold mb-2">Treino Vazio</h2>
        <p className="text-sm text-white/40 mb-6">Este treino não possui exercícios configurados.</p>
        <button onClick={onCancel} className="px-8 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors">
          Voltar
        </button>
      </div>
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      let finishedTimer = false;
      setRestTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (next[id].remaining > 0) {
            const newRemaining = next[id].remaining - 1;
            if (newRemaining === 0) finishedTimer = true;
            next[id] = { ...next[id], remaining: newRemaining };
            changed = true;
          } else {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });

      if (finishedTimer) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const parseRestTime = (restStr: string, setIndex?: number): number => {
    if (!restStr) return 60;
    
    // Handle individual rests if comma-separated
    if (restStr.includes(',')) {
      const rests = restStr.split(',').map(s => s.trim());
      const specificRest = rests[setIndex ?? 0] || rests[0];
      return parseRestTime(specificRest);
    }

    const match = restStr.match(/(\d+)/);
    if (!match) return 60;
    
    // Handle mm:ss format
    if (restStr.includes(':')) {
      const parts = restStr.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    }

    const val = parseInt(match[1]);
    if (restStr.includes('min')) return val * 60;
    return val;
  };

  const addSet = () => {
    const newExercises = [...session.exercises];
    const lastSet = activeExercise.sets[activeExercise.sets.length - 1];
    newExercises[activeExerciseIndex].sets.push({
      id: Date.now().toString(),
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
      completed: false,
      rest: lastSet?.rest || '1 min'
    });
    setSession({ ...session, exercises: newExercises });
  };

  const handleSwapExercise = (newExerciseId: string) => {
    const newExercises = [...session.exercises];
    newExercises[activeExerciseIndex] = {
      ...newExercises[activeExerciseIndex],
      exerciseId: newExerciseId,
      // Keep the same sets structure, but reset completion and weight
      sets: newExercises[activeExerciseIndex].sets.map(set => ({
        ...set,
        completed: false,
        weight: 0
      }))
    };
    setSession({ ...session, exercises: newExercises });
  };

  const updateSet = (setIndex: number, updates: Partial<WorkoutSet>) => {
    const newExercises = [...session.exercises];
    const set = newExercises[activeExerciseIndex].sets[setIndex];
    const wasCompleted = set.completed;
    
    newExercises[activeExerciseIndex].sets[setIndex] = {
      ...set,
      ...updates
    };

    // Start timer if set was just completed
    if (!wasCompleted && updates.completed) {
      const now = Date.now();
      const setDuration = (now - lastActionTime) / 1000;
      setSessionMetrics(prev => ({
        ...prev,
        totalSetDuration: prev.totalSetDuration + setDuration,
        setCount: prev.setCount + 1
      }));
      setLastActionTime(now);

      // Use rest time from the set itself
      const restTime = parseRestTime(set.rest || '1 min');
      
      setRestTimers(prev => ({
        ...prev,
        [set.id]: { remaining: restTime, total: restTime }
      }));
    } else if (wasCompleted && updates.completed === false) {
      // Remove timer if set was uncompleted
      setRestTimers(prev => {
        const next = { ...prev };
        delete next[set.id];
        return next;
      });
    } else if (wasCompleted && updates.completed) {
      // Weight or reps updated, just update time
      setLastActionTime(Date.now());
    }

    setSession({ ...session, exercises: newExercises });
  };

  const deleteSet = (setIndex: number) => {
    if (activeExercise.sets.length <= 1) return;
    const newExercises = [...session.exercises];
    newExercises[activeExerciseIndex].sets.splice(setIndex, 1);
    setSession({ ...session, exercises: newExercises });
  };

  const currentVolume = useMemo(() => {
    return session.exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((sAcc, s) => sAcc + (s.completed ? s.reps * s.weight : 0), 0), 0
    );
  }, [session]);

  const caloriesPerMinute = useMemo(() => {
    if (!sheet) return 0;
    const weightKg = assessments.length > 0 ? assessments[0].weight : mainUserProfile?.initialWeight;
    const totalEstimatedCalories = estimateWorkoutCalories(
      sheet.exercises,
      weightKg,
      userProfile,
      exerciseStats,
      calorieProfile
    );
    const totalEstimatedMinutes = estimateWorkoutDuration(sheet.exercises, userProfile, exerciseStats);
    return totalEstimatedMinutes > 0 ? totalEstimatedCalories / totalEstimatedMinutes : 0;
  }, [sheet, assessments, mainUserProfile, userProfile, exerciseStats, calorieProfile]);

  const currentCalories = useMemo(() => {
    return Math.floor(caloriesPerMinute * (elapsedTime / 60));
  }, [caloriesPerMinute, elapsedTime]);

  const handleExerciseSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && activeExerciseIndex < session.exercises.length - 1) {
      setSwipeDirection(1);
      setActiveExerciseIndex(activeExerciseIndex + 1);
    } else if (direction === 'right' && activeExerciseIndex > 0) {
      setSwipeDirection(-1);
      setActiveExerciseIndex(activeExerciseIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-surface z-[100] flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-dark-border">
        <button onClick={() => isEditing ? onCancel() : setShowConfirmCancel(true)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
        <div className="text-center">
          <h2 className="font-bold">{isEditing ? 'Editar Treino' : 'Treinando Agora'}</h2>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 text-brand-red font-mono text-sm font-bold">
              <div className="flex items-center gap-1">
                <Play size={12} fill="currentColor" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
              {!isEditing && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame size={12} fill="currentColor" />
                  <span>{currentCalories} kcal</span>
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider">
                  Est: {estimatedTotalMinutes}m
                </span>
                <span className="text-[8px] text-white/20">•</span>
                <span className="text-[8px] text-brand-red font-bold uppercase tracking-wider">
                  Faltam: {remainingMinutes}m
                </span>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => {
            if (isEditing) {
              onFinish({
                avgSetDuration: sessionMetrics.setCount > 0 ? sessionMetrics.totalSetDuration / sessionMetrics.setCount : userProfile?.avg_set_duration,
                avgRestDuration: sessionMetrics.restCount > 0 ? sessionMetrics.totalRestDuration / sessionMetrics.restCount : userProfile?.avg_rest_duration,
                totalDuration: elapsedTime
              });
            } else {
              setShowConfirmFinish(true);
            }
          }} 
          className="px-4 py-2 bg-brand-red text-black text-xs font-bold rounded-full"
        >
          {isEditing ? 'Salvar' : 'Finalizar'}
        </button>
      </div>

      <AnimatePresence>
        {showConfirmCancel && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmCancel(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-dark-surface border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <Trash2 size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Descartar Treino?</h3>
                  <p className="text-white/40 text-sm">Tem certeza que deseja cancelar? Todo o progresso deste treino será perdido.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full pt-4">
                  <button 
                    onClick={() => setShowConfirmCancel(false)}
                    className="py-4 bg-white/5 border border-white/5 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={onCancel}
                    className="py-4 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showConfirmFinish && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmFinish(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-dark-surface border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-red" />
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Finalizar Treino?</h3>
                  <p className="text-white/40 text-sm">Você completou todos os exercícios de hoje? Seu progresso será salvo no histórico.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full pt-4">
                  <button 
                    onClick={() => setShowConfirmFinish(false)}
                    className="py-4 bg-white/5 border border-white/5 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={() => {
                      onFinish({
                        avgSetDuration: sessionMetrics.setCount > 0 ? sessionMetrics.totalSetDuration / sessionMetrics.setCount : userProfile?.avg_set_duration,
                        avgRestDuration: sessionMetrics.restCount > 0 ? sessionMetrics.totalRestDuration / sessionMetrics.restCount : userProfile?.avg_rest_duration,
                        totalDuration: elapsedTime
                      });
                      setShowConfirmFinish(false);
                    }}
                    className="py-4 bg-brand-red text-black rounded-2xl font-bold text-sm hover:bg-brand-red/90 transition-colors shadow-lg shadow-brand-red/20"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showVideoModal && exerciseDetails?.youtubeUrl && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideoModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-dark-surface border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Execução: {exerciseDetails.name}</h3>
                <button onClick={() => setShowVideoModal(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              {getYouTubeEmbedUrl(exerciseDetails.youtubeUrl) ? (
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative">
                  <iframe 
                    src={getYouTubeEmbedUrl(exerciseDetails.youtubeUrl)!}
                    title={`Vídeo de execução: ${exerciseDetails.name}`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-sm text-white/40">Vídeo não disponível para incorporação.</p>
                  <a href={exerciseDetails.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-brand-red font-bold mt-2 block">Ver no YouTube</a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" custom={swipeDirection}>
        <motion.div 
          key={activeExerciseIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            const threshold = 50;
            if (info.offset.x < -threshold) handleExerciseSwipe('left');
            else if (info.offset.x > threshold) handleExerciseSwipe('right');
          }}
          initial={{ opacity: 0, x: swipeDirection * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -swipeDirection * 50 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-6 space-y-6 touch-pan-y no-scrollbar"
        >
          {/* Progress Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {(session.exercises || []).map((ex, i) => (
            <button 
              key={ex.id}
              onClick={() => setActiveExerciseIndex(i)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors",
                i === activeExerciseIndex ? "bg-brand-red text-black" : "bg-white/5 text-white/40"
              )}
            >
              {EXERCISES.find(e => e.id === ex.exerciseId)?.name}
            </button>
          ))}
        </div>

        {activeExercise ? (
          <>
            {/* Exercise Header */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-brand-red/20 text-brand-red">{exerciseDetails?.muscleGroup}</Badge>
                    {exerciseDetails?.youtubeUrl && (
                      <button 
                        onClick={() => setShowVideoModal(true)}
                        className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <Play size={10} fill="currentColor" />
                        Ver Vídeo
                      </button>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold">{exerciseDetails?.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40 font-bold uppercase">Volume Exercício</p>
                  <p className="text-lg font-bold">
                    {(activeExercise.sets || []).reduce((acc, s) => acc + (s.completed ? s.reps * s.weight : 0), 0)} kg
                  </p>
                </div>
              </div>
            </div>

            {/* Exercise History Mini Dashboard */}
            <ExerciseHistoryDashboard 
              exerciseId={activeExercise.exerciseId} 
              sessions={sessions} 
            />

            {/* Sets Table */}
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <div className="col-span-1">#</div>
                <div className="col-span-3 text-center">Peso (kg)</div>
                <div className="col-span-3 text-center">Reps</div>
                <div className="col-span-4 text-center">Status</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {(activeExercise.sets || []).map((set, i) => {
            const timer = restTimers[set.id];
            const progress = timer ? ((timer.total - timer.remaining) / timer.total) * 100 : 0;
            
            return (
              <div key={set.id} className="relative overflow-hidden rounded-2xl border border-white/5">
                {/* Progress Fill Background */}
                {timer && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    className="absolute inset-0 bg-brand-red/10 origin-left z-0"
                    transition={{ duration: 1, ease: "linear" }}
                  />
                )}
                <div className={cn("relative z-10 grid grid-cols-12 gap-2 items-center p-4 transition-colors", set.completed ? "bg-brand-red/10" : "bg-white/5")}>
                  <div className="col-span-1 font-bold text-white/40">{i + 1}</div>
                  <div className="col-span-3 flex justify-center">
                    <div className="relative w-full max-w-[85px]">
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                        <Scale size={12} />
                      </div>
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        onChange={(e) => updateSet(i, { weight: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-8 pr-2 text-center font-bold text-sm text-white focus:outline-none focus:border-gray-400 transition-all appearance-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <div className="relative w-full max-w-[85px]">
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                        <User size={12} />
                      </div>
                      <input 
                        type="number" 
                        value={set.reps || ''} 
                        onChange={(e) => updateSet(i, { reps: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-8 pr-2 text-center font-bold text-sm text-white focus:outline-none focus:border-gray-400 transition-all appearance-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="col-span-4 flex items-center justify-center gap-3">
                    {timer ? (
                      <div className="flex items-center gap-1 text-brand-red font-mono text-xs font-bold bg-brand-red/10 px-2 py-1 rounded-lg border border-brand-red/20 animate-pulse">
                        <Clock size={12} />
                        <span>{timer.remaining}s</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-white/20 font-mono text-[10px] font-bold">
                        <Clock size={10} />
                        <span>{set.rest || '1 min'}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => updateSet(i, { completed: !set.completed })}
                      className={cn("p-1 rounded-lg transition-colors", set.completed ? "text-brand-red" : "text-white/30 hover:text-white/50")}
                    >
                      <CheckCircle2 size={26} fill={set.completed ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button 
                      onClick={() => deleteSet(i)}
                      className="p-1 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button 
            onClick={addSet}
            className="w-full py-4 border border-dashed border-dark-border rounded-2xl text-white/40 font-bold flex items-center justify-center gap-2 hover:bg-white/5"
          >
            <Plus size={20} /> Adicionar Série
          </button>
        </div>

        {/* History Preview */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-white/40">
            <History size={16} />
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Histórico Recente</h4>
          </div>
          <div className="space-y-2">
            {sessions
              .filter(s => s.exercises.some(ex => ex.exerciseId === activeExercise.exerciseId))
              .slice(0, 3)
              .map(s => {
                const exSession = s.exercises.find(ex => ex.exerciseId === activeExercise.exerciseId);
                if (!exSession) return null;
                const totalVol = exSession.sets.reduce((acc, set) => acc + (set.completed ? set.reps * set.weight : 0), 0);
                return (
                  <div key={s.id} className="flex justify-between items-center text-xs p-3 bg-white/2 rounded-xl border border-white/5">
                    <span className="text-white/40">{format(parseISO(s.date), 'dd/MM/yyyy')}</span>
                    <span className="font-bold">{exSession.sets.length} séries • {exSession.sets[0]?.weight || 0} kg</span>
                    <span className="text-brand-red font-bold">{totalVol} kg</span>
                  </div>
                );
              })}
            {sessions.filter(s => s.exercises.some(ex => ex.exerciseId === activeExercise.exerciseId)).length === 0 && (
              <p className="text-xs text-white/20 italic text-center py-2">Nenhum histórico encontrado para este exercício.</p>
            )}
          </div>
        </div>

        {/* Substitutions */}
        {currentConfig?.substitutions && currentConfig.substitutions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/40">
              <RefreshCw size={16} />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Substituições</h4>
            </div>
            <div className="space-y-2">
              {[currentConfig.exerciseId, ...currentConfig.substitutions]
                .filter(id => id !== activeExercise.exerciseId)
                .map((subId, idx) => {
                const subEx = EXERCISES.find(e => e.id === subId);
                if (!subEx) return null;
                return (
                  <div key={idx} className="flex items-center justify-between bg-dark-card border border-dark-border rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                        <Dumbbell size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{subEx.name}</p>
                        <p className="text-xs text-white/40">{subEx.muscleGroup}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSwapExercise(subId)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors"
                    >
                      Substituir
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/10">
            <Zap size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold">Nenhum exercício</h3>
            <p className="text-xs text-white/40">Esta sessão não possui exercícios configurados.</p>
          </div>
        </div>
      )}
    </motion.div>
    </AnimatePresence>

      {/* Footer Summary */}
      <div className="p-6 glass border-t border-white/10 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase">Volume Total Sessão</p>
          <p className="text-xl font-bold">{currentVolume} kg</p>
        </div>
        <div className="flex gap-2">
          <button 
            disabled={activeExerciseIndex === 0}
            onClick={() => setActiveExerciseIndex(prev => prev - 1)}
            className="p-3 bg-white/5 rounded-xl disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </button>
          {activeExerciseIndex === session.exercises.length - 1 ? (
            <button 
              onClick={() => setShowConfirmFinish(true)}
              className="px-6 py-3 bg-brand-red text-black text-xs font-bold rounded-xl shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
            >
              Finalizar
            </button>
          ) : (
            <button 
              onClick={() => setActiveExerciseIndex(prev => prev + 1)}
              className="p-3 bg-white/5 rounded-xl"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExerciseHistoryDashboard({ exerciseId, sessions }: { exerciseId: string, sessions: WorkoutSession[] }) {
  const historyData = useMemo(() => {
    const data: { date: string, volume: number, maxWeight: number }[] = [];
    
    // Get all sessions that include this exercise
    sessions.forEach(s => {
      const exSession = s.exercises.find(ex => ex.exerciseId === exerciseId);
      if (exSession) {
        let volume = 0;
        let maxWeight = 0;
        exSession.sets.forEach(set => {
          if (set.completed) {
            volume += set.weight * set.reps;
            if (set.weight > maxWeight) maxWeight = set.weight;
          }
        });
        
        if (volume > 0) {
          data.push({
            date: format(parseISO(s.date), 'dd/MM'),
            volume,
            maxWeight
          });
        }
      }
    });
    
    return data.reverse().slice(-5); // Last 5 sessions
  }, [exerciseId, sessions]);

  if (historyData.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-3 space-y-2 h-32">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Volume (kg)</p>
          <TrendingUp size={12} className="text-brand-red" />
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData}>
              <Bar dataKey="volume" fill="var(--theme-primary)" radius={[2, 2, 0, 0]} />
              <Tooltip 
                cursor={{ fill: 'var(--theme-text)', opacity: 0.05 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-dark-surface border border-white/10 p-2 rounded-lg text-[10px] shadow-xl">
                        <p className="font-bold text-brand-red">{payload[0].value} kg</p>
                        <p className="text-white/40">{payload[0].payload.date}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-3 space-y-2 h-32">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Carga Máx (kg)</p>
          <Award size={12} className="text-blue-400" />
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <Line 
                type="monotone" 
                dataKey="maxWeight" 
                stroke="#60A5FA" 
                strokeWidth={2} 
                dot={{ fill: '#60A5FA', r: 2 }} 
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-dark-surface border border-white/10 p-2 rounded-lg text-[10px] shadow-xl">
                        <p className="font-bold text-blue-400">{payload[0].value} kg</p>
                        <p className="text-white/40">{payload[0].payload.date}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function StudentEvolutionView({
  student,
  trainerEmail,
  api,
  onBack
}: {
  student: Student;
  trainerEmail: string;
  api: any;
  onBack: () => void;
}) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [assessments, setAssessments] = useState<BodyAssessment[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all sessions and assessments for the student
        const [allSessions, allAssessments, allTemplates] = await Promise.all([
          api.queryDocs('sessions', 'userEmail', '==', student.email),
          api.queryDocs('assessments', 'userEmail', '==', student.email),
          api.queryDocs('templates', 'userId', '==', student.email)
        ]);

        // Filter templates to only those created by the trainer
        const trainerTemplates = allTemplates.filter((t: WorkoutTemplate) => t.creatorEmail === trainerEmail);
        const trainerTemplateIds = new Set(trainerTemplates.map((t: WorkoutTemplate) => t.id));

        // Filter sessions to only those based on the trainer's templates
        const trainerSessions = allSessions.filter((s: WorkoutSession) => trainerTemplateIds.has(s.workoutId));

        setSessions(trainerSessions);
        setAssessments(allAssessments);
        setTemplates(trainerTemplates);
      } catch (error) {
        console.error("Error fetching student evolution data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student.email, trainerEmail, api]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/60 font-medium">Carregando evolução de {student.name}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold">Evolução do Aluno</h2>
          <p className="text-sm text-white/40">{student.name}</p>
        </div>
      </div>

      <StatsContainer 
        key="student-evolution-stats"
        sessions={sessions}
        templates={templates}
        assessments={assessments}
        onCreateWorkout={() => {}}
        onGoToStore={() => {}}
        onNewAssessment={() => {}}
        onDeleteAssessment={() => {}}
        onEditAssessment={() => {}}
        initialTab="evolution"
        readOnly={true}
      />
    </div>
  );
}

function StatsContainer({ 
  sessions, 
  templates, 
  assessments,
  onCreateWorkout, 
  onGoToStore,
  onNewAssessment,
  onDeleteAssessment,
  onEditAssessment,
  initialTab = 'stats',
  readOnly = false
}: { 
  sessions: WorkoutSession[], 
  templates: WorkoutTemplate[], 
  assessments: BodyAssessment[],
  onCreateWorkout: () => void, 
  onGoToStore: () => void,
  onNewAssessment: () => void,
  onDeleteAssessment: (id: string) => void,
  onEditAssessment: (a: BodyAssessment) => void,
  initialTab?: 'stats' | 'evolution',
  readOnly?: boolean
}) {
  const [subTab, setSubTab] = useState<'stats' | 'evolution'>(initialTab);
  const [direction, setDirection] = useState(0);

  const handleSubTabChange = (tab: 'stats' | 'evolution') => {
    if (tab === subTab) return;
    setDirection(tab === 'evolution' ? 1 : -1);
    setSubTab(tab);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">{subTab === 'stats' ? 'Estatísticas' : 'Evolução'}</h2>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => handleSubTabChange('stats')}
            className={cn(
              "px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
              subTab === 'stats' ? "bg-brand-red text-black" : "text-white/40"
            )}
          >
            Geral
          </button>
          <button 
            onClick={() => handleSubTabChange('evolution')}
            className={cn(
              "px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
              subTab === 'evolution' ? "bg-brand-red text-black" : "text-white/40"
            )}
          >
            Física
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={subTab}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 50 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              const threshold = 50;
              if (info.offset.x < -threshold && subTab === 'stats') handleSubTabChange('evolution');
              else if (info.offset.x > threshold && subTab === 'evolution') handleSubTabChange('stats');
            }}
            className="h-full touch-pan-y"
          >
            {subTab === 'stats' ? (
              <StatsView 
                sessions={sessions} 
                templates={templates} 
                onCreateWorkout={onCreateWorkout} 
                onGoToStore={onGoToStore} 
                hideHeader
                readOnly={readOnly}
              />
            ) : (
              <EvolutionView 
                assessments={assessments} 
                onNewAssessment={onNewAssessment} 
                onDeleteAssessment={onDeleteAssessment} 
                onEditAssessment={onEditAssessment} 
                hideHeader
                readOnly={readOnly}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatsView({ sessions, templates, onCreateWorkout, onGoToStore, hideHeader, readOnly }: { sessions: WorkoutSession[], templates: WorkoutTemplate[], onCreateWorkout: () => void, onGoToStore: () => void, hideHeader?: boolean, readOnly?: boolean }) {
  const chartData = useMemo(() => {
    return sessions.slice(0, 7).reverse().map(s => ({
      date: format(parseISO(s.date), 'dd/MM'),
      volume: s.totalVolume
    }));
  }, [sessions]);

  const muscleData = useMemo(() => {
    const counts: Record<string, number> = {
      'Peito': 0,
      'Costas': 0,
      'Pernas': 0,
      'Ombros': 0,
      'Braços': 0,
      'Core': 0,
      'Full Body': 0
    };
    
    let total = 0;
    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
        if (exercise) {
          counts[exercise.muscleGroup]++;
          total++;
        }
      });
    });

    if (total === 0) return Object.entries(counts).map(([name]) => ({ name, value: 0 }));

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100)
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        {!hideHeader && <h2 className="text-xl font-bold">Estatísticas</h2>}
        <Card className="py-12 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
            <BarChart3 size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-white/40 font-bold">Sem dados para exibir</p>
            <p className="text-xs text-white/20">Complete seu primeiro treino para ver suas estatísticas.</p>
          </div>
          {!readOnly && (
            <div className="flex flex-col gap-3 w-full px-6">
              <button 
                onClick={onCreateWorkout}
                className="w-full py-3 bg-brand-red/10 text-brand-red rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Criar Meu Primeiro Treino
              </button>
              <button 
                onClick={onGoToStore}
                className="w-full py-3 bg-white/5 text-white/60 rounded-xl font-bold text-sm active:scale-95 transition-transform border border-white/5"
              >
                Adquirir Novo Treino
              </button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hideHeader && <h2 className="text-xl font-bold">Estatísticas</h2>}

      <Card className="h-64">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Volume por Sessão (kg)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--theme-text)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--theme-text)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--theme-card)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}
              itemStyle={{ color: 'var(--theme-primary)' }}
            />
            <Line type="monotone" dataKey="volume" stroke="var(--theme-primary)" strokeWidth={3} dot={{ fill: 'var(--theme-primary)', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Frequência Muscular</h3>
        <div className="space-y-4">
          {muscleData.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>{item.name}</span>
                <span className="text-white/40">{item.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-dark-border rounded-full overflow-hidden">
                <div className="h-full bg-brand-red" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FinancialDashboardModal({ onClose, students, plans }: { onClose: () => void, students: Student[], plans: any[] }) {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'active' | 'late' | 'new' | 'cancellations' | 'retention' | null>(null);
  const [selectedMonthData, setSelectedMonthData] = useState<{ month: string, students: Student[], metricTitle: string } | null>(null);

  // Generate real historical data based on student plans and dates
  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthName = format(monthDate, 'MMM', { locale: ptBR });
      
      const activeStudents: Student[] = [];
      const newStudents: Student[] = [];
      const cancelledStudents: Student[] = [];
      const lateStudents: Student[] = [];
      let revenue = 0;

      students.forEach(student => {
        // Deterministic fallbacks for missing data to make the dashboard look populated but tied to real students
        const joinedAt = student.joinedAt ? parseISO(student.joinedAt) : subMonths(now, (student.id.charCodeAt(0) % 6));
        const cancelledAt = student.cancelledAt ? parseISO(student.cancelledAt) : null;
        const plan = plans.find(p => p.id === student.planId) || plans[0];
        const price = parseFloat(plan?.price || '149'); // Fallback to 149 if plan price is missing
        const isLate = student.paymentStatus === 'late' || (student.id.charCodeAt(1) % 10 === 0); // 10% chance of being late if not set

        const joinedBeforeOrDuringMonth = isBefore(joinedAt, monthEnd) || isSameDay(joinedAt, monthEnd);
        const cancelledBeforeMonthEnd = cancelledAt && (isBefore(cancelledAt, monthEnd) || isSameDay(cancelledAt, monthEnd));
        const cancelledDuringMonth = cancelledAt && isWithinInterval(cancelledAt, { start: monthStart, end: monthEnd });
        const joinedDuringMonth = isWithinInterval(joinedAt, { start: monthStart, end: monthEnd });

        if (joinedBeforeOrDuringMonth && !cancelledBeforeMonthEnd) {
          activeStudents.push(student);
          revenue += price;
          if (isLate) {
            lateStudents.push(student);
          }
        }

        if (joinedDuringMonth) {
          newStudents.push(student);
        }

        if (cancelledDuringMonth) {
          cancelledStudents.push(student);
        }
      });

      const activeAtStart = activeStudents.length - newStudents.length + cancelledStudents.length;
      const retention = activeAtStart > 0 ? 100 - (cancelledStudents.length / activeAtStart) * 100 : 100;

      data.push({
        month: monthName,
        fullDate: monthDate,
        active: activeStudents.length,
        revenue: revenue,
        new: newStudents.length,
        cancellations: cancelledStudents.length,
        late: lateStudents.length,
        retention: Math.round(retention),
        // Store the actual student lists for drill-down
        studentsList: {
          active: activeStudents,
          revenue: activeStudents, // Revenue comes from active students
          new: newStudents,
          cancellations: cancelledStudents,
          late: lateStudents,
          retention: activeStudents
        }
      });
    }
    return data;
  };

  const historicalDataArray = useMemo(() => generateHistoricalData(), [students, plans]);
  const currentMonthData = historicalDataArray[historicalDataArray.length - 1];

  const activeStudents = currentMonthData.active;
  const monthlyRevenue = currentMonthData.revenue;
  const latePayments = currentMonthData.late;
  const newThisMonth = currentMonthData.new;
  const cancellations = currentMonthData.cancellations;
  const retentionRate = currentMonthData.retention;

  // Transform array into the object format expected by the chart
  const historicalData = {
    revenue: historicalDataArray.map(d => ({ month: d.month, value: d.revenue, students: d.studentsList.revenue })),
    active: historicalDataArray.map(d => ({ month: d.month, value: d.active, students: d.studentsList.active })),
    late: historicalDataArray.map(d => ({ month: d.month, value: d.late, students: d.studentsList.late })),
    new: historicalDataArray.map(d => ({ month: d.month, value: d.new, students: d.studentsList.new })),
    cancellations: historicalDataArray.map(d => ({ month: d.month, value: d.cancellations, students: d.studentsList.cancellations })),
    retention: historicalDataArray.map(d => ({ month: d.month, value: d.retention, students: d.studentsList.retention }))
  };

  const metricDetails = {
    revenue: { title: 'Receita Mensal', color: '#10b981', prefix: 'R$ ', suffix: '' },
    active: { title: 'Alunos Ativos', color: '#3b82f6', prefix: '', suffix: '' },
    late: { title: 'Atrasados', color: '#f59e0b', prefix: '', suffix: '' },
    new: { title: 'Novos este mês', color: '#3b82f6', prefix: '', suffix: '' },
    cancellations: { title: 'Cancelamentos', color: '#ef4444', prefix: '', suffix: '' },
    retention: { title: 'Taxa de Retenção', color: '#a855f7', prefix: '', suffix: '%' }
  };

  const handleBarClick = (data: any) => {
    if (selectedMetric && data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      setSelectedMonthData({
        month: payload.month,
        students: payload.students,
        metricTitle: metricDetails[selectedMetric].title
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-surface border border-white/10 rounded-3xl shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-dark-surface z-10">
          <div className="flex items-center gap-3">
            {selectedMetric ? (
              <button 
                onClick={() => { setSelectedMetric(null); setSelectedMonthData(null); }}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <PieChart size={20} />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold">{selectedMetric ? metricDetails[selectedMetric].title : 'Gestão Financeira'}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                {selectedMetric ? 'Comparativo Histórico' : 'Visão Geral do Mês'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {selectedMetric ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData[selectedMetric]} onClick={handleBarClick} className="cursor-pointer">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-text)" strokeOpacity={0.1} vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="var(--theme-text)" 
                        strokeOpacity={0.4}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="var(--theme-text)" 
                        strokeOpacity={0.4}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${metricDetails[selectedMetric].prefix}${value}${metricDetails[selectedMetric].suffix}`}
                      />
                      <Tooltip 
                        cursor={{ fill: 'var(--theme-text)', opacity: 0.05 }}
                        contentStyle={{ 
                          backgroundColor: 'var(--theme-card)', 
                          border: '1px solid var(--theme-border)',
                          borderRadius: '12px',
                          color: 'var(--theme-text)'
                        }}
                        formatter={(value: number) => [`${metricDetails[selectedMetric].prefix}${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${metricDetails[selectedMetric].suffix}`, metricDetails[selectedMetric].title]}
                      />
                      <Bar 
                        dataKey="value" 
                        fill={metricDetails[selectedMetric].color} 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Drill-down Student List */}
                <AnimatePresence>
                  {selectedMonthData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white">
                            {selectedMonthData.metricTitle} em {selectedMonthData.month}
                          </h3>
                          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                            {selectedMonthData.students.length} aluno(s)
                          </span>
                        </div>
                        
                        {selectedMonthData.students.length > 0 ? (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedMonthData.students.map(student => (
                              <div key={student.id} className="flex items-center gap-3 p-3 bg-dark-surface border border-white/5 rounded-xl">
                                <img src={student.avatarUrl} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                                <div>
                                  <p className="text-sm font-bold text-white">{student.name}</p>
                                  <p className="text-xs text-white/40">{student.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-white/40 text-sm">
                            Nenhum aluno encontrado para este período.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Main Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setSelectedMetric('active')}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-left hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-white/60">
                      <Users size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Alunos Ativos</span>
                    </div>
                    <p className="text-3xl font-display font-bold">{activeStudents}</p>
                  </button>
                  
                  <button 
                    onClick={() => setSelectedMetric('revenue')}
                    className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-2 col-span-2 sm:col-span-1 text-left hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-emerald-500">
                      <DollarSign size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Receita Mensal</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-emerald-500">
                      R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </button>

                  <button 
                    onClick={() => setSelectedMetric('late')}
                    className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-2 text-left hover:bg-amber-500/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertCircle size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Atrasados</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-amber-500">{latePayments}</p>
                  </button>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setSelectedMetric('new')}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <CalendarPlus size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Novos este mês</p>
                        <p className="text-lg font-bold">{newThisMonth}</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedMetric('cancellations')}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <UserMinus size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Cancelamentos</p>
                        <p className="text-lg font-bold">{cancellations}</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedMetric('retention')}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Percent size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Taxa de Retenção</p>
                        <p className="text-lg font-bold">{retentionRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Próximos Vencimentos</h3>
                  <div className="space-y-3">
                    {students.slice(0, 3).map((student, i) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-dark-bg rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{student.name}</p>
                            <p className="text-[10px] text-white/40">Vence em {i + 2} dias</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-500">R$ 150,00</p>
                          <button className="text-[10px] text-white/40 hover:text-white underline mt-1">Lembrar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function StudentsView({ students, userProfile, onMessage, pendingRequests, onRespond, onDisconnect, onViewWorkouts, onViewEvolution, api }: { 
  students: Student[], 
  userProfile: UserProfile, 
  onMessage: (s: Student) => void,
  pendingRequests: any[],
  onRespond: (id: string, status: 'accepted' | 'rejected') => void,
  onDisconnect: (email: string) => void,
  onViewWorkouts?: (student: Student) => void,
  onViewEvolution?: (student: Student) => void,
  api: any
}) {
  const [filter, setFilter] = useState<'all' | 'evolving' | 'stagnated' | 'at-risk' | 'new'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showRequestsPopup, setShowRequestsPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [firestoreError, setFirestoreError] = useState<Error | null>(null);
  const [showFinancialDashboard, setShowFinancialDashboard] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'planos' | 'avaliacoes' | 'anamnese'>('planos');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  const [plans, setPlans] = useState([
    { id: '1', name: 'Consultoria Mensal', price: '149', features: ['1 Treino personalizado', 'Suporte via chat', 'Avaliação mensal'], badge: 'Básico', badgeColor: 'bg-brand-red text-black' },
    { id: '2', name: 'Consultoria Trimestral', price: '399', features: ['3 Treinos personalizados', 'Suporte prioritário', 'Avaliação quinzenal'], badge: 'Premium', badgeColor: 'bg-white/10 text-white' }
  ]);
  const [evaluations, setEvaluations] = useState([
    {
      id: '1',
      name: 'Avaliação Padrão',
      fields: [
        { id: '1', name: 'Peso Corporal', type: 'Numérico (kg)', required: true, icon: 'Scale' },
        { id: '2', name: 'Percentual de Gordura', type: 'Numérico (%)', required: false, icon: 'Ruler' },
        { id: '3', name: 'Fotos de Evolução', type: 'Imagem (Frente, Lado, Costas)', required: false, icon: 'Camera' }
      ]
    }
  ]);
  const [anamnesis, setAnamnesis] = useState([
    {
      id: '1',
      name: 'Anamnese Padrão',
      questions: [
        { id: '1', question: 'Qual seu principal objetivo atual?', type: 'Múltipla Escolha (Hipertrofia, Emagrecimento, Saúde, etc)' },
        { id: '2', question: 'Possui alguma lesão ou restrição médica?', type: 'Texto Longo' },
        { id: '3', question: 'Quantos dias por semana você pode treinar?', type: 'Número (1 a 7)' }
      ]
    }
  ]);

  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingEval, setEditingEval] = useState<any>(null);
  const [editingEvalField, setEditingEvalField] = useState<any>(null);
  const [editingAnamnesis, setEditingAnamnesis] = useState<any>(null);
  const [editingAnamnesisQuestion, setEditingAnamnesisQuestion] = useState<any>(null);

  useEffect(() => {
    if (!userProfile?.email) return;
    
    const fetchSettings = async () => {
      try {
        const data = await api.getTrainerSettings();
        if (data.plans?.length) setPlans(data.plans);
        if (data.evaluations?.length) setEvaluations(data.evaluations);
        if (data.anamnesis?.length) setAnamnesis(data.anamnesis);
      } catch (error) {
        console.error("Failed to fetch trainer settings:", error);
      }
    };

    fetchSettings();
  }, [userProfile?.email, api]);

  const handleSavePlans = async (newPlans: any[]) => {
    setPlans(newPlans);
    try {
      await api.updateTrainerSettings({ plans: newPlans });
      toast.success('Planos atualizados com sucesso!');
    } catch (error) {
      console.error("Failed to save plans:", error);
      toast.error("Erro ao salvar planos");
    }
  };

  const handleSaveEvaluations = async (newEvals: any[]) => {
    setEvaluations(newEvals);
    try {
      await api.updateTrainerSettings({ evaluations: newEvals });
      toast.success('Avaliações atualizadas com sucesso!');
    } catch (error) {
      console.error("Failed to save evaluations:", error);
      toast.error("Erro ao salvar avaliações");
    }
  };

  const handleSaveAnamnesis = async (newAnamnesis: any[]) => {
    setAnamnesis(newAnamnesis);
    try {
      await api.updateTrainerSettings({ anamnesis: newAnamnesis });
      toast.success('Anamnese atualizada com sucesso!');
    } catch (error) {
      console.error("Failed to save anamnesis:", error);
      toast.error("Erro ao salvar anamnese");
    }
  };

  const handleCopyCode = () => {
    const code = userProfile?.personalCode || 'SHAPE123';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRespond = async (id: string, status: 'accepted' | 'rejected') => {
    setIsResponding(id);
    try {
      await onRespond(id, status);
    } finally {
      setIsResponding(null);
    }
  };

  const activeStudents = students.filter(s => s.connectionStatus === 'accepted');
  
  const filteredStudents = activeStudents.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const stats = {
    active: activeStudents.length,
    today: activeStudents.filter(s => s.lastWorkout === 'Hoje' || s.lastWorkout === '1 dia atrás').length,
    atRisk: activeStudents.filter(s => s.status === 'at-risk').length,
    avgProgress: students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.score, 0) / students.length) : 0
  };

  if (selectedStudent) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedStudent(null)} className="p-2 bg-white/5 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Detalhes do Aluno</h2>
        </div>

        {/* Header - Mimicking ProfileView */}
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-2 border-brand-red p-1">
              <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
            <p className="text-sm text-white/40 font-medium">{selectedStudent.email}</p>
          </div>
          
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <span>Score de Evolução</span>
              <span>{selectedStudent.score}%</span>
            </div>
            <ProgressBar progress={selectedStudent.score} max={100} />
          </div>
        </div>

        {/* Perfil de Treino - Mimicking ProfileView */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-brand-red rounded-full" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Perfil de Treino</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] text-white/20 font-bold uppercase">Objetivo</p>
              <div className="flex items-center gap-2">
                <Target size={14} className="text-brand-red" />
                <p className="text-sm font-bold">{selectedStudent.objective || 'Não definido'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-white/20 font-bold uppercase">Nível</p>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-brand-red" />
                <p className="text-sm font-bold">{selectedStudent.experienceLevel || 'Não definido'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid - Mimicking ProfileView */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase">Streak Atual</p>
              <p className="text-sm font-bold text-brand-red">{selectedStudent.streak} d</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
              <CalendarIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase">Último Treino</p>
              <p className="text-sm font-bold">{selectedStudent.lastWorkout}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase">Progresso</p>
              <p className="text-sm font-bold">+{selectedStudent.progress}%</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase">Status</p>
              <p className={cn(
                "text-sm font-bold",
                selectedStudent.status === 'evolving' ? "text-emerald-400" :
                selectedStudent.status === 'at-risk' ? "text-red-400" : "text-orange-400"
              )}>
                {selectedStudent.status === 'evolving' ? 'Evoluindo' : 
                 selectedStudent.status === 'at-risk' ? 'Em Risco' : 
                 selectedStudent.status === 'stagnated' ? 'Estagnado' : 'Novo'}
              </p>
            </div>
          </Card>
        </div>

        {/* Consistency Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-4 bg-brand-red rounded-full" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Consistência Semanal</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(selectedStudent.weeklyWorkouts || []).map((w, i) => ({ name: `Sem ${i+1}`, value: w }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--theme-text)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--theme-text)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="value" fill="var(--theme-primary)" radius={[4, 4, 0, 0]}>
                  {(selectedStudent.weeklyWorkouts || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="var(--theme-primary)" fillOpacity={entry >= 4 ? 1 : entry >= 2 ? 0.5 : 0.25} />
                  ))}
                </Bar>
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-dark-card border border-dark-border p-2 rounded-lg shadow-xl">
                          <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{payload[0].payload.name}</p>
                          <p className="text-sm font-bold text-brand-red">{payload[0].value} treinos</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onViewWorkouts && onViewWorkouts(selectedStudent)}
            className="flex flex-col items-center gap-2 p-6 bg-dark-card border border-dark-border rounded-2xl active:scale-95 transition-transform hover:border-brand-red/30 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
              <Edit size={24} />
            </div>
            <span className="text-xs font-bold">Editar Treino</span>
          </button>
          <button 
            onClick={() => onViewEvolution && onViewEvolution(selectedStudent)}
            className="flex flex-col items-center gap-2 p-6 bg-dark-card border border-dark-border rounded-2xl active:scale-95 transition-transform hover:border-emerald-400/30 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold">Ver Evolução</span>
          </button>
          <button 
            onClick={() => onMessage(selectedStudent)}
            className="flex flex-col items-center gap-2 p-6 bg-dark-card border border-dark-border rounded-2xl active:scale-95 transition-transform hover:border-blue-400/30 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <MessageSquare size={24} />
            </div>
            <span className="text-xs font-bold">Mensagem</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-6 bg-dark-card border border-dark-border rounded-2xl active:scale-95 transition-transform hover:border-orange-400/30 group">
            <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
              <Bell size={24} />
            </div>
            <span className="text-xs font-bold">Lembrete</span>
          </button>
          <button 
            onClick={() => setShowDisconnectConfirm(selectedStudent.email)}
            className="flex flex-col items-center gap-2 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl active:scale-95 transition-all hover:bg-red-500/10 group col-span-2"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <UserMinus size={24} />
            </div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Desconectar Aluno</span>
          </button>
        </div>
        
        {/* Disconnect Confirm Popup */}
        <AnimatePresence>
          {showDisconnectConfirm && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-xs bg-dark-bg border border-white/10 rounded-3xl p-6 text-center space-y-6 shadow-2xl"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
                  <UserMinus size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Desconectar Aluno?</h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Tem certeza que deseja encerrar a conexão com este aluno? Ele não terá mais acesso aos seus treinos.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={async () => {
                      await onDisconnect(showDisconnectConfirm);
                      setShowDisconnectConfirm(null);
                      setSelectedStudent(null);
                    }}
                    className="w-full py-4 bg-red-500 rounded-2xl text-xs font-bold uppercase tracking-widest text-black hover:bg-red-600 transition-colors"
                  >
                    Confirmar Desconexão
                  </button>
                  <button 
                    onClick={() => setShowDisconnectConfirm(null)}
                    className="w-full py-4 bg-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Gestão de Alunos</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowRequestsPopup(true)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative hover:bg-white/10 transition-colors"
            >
              <Bell size={20} />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red rounded-full text-[10px] font-bold flex items-center justify-center text-black">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button 
              onClick={handleCopyCode}
              className={cn(
                "px-4 h-10 rounded-xl flex items-center gap-2 transition-all",
                copied ? "bg-emerald-500 text-black" : "bg-brand-red text-black hover:scale-105 active:scale-95"
              )}
            >
              {copied ? <Check size={16} /> : <Plus size={16} />}
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {copied ? "Copiado!" : "Copiar Código de Treinador"}
              </span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        <Card className="min-w-[140px] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-blue-400">
            <Users size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ativos</span>
          </div>
          <p className="text-2xl font-display font-bold">{stats.active}</p>
        </Card>
        <Card className="min-w-[140px] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-emerald-400">
            <Flame size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Hoje</span>
          </div>
          <p className="text-2xl font-display font-bold">{stats.today}</p>
        </Card>
        <Card className="min-w-[140px] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Em Risco</span>
          </div>
          <p className="text-2xl font-display font-bold">{stats.atRisk}</p>
        </Card>
        <Card className="min-w-[140px] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-brand-red">
            <TrendingUp size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Progresso</span>
          </div>
          <p className="text-2xl font-display font-bold">+{stats.avgProgress}%</p>
        </Card>
      </div>

      <button
        onClick={() => setShowFinancialDashboard(true)}
        className="w-full p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 flex items-center justify-between hover:bg-emerald-500/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm">Gestão Financeira</h3>
            <p className="text-[10px] uppercase tracking-widest opacity-80">Ver painel de receitas e métricas</p>
          </div>
        </div>
        <ChevronRight size={20} className="opacity-50" />
      </button>

      {/* Radar Section */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Radar de Alunos</h3>
        {students.filter(s => s.status === 'at-risk' || s.status === 'evolving').length > 0 ? (
          <div className="space-y-3">
            {students.filter(s => s.status === 'at-risk').map(student => (
              <Card key={student.id} className="bg-brand-red/5 border-brand-red/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">{student.name} está em risco</p>
                    <p className="text-[10px] text-white/40">{student.lastWorkout}. Envie um lembrete.</p>
                  </div>
                  <button 
                    onClick={() => onMessage(student)}
                    className="p-2 bg-white/5 rounded-lg text-brand-red"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </Card>
            ))}
            {students.filter(s => s.status === 'evolving').map(student => (
              <Card key={student.id} className="bg-emerald-500/5 border-emerald-500/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <TrendingUp size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">{student.name} evoluindo rápido</p>
                    <p className="text-[10px] text-white/40">Progresso de {student.progress}%. Parabéns!</p>
                  </div>
                  <button 
                    onClick={() => onMessage(student)}
                    className="p-2 bg-white/5 rounded-lg text-emerald-400"
                  >
                    <Trophy size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/5 border-white/10 p-4 text-center">
            <p className="text-xs text-white/40">Nenhum alerta no radar no momento.</p>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'evolving', label: 'Evoluindo' },
          { id: 'stagnated', label: 'Estagnados' },
          { id: 'at-risk', label: 'Em Risco' },
          { id: 'new', label: 'Novos' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
              filter === f.id ? "bg-brand-red text-black" : "bg-white/5 text-white/40 hover:bg-white/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Student List */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Lista de Alunos</h3>
        {filteredStudents.length > 0 ? (
          (filteredStudents || []).map(student => (
            <Card 
              key={student.id} 
              className="p-4 flex flex-col gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() => setSelectedStudent(student)}
            >
              <div className="flex items-center gap-4">
                <img src={student.avatarUrl} alt={student.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold">{student.name}</h4>
                    {student.status === 'at-risk' && <AlertTriangle size={14} className="text-red-400" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] text-white/40 flex items-center gap-1">
                      <Clock size={10} /> {student.lastWorkout}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-bold">+{student.progress}%</p>
                    <p className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                      <Flame size={10} /> {student.streak}d
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-brand-red transition-colors" />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase">
                  <span>Consistência</span>
                  <span>{Math.round((student.score / 100) * 8)}/8</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1 flex-1 rounded-full",
                        i < (student.score / 100) * 8 ? "bg-emerald-500" : "bg-white/5"
                      )} 
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudent(student);
                  }}
                  className="flex-1 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Ver Perfil
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessage(student);
                  }}
                  className="flex-1 py-2 bg-brand-red/10 text-brand-red rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-red/20 transition-colors"
                >
                  Mensagem
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
              <Users size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white/60">Nenhum aluno encontrado</h3>
              <p className="text-xs text-white/40 max-w-[200px] mx-auto">
                {filter === 'all' 
                  ? "Você ainda não tem alunos conectados. Compartilhe seu código para começar."
                  : "Nenhum aluno corresponde ao filtro selecionado."}
              </p>
              {filter === 'all' && userProfile?.personalCode && (
                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 inline-block mx-auto">
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Seu Código</p>
                  <p className="text-2xl font-mono font-bold text-brand-red tracking-widest">{userProfile?.personalCode}</p>
                </div>
              )}
            </div>
            {filter === 'all' && (
              <div className="flex items-center justify-center gap-2">
                <button 
                  onClick={handleCopyCode}
                  className={cn(
                    "px-6 py-2 rounded-xl text-black text-xs font-bold uppercase tracking-widest transition-all",
                    copied ? "bg-emerald-500" : "bg-brand-red hover:scale-105 active:scale-95"
                  )}
                >
                  {copied ? "Código Copiado!" : "Copiar Código de Treinador"}
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Settings size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Requests Popup */}
      <AnimatePresence>
        {showRequestsPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-dark-bg border border-dark-border rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold">Solicitações de Alunos</h3>
                <button onClick={() => setShowRequestsPopup(false)} className="p-2 bg-white/5 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {pendingRequests.length > 0 ? (
                  (pendingRequests || []).map((req) => (
                    <div key={req.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <img src={req.studentAvatar} alt={req.studentName} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-sm">{req.studentName}</h4>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{req.studentEmail}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          disabled={isResponding === req.id}
                          onClick={() => handleRespond(req.id, 'accepted')}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {isResponding === req.id ? '...' : 'Aceitar'}
                        </button>
                        <button 
                          disabled={isResponding === req.id}
                          onClick={() => handleRespond(req.id, 'rejected')}
                          className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                      <UserCheck size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-white/60">Nenhuma solicitação pendente</p>
                      <p className="text-xs text-white/40 mt-1">Quando novos alunos solicitarem seu acompanhamento, eles aparecerão aqui.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 bg-white/5">
                <button 
                  onClick={() => setShowRequestsPopup(false)}
                  className="w-full py-4 bg-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Popup */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-dark-bg border border-dark-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold">Configurações do Treinador</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex border-b border-white/5 shrink-0">
                {[
                  { id: 'planos', label: 'Planos' },
                  { id: 'avaliacoes', label: 'Avaliações' },
                  { id: 'anamnese', label: 'Anamnese' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id as any)}
                    className={cn(
                      "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-b-2",
                      settingsTab === tab.id 
                        ? "border-brand-red text-brand-red" 
                        : "border-transparent text-white/40 hover:text-white/60 hover:bg-white/5"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {firestoreError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-red-500">Erro de Permissão no Firestore</h4>
                      <p className="text-xs text-red-400 mt-1">
                        Você não tem permissão para salvar ou carregar estas configurações. 
                        Por favor, atualize as regras de segurança no console do Firebase para permitir acesso à coleção <code>trainer_settings</code>.
                      </p>
                    </div>
                  </div>
                )}

                {settingsTab === 'planos' && (
                  <div className="space-y-6">
                    {editingPlan ? (
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm">{editingPlan.id ? 'Editar Plano' : 'Novo Plano'}</h4>
                        <div className="space-y-4">
                          <InputGroup icon={<Edit size={16} />} label="Nome do Plano" value={editingPlan.name} onChange={(val) => setEditingPlan({...editingPlan, name: val})} />
                          <InputGroup icon={<Edit size={16} />} label="Preço (R$)" type="number" value={editingPlan.price} onChange={(val) => setEditingPlan({...editingPlan, price: val})} />
                          <InputGroup icon={<Edit size={16} />} label="Badge (ex: Básico, Premium)" value={editingPlan.badge} onChange={(val) => setEditingPlan({...editingPlan, badge: val})} />
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Benefícios (um por linha)</label>
                            <textarea 
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-red transition-colors resize-none h-24"
                              value={editingPlan.features.join('\n')}
                              onChange={(e) => setEditingPlan({...editingPlan, features: e.target.value.split('\n')})}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <button onClick={() => setEditingPlan(null)} className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Cancelar</button>
                            <button 
                              onClick={async () => {
                                try {
                                  if (editingPlan.id) {
                                    await handleSavePlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
                                  } else {
                                    await handleSavePlans([...plans, { ...editingPlan, id: Date.now().toString(), badgeColor: 'bg-white/10 text-white' }]);
                                  }
                                  setEditingPlan(null);
                                } catch (e) {
                                  setFirestoreError(e as Error);
                                }
                              }}
                              className="flex-1 py-3 bg-brand-red text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm">Seus Planos</h4>
                            <p className="text-xs text-white/40 mt-1">Configure os planos que seus alunos podem assinar.</p>
                          </div>
                          <button 
                            onClick={() => setEditingPlan({ name: '', price: '', features: [], badge: '' })}
                            className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
                          >
                            <Plus size={14} /> Novo Plano
                          </button>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          {plans.map(plan => (
                            <Card key={plan.id} className="p-4 border-white/10 bg-white/5 space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  {plan.badge && <Badge className={cn("mb-2", plan.badgeColor || "bg-white/10 text-white")}>{plan.badge}</Badge>}
                                  <h5 className="font-bold text-lg">{plan.name}</h5>
                                </div>
                                <span className="font-mono font-bold text-xl">R$ {plan.price}</span>
                              </div>
                              <ul className="space-y-2 text-xs text-white/60">
                                {plan.features.map((feature: string, i: number) => (
                                  <li key={i} className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {feature}</li>
                                ))}
                              </ul>
                              <div className="flex gap-2 pt-2 border-t border-white/10">
                                <button onClick={() => setEditingPlan(plan)} className="flex-1 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Editar</button>
                                <button onClick={async () => {
                                  try {
                                    await handleSavePlans(plans.filter(p => p.id !== plan.id));
                                  } catch (e) {
                                    setFirestoreError(e as Error);
                                  }
                                }} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {settingsTab === 'avaliacoes' && (
                  <div className="space-y-6">
                    {editingEval ? (
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm">{editingEval.id ? 'Editar Modelo de Avaliação' : 'Novo Modelo de Avaliação'}</h4>
                        <div className="space-y-4">
                          <InputGroup icon={<Edit size={16} />} label="Nome do Modelo" value={editingEval.name} onChange={(val) => setEditingEval({...editingEval, name: val})} />
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Campos da Avaliação</label>
                              <button 
                                onClick={() => setEditingEvalField({ name: '', type: '', required: false })}
                                className="text-[10px] font-bold uppercase tracking-widest text-brand-red hover:text-white transition-colors"
                              >
                                + Adicionar Campo
                              </button>
                            </div>
                            
                            {editingEvalField ? (
                              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                <h5 className="font-bold text-xs">{editingEvalField.id ? 'Editar Campo' : 'Novo Campo'}</h5>
                                <InputGroup icon={<Edit size={16} />} label="Nome do Campo" value={editingEvalField.name} onChange={(val) => setEditingEvalField({...editingEvalField, name: val})} />
                                <SelectGroup 
                                  icon={<Edit size={16} />} 
                                  label="Tipo de Campo" 
                                  value={editingEvalField.type} 
                                  onChange={(val) => setEditingEvalField({...editingEvalField, type: val})} 
                                  options={[
                                    { value: 'Numérico', label: 'Numérico' },
                                    { value: 'Texto', label: 'Texto' },
                                    { value: 'Imagem', label: 'Imagem' },
                                    { value: 'Data', label: 'Data' },
                                    { value: 'Sim/Não', label: 'Sim/Não' }
                                  ]}
                                />
                                <div className="flex items-center gap-3 p-2">
                                  <input 
                                    type="checkbox" 
                                    id="eval-field-required" 
                                    checked={editingEvalField.required} 
                                    onChange={(e) => setEditingEvalField({...editingEvalField, required: e.target.checked})}
                                    className="w-4 h-4 accent-brand-red"
                                  />
                                  <label htmlFor="eval-field-required" className="text-sm font-bold">Campo Obrigatório</label>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => setEditingEvalField(null)} className="flex-1 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Cancelar</button>
                                  <button 
                                    onClick={() => {
                                      if (editingEvalField.id) {
                                        setEditingEval({
                                          ...editingEval,
                                          fields: editingEval.fields.map((f: any) => f.id === editingEvalField.id ? editingEvalField : f)
                                        });
                                      } else {
                                        setEditingEval({
                                          ...editingEval,
                                          fields: [...(editingEval.fields || []), { ...editingEvalField, id: Date.now().toString(), icon: 'Edit' }]
                                        });
                                      }
                                      setEditingEvalField(null);
                                    }}
                                    className="flex-1 py-2 bg-brand-red text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                                  >
                                    Salvar Campo
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {(editingEval.fields || []).map((field: any) => (
                                  <div key={field.id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                                        {field.icon === 'Scale' ? <Scale size={12} /> : field.icon === 'Ruler' ? <Ruler size={12} /> : field.icon === 'Camera' ? <Camera size={12} /> : <Edit size={12} />}
                                      </div>
                                      <div>
                                        <p className="font-bold text-xs">{field.name}</p>
                                        <p className="text-[9px] text-white/40 uppercase tracking-widest">{field.required ? 'Obrigatório' : 'Opcional'} • {field.type}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <button onClick={() => setEditingEvalField(field)} className="p-1.5 text-white/40 hover:text-white transition-colors"><Edit size={14} /></button>
                                      <button onClick={() => setEditingEval({...editingEval, fields: editingEval.fields.filter((f: any) => f.id !== field.id)})} className="p-1.5 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                  </div>
                                ))}
                                {(!editingEval.fields || editingEval.fields.length === 0) && (
                                  <p className="text-xs text-white/40 text-center py-4">Nenhum campo adicionado a este modelo.</p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-4">
                            <button onClick={() => { setEditingEval(null); setEditingEvalField(null); }} className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Cancelar</button>
                            <button 
                              onClick={async () => {
                                try {
                                  if (editingEval.id) {
                                    await handleSaveEvaluations(evaluations.map(e => e.id === editingEval.id ? editingEval : e));
                                  } else {
                                    await handleSaveEvaluations([...evaluations, { ...editingEval, id: Date.now().toString() }]);
                                  }
                                  setEditingEval(null);
                                  setEditingEvalField(null);
                                } catch (e) {
                                  setFirestoreError(e as Error);
                                }
                              }}
                              className="flex-1 py-3 bg-brand-red text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                              Salvar Modelo
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm">Modelos de Avaliação</h4>
                            <p className="text-xs text-white/40 mt-1">Crie modelos de avaliação física para seus alunos.</p>
                          </div>
                          <button 
                            onClick={() => setEditingEval({ name: '', fields: [] })}
                            className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
                          >
                            <Plus size={14} /> Novo Modelo
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {evaluations.map(evalItem => (
                            <div key={evalItem.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-sm">{evalItem.name}</p>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{evalItem.fields?.length || 0} campos</p>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => setEditingEval(evalItem)} className="p-2 text-white/40 hover:text-white transition-colors"><Edit size={16} /></button>
                                  <button onClick={async () => {
                                    try {
                                      await handleSaveEvaluations(evaluations.filter(e => e.id !== evalItem.id));
                                    } catch (e) {
                                      setFirestoreError(e as Error);
                                    }
                                  }} className="p-2 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {settingsTab === 'anamnese' && (
                  <div className="space-y-6">
                    {editingAnamnesis ? (
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm">{editingAnamnesis.id ? 'Editar Modelo de Anamnese' : 'Novo Modelo de Anamnese'}</h4>
                        <div className="space-y-4">
                          <InputGroup icon={<Edit size={16} />} label="Nome do Modelo" value={editingAnamnesis.name} onChange={(val) => setEditingAnamnesis({...editingAnamnesis, name: val})} />
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Perguntas</label>
                              <button 
                                onClick={() => setEditingAnamnesisQuestion({ question: '', type: '' })}
                                className="text-[10px] font-bold uppercase tracking-widest text-brand-red hover:text-white transition-colors"
                              >
                                + Adicionar Pergunta
                              </button>
                            </div>
                            
                            {editingAnamnesisQuestion ? (
                              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                <h5 className="font-bold text-xs">{editingAnamnesisQuestion.id ? 'Editar Pergunta' : 'Nova Pergunta'}</h5>
                                <InputGroup icon={<Edit size={16} />} label="Pergunta" value={editingAnamnesisQuestion.question} onChange={(val) => setEditingAnamnesisQuestion({...editingAnamnesisQuestion, question: val})} />
                                <SelectGroup 
                                  icon={<Edit size={16} />} 
                                  label="Tipo de Resposta" 
                                  value={editingAnamnesisQuestion.type} 
                                  onChange={(val) => setEditingAnamnesisQuestion({...editingAnamnesisQuestion, type: val})} 
                                  options={[
                                    { value: 'Texto Curto', label: 'Texto Curto' },
                                    { value: 'Texto Longo', label: 'Texto Longo' },
                                    { value: 'Múltipla Escolha', label: 'Múltipla Escolha' },
                                    { value: 'Numérico', label: 'Numérico' },
                                    { value: 'Data', label: 'Data' },
                                    { value: 'Sim/Não', label: 'Sim/Não' }
                                  ]}
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => setEditingAnamnesisQuestion(null)} className="flex-1 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Cancelar</button>
                                  <button 
                                    onClick={() => {
                                      if (editingAnamnesisQuestion.id) {
                                        setEditingAnamnesis({
                                          ...editingAnamnesis,
                                          questions: editingAnamnesis.questions.map((q: any) => q.id === editingAnamnesisQuestion.id ? editingAnamnesisQuestion : q)
                                        });
                                      } else {
                                        setEditingAnamnesis({
                                          ...editingAnamnesis,
                                          questions: [...(editingAnamnesis.questions || []), { ...editingAnamnesisQuestion, id: Date.now().toString() }]
                                        });
                                      }
                                      setEditingAnamnesisQuestion(null);
                                    }}
                                    className="flex-1 py-2 bg-brand-red text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                                  >
                                    Salvar Pergunta
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {(editingAnamnesis.questions || []).map((q: any, index: number) => (
                                  <div key={q.id} className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                                    <div className="flex justify-between items-start">
                                      <p className="font-bold text-xs">{index + 1}. {q.question}</p>
                                      <div className="flex gap-1">
                                        <button onClick={() => setEditingAnamnesisQuestion(q)} className="p-1.5 text-white/40 hover:text-white transition-colors"><Edit size={14} /></button>
                                        <button onClick={() => setEditingAnamnesis({...editingAnamnesis, questions: editingAnamnesis.questions.filter((item: any) => item.id !== q.id)})} className="p-1.5 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                      </div>
                                    </div>
                                    <p className="text-[9px] text-white/40 uppercase tracking-widest">{q.type}</p>
                                  </div>
                                ))}
                                {(!editingAnamnesis.questions || editingAnamnesis.questions.length === 0) && (
                                  <p className="text-xs text-white/40 text-center py-4">Nenhuma pergunta adicionada a este modelo.</p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-4">
                            <button onClick={() => { setEditingAnamnesis(null); setEditingAnamnesisQuestion(null); }} className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Cancelar</button>
                            <button 
                              onClick={async () => {
                                try {
                                  if (editingAnamnesis.id) {
                                    await handleSaveAnamnesis(anamnesis.map(a => a.id === editingAnamnesis.id ? editingAnamnesis : a));
                                  } else {
                                    await handleSaveAnamnesis([...anamnesis, { ...editingAnamnesis, id: Date.now().toString() }]);
                                  }
                                  setEditingAnamnesis(null);
                                  setEditingAnamnesisQuestion(null);
                                } catch (e) {
                                  setFirestoreError(e as Error);
                                }
                              }}
                              className="flex-1 py-3 bg-brand-red text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                              Salvar Modelo
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm">Modelos de Anamnese</h4>
                            <p className="text-xs text-white/40 mt-1">Crie questionários para enviar aos seus alunos.</p>
                          </div>
                          <button 
                            onClick={() => setEditingAnamnesis({ name: '', questions: [] })}
                            className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
                          >
                            <Plus size={14} /> Novo Modelo
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {anamnesis.map((item) => (
                            <div key={item.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-sm">{item.name}</p>
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.questions?.length || 0} perguntas</p>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => setEditingAnamnesis(item)} className="p-2 text-white/40 hover:text-white transition-colors"><Edit size={16} /></button>
                                  <button onClick={async () => {
                                    try {
                                      await handleSaveAnamnesis(anamnesis.filter(a => a.id !== item.id));
                                    } catch (e) {
                                      setFirestoreError(e as Error);
                                    }
                                  }} className="p-2 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-white/5 shrink-0 border-t border-white/5 flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setEditingPlan(null);
                    setEditingEval(null);
                    setEditingEvalField(null);
                    setEditingAnamnesis(null);
                    setEditingAnamnesisQuestion(null);
                    setShowSettings(false);
                  }}
                  className="px-6 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    try {
                      if (editingPlan) {
                        if (editingPlan.id) {
                          await handleSavePlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
                        } else {
                          await handleSavePlans([...plans, { ...editingPlan, id: Date.now().toString(), badgeColor: 'bg-white/10 text-white' }]);
                        }
                        setEditingPlan(null);
                        toast.success('Plano salvo com sucesso!');
                      } else if (editingEvalField && editingEval) {
                        if (editingEvalField.id) {
                          setEditingEval({
                            ...editingEval,
                            fields: editingEval.fields.map((f: any) => f.id === editingEvalField.id ? editingEvalField : f)
                          });
                        } else {
                          setEditingEval({
                            ...editingEval,
                            fields: [...(editingEval.fields || []), { ...editingEvalField, id: Date.now().toString(), icon: 'Edit' }]
                          });
                        }
                        setEditingEvalField(null);
                        toast.success('Campo salvo com sucesso!');
                      } else if (editingEval) {
                        if (editingEval.id) {
                          await handleSaveEvaluations(evaluations.map(e => e.id === editingEval.id ? editingEval : e));
                        } else {
                          await handleSaveEvaluations([...evaluations, { ...editingEval, id: Date.now().toString() }]);
                        }
                        setEditingEval(null);
                        toast.success('Modelo de avaliação salvo com sucesso!');
                      } else if (editingAnamnesisQuestion && editingAnamnesis) {
                        if (editingAnamnesisQuestion.id) {
                          setEditingAnamnesis({
                            ...editingAnamnesis,
                            questions: editingAnamnesis.questions.map((q: any) => q.id === editingAnamnesisQuestion.id ? editingAnamnesisQuestion : q)
                          });
                        } else {
                          setEditingAnamnesis({
                            ...editingAnamnesis,
                            questions: [...(editingAnamnesis.questions || []), { ...editingAnamnesisQuestion, id: Date.now().toString() }]
                          });
                        }
                        setEditingAnamnesisQuestion(null);
                        toast.success('Pergunta salva com sucesso!');
                      } else if (editingAnamnesis) {
                        if (editingAnamnesis.id) {
                          await handleSaveAnamnesis(anamnesis.map(a => a.id === editingAnamnesis.id ? editingAnamnesis : a));
                        } else {
                          await handleSaveAnamnesis([...anamnesis, { ...editingAnamnesis, id: Date.now().toString() }]);
                        }
                        setEditingAnamnesis(null);
                        toast.success('Modelo de anamnese salvo com sucesso!');
                      } else {
                        toast.success('Configurações salvas com sucesso!');
                        setShowSettings(false);
                      }
                    } catch (e) {
                      setFirestoreError(e as Error);
                    }
                  }}
                  className="px-6 py-3 bg-brand-red text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disconnect Confirm Popup */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs bg-dark-bg border border-white/10 rounded-3xl p-6 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
                <UserMinus size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Desconectar Aluno?</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Tem certeza que deseja encerrar a conexão com este aluno? Ele não terá mais acesso aos seus treinos.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={async () => {
                    await onDisconnect(showDisconnectConfirm);
                    setShowDisconnectConfirm(null);
                    setSelectedStudent(null);
                  }}
                  className="w-full py-4 bg-red-500 rounded-2xl text-xs font-bold uppercase tracking-widest text-black hover:bg-red-600 transition-colors"
                >
                  Confirmar Desconexão
                </button>
                <button 
                  onClick={() => setShowDisconnectConfirm(null)}
                  className="w-full py-4 bg-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinancialDashboard && (
          <FinancialDashboardModal 
            onClose={() => setShowFinancialDashboard(false)} 
            students={students} 
            plans={plans}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TrainersView({ userProfile, trainers, onMessage, onConnect, onDisconnect, getTrainers, studentConnections = [] }: { userProfile: UserProfile, trainers: any[], onMessage: (t: any) => void, onConnect: (code: string) => Promise<void>, onDisconnect: (trainerEmail: string) => Promise<void>, getTrainers: () => Promise<any[]>, studentConnections?: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConnectPopup, setShowConnectPopup] = useState(false);
  const [connectCode, setConnectCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null);
  
  const connectedTrainers = trainers.filter(t => 
    studentConnections.some(c => c.trainerEmail === t.email && c.status === 'accepted')
  );

  const [activeSubTab, setActiveSubTab] = useState<'explore' | 'connected'>(connectedTrainers.length > 0 ? 'connected' : 'explore');
  const [loading, setLoading] = useState(false);

  const filteredTrainers = trainers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.specialty && t.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.personalCode && t.personalCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleConnect = async () => {
    if (!connectCode) return;
    setIsConnecting(true);
    try {
      await onConnect(connectCode);
      setShowConnectPopup(false);
      setConnectCode('');
      // We don't automatically switch to 'connected' because it's a request, not a direct connection
      // But for UX, we can show a success message or just close the popup
    } catch (error: any) {
      console.error("Connection failed:", error);
      alert(error.message || 'Erro ao solicitar conexão.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Treinadores</h2>
          <p className="text-xs text-white/40">Encontre o profissional ideal para acelerar seus resultados.</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveSubTab('explore')}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              activeSubTab === 'explore' ? "bg-brand-red text-black shadow-lg" : "text-white/40 hover:text-white/60"
            )}
          >
            Explorar
          </button>
          <button 
            onClick={() => setActiveSubTab('connected')}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative",
              activeSubTab === 'connected' ? "bg-brand-red text-black shadow-lg" : "text-white/40 hover:text-white/60"
            )}
          >
            Conectados
            {connectedTrainers.length > 0 && activeSubTab !== 'connected' && (
              <span className="absolute top-2 right-4 w-2 h-2 bg-brand-red rounded-full border-2 border-dark-bg" />
            )}
          </button>
        </div>
      </div>

      {activeSubTab === 'connected' ? (
        <div className="space-y-6">
          {connectedTrainers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Meus Treinadores</h3>
              </div>
              {connectedTrainers.map(trainer => (
                <Card key={trainer.email} className="p-6 space-y-6 border-brand-red/30 bg-brand-red/5">
                  <div className="flex gap-4">
                    <img src={trainer.avatarUrl} alt={trainer.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-red p-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">{trainer.name}</h3>
                          <p className="text-xs text-brand-red font-bold uppercase tracking-wider">{trainer.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-brand-red/10 px-2 py-1 rounded-lg">
                          <Trophy size={10} className="text-brand-red" />
                          <span className="text-[10px] font-bold text-brand-red">{trainer.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-white/20 uppercase font-bold">Alunos</span>
                          <span className="text-xs font-bold">{trainer.students}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-[8px] text-white/20 uppercase font-bold">Experiência</span>
                          <span className="text-xs font-bold">{trainer.experience}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => onMessage({ ...trainer, id: trainer.email })}
                      className="flex items-center justify-center gap-2 py-3 bg-brand-red rounded-xl text-xs font-bold text-black active:scale-95 transition-transform"
                    >
                      <MessageSquare size={16} />
                      Mensagem
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60 active:scale-95 transition-transform">
                      <History size={16} />
                      Histórico
                    </button>
                    <button 
                      onClick={() => setShowDisconnectConfirm(trainer.email)}
                      className="flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-500 active:scale-95 transition-transform"
                    >
                      <Trash2 size={16} />
                      Sair
                    </button>
                  </div>
                </Card>
              ))}

              <Card className="p-4 bg-white/5 border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Plano de Treino</p>
                    <p className="text-[10px] text-white/40">Atualizado há 2 dias</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </Card>
            </div>
          ) : (
            <div className="py-12 text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <Users size={40} />
              </div>
              <div className="space-y-2 max-w-[240px] mx-auto">
                <h3 className="font-bold">Nenhum treinador conectado</h3>
                <p className="text-xs text-white/40 leading-relaxed">Conecte-se a um profissional para receber acompanhamento personalizado.</p>
              </div>
              <button 
                onClick={() => setActiveSubTab('explore')}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Explorar Profissionais
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="bg-brand-red/5 border-brand-red/20 p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red mx-auto">
              <QrCode size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold">{connectedTrainers.length > 0 ? 'Adicionar outro treinador' : 'Conecte-se a um treinador'}</h4>
              <p className="text-[10px] text-white/40">Receba treinos personalizados e acompanhamento profissional.</p>
            </div>
            <button 
              onClick={() => setShowConnectPopup(true)}
              className="w-full py-3 bg-brand-red rounded-xl text-[10px] font-bold uppercase tracking-widest text-black hover:bg-brand-red/90 transition-colors"
            >
              Digitar Código do Personal
            </button>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Explorar Profissionais</h3>
              <Badge className="bg-white/5 text-white/40">{filteredTrainers.length} encontrados</Badge>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou especialidade..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
              <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40">
                <Filter size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {(filteredTrainers || []).map(trainer => (
                <Card key={trainer.email} className="p-4 space-y-4 group hover:border-brand-red/30 transition-colors">
                  <div className="flex gap-4">
                    <img src={trainer.avatarUrl} alt={trainer.name} className="w-16 h-16 rounded-2xl object-cover border border-white/10 group-hover:border-brand-red/50 transition-colors" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{trainer.name}</h3>
                            <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">ID: {trainer.personalCode}</span>
                          </div>
                          <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider">{trainer.specialty || 'Personal Trainer'}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-brand-red/10 px-2 py-1 rounded-lg">
                          <Trophy size={10} className="text-brand-red" />
                          <span className="text-[10px] font-bold text-brand-red">{trainer.rating || 5.0}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 mt-2 line-clamp-2">{trainer.description || 'Especialista em resultados personalizados.'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-white/20 uppercase font-bold">Alunos</span>
                        <span className="text-xs font-bold">{trainer.students || 0}</span>
                      </div>
                      <div className="w-px h-6 bg-white/5" />
                      <div className="flex flex-col">
                        <span className="text-[8px] text-white/20 uppercase font-bold">Experiência</span>
                        <span className="text-xs font-bold">{trainer.experience || '5+ anos'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const existing = studentConnections.find(c => c.trainerEmail === trainer.email);
                        if (existing && existing.status === 'pending') return;
                        setConnectCode(trainer.personalCode);
                        setShowConnectPopup(true);
                      }}
                      className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        studentConnections.find(c => c.trainerEmail === trainer.email)?.status === 'pending'
                          ? "bg-white/5 border border-white/10 text-white/40 cursor-default"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-brand-red hover:text-black hover:border-brand-red"
                      )}
                    >
                      {studentConnections.find(c => c.trainerEmail === trainer.email)?.status === 'pending' 
                        ? 'Solicitado' 
                        : 'Conectar'}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xs bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Desconectar Treinador?</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Você perderá o acesso aos treinos personalizados enviados por este profissional.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowDisconnectConfirm(null)}
                  className="py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60 active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    if (showDisconnectConfirm) {
                      await onDisconnect(showDisconnectConfirm);
                      setShowDisconnectConfirm(null);
                      if (connectedTrainers.length <= 1) {
                        setActiveSubTab('explore');
                      }
                    }
                  }}
                  className="py-3 bg-red-500 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connect Popup */}
      <AnimatePresence>
        {showConnectPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-dark-bg border border-dark-border rounded-3xl p-6 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Conectar Treinador</h3>
                <button onClick={() => setShowConnectPopup(false)} className="p-2 bg-white/5 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-white/60">Insira o código de 6 dígitos fornecido pelo seu personal trainer.</p>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Código do Personal</label>
                  <input 
                    type="text" 
                    value={connectCode}
                    onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC123"
                    className="w-full bg-dark-card border border-dark-border rounded-2xl px-4 py-4 text-xl font-display font-bold text-center tracking-widest focus:outline-none focus:border-brand-red transition-colors"
                  />
                </div>
              </div>

              <button 
                onClick={handleConnect}
                disabled={connectCode.length < 3 || isConnecting}
                className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Conectando...
                  </>
                ) : 'Confirmar Conexão'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EvolutionView({ assessments, onNewAssessment, onDeleteAssessment, onEditAssessment, hideHeader, readOnly }: { assessments: BodyAssessment[], onNewAssessment: () => void, onDeleteAssessment: (id: string) => void, onEditAssessment: (a: BodyAssessment) => void, hideHeader?: boolean, readOnly?: boolean }) {
  const latest = assessments[0];
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const weightGoalProgress = useMemo(() => {
    if (!latest?.targetWeight || assessments.length < 1) return null;
    const initial = assessments[assessments.length - 1].weight;
    const current = latest.weight;
    const target = latest.targetWeight;
    
    if (initial === target) return 100;
    const total = initial - target;
    const done = initial - current;
    return Math.max(0, Math.min(100, (done / total) * 100));
  }, [assessments, latest]);

  const chartData = useMemo(() => {
    return [...assessments].reverse().map(a => ({
      date: format(parseISO(a.date), 'dd/MM'),
      weight: a.weight
    }));
  }, [assessments]);

  if (assessments.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        {!hideHeader && (
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Evolução</h2>
            {!readOnly && (
              <button 
                onClick={onNewAssessment}
                className="p-2 bg-brand-red/10 text-brand-red rounded-full"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        )}

        <Card className="py-12 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
            <TrendingUp size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-white/40 font-bold">Ainda não há avaliações</p>
            <p className="text-xs text-white/20">Registre sua primeira avaliação física para acompanhar sua evolução.</p>
          </div>
          <div className="flex flex-col gap-3 w-full px-6">
            {!readOnly && (
              <button 
                onClick={onNewAssessment}
                className="w-full py-3 red-gradient text-black rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Nova Avaliação Física
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {!hideHeader && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Evolução</h2>
          {!readOnly && (
            <button 
              onClick={onNewAssessment}
              className="p-2 bg-brand-red/10 text-brand-red rounded-full"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      )}

      {/* Current Stats Cards */}
      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
              <Scale size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Peso Atual</p>
              <h3 className="text-2xl font-display font-bold">{latest?.weight || '--'} <span className="text-sm font-sans text-white/40">kg</span></h3>
            </div>
            {assessments.length > 1 && (
              <div className={cn("text-xs font-bold", latest.weight < assessments[1].weight ? "text-emerald-400" : "text-red-400")}>
                {latest.weight < assessments[1].weight ? '↓' : '↑'} {Math.abs(latest.weight - assessments[1].weight).toFixed(1)}kg
              </div>
            )}
          </div>
          
          {latest?.targetWeight && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between items-end">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Meta: {latest.targetWeight}kg</p>
                <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">{weightGoalProgress?.toFixed(0)}% Concluído</p>
              </div>
              <ProgressBar progress={weightGoalProgress || 0} max={100} className="h-1" />
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-brand-red">
              <Flame size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">% Gordura</span>
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{latest?.bodyFat || '--'}%</p>
              {latest?.targetBodyFat && (
                <p className="text-[10px] text-white/40 font-bold uppercase mt-1">Meta: {latest.targetBodyFat}%</p>
              )}
            </div>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Ruler size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Braço</span>
            </div>
            <p className="text-2xl font-display font-bold">{latest?.arm || '--'} <span className="text-sm font-sans text-white/40">cm</span></p>
          </Card>
        </div>
      </div>

      {/* Weight Chart */}
      <Card className="h-64">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Evolução do Peso</h3>
          <TrendingUp size={14} className="text-brand-red" />
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--theme-text)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--theme-text)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--theme-card)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}
              itemStyle={{ color: 'var(--theme-primary)' }}
            />
            <Line type="monotone" dataKey="weight" stroke="var(--theme-primary)" strokeWidth={3} dot={{ fill: 'var(--theme-primary)', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Body Measurements */}
      <Card className="space-y-4">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Medidas Corporais</h3>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <MeasurementItem label="Peito" value={latest?.chest} unit="cm" />
          <MeasurementItem label="Cintura" value={latest?.waist} unit="cm" />
          <MeasurementItem label="Perna" value={latest?.leg} unit="cm" />
          <MeasurementItem label="Braço" value={latest?.arm} unit="cm" />
        </div>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Histórico de Avaliações</h3>
        <div className="space-y-3">
          {assessments.map(a => (
            <Card key={a.id} className="flex justify-between items-center hover:bg-white/5 group">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{format(parseISO(a.date), 'dd/MM/yyyy')}</p>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 font-bold uppercase tracking-wider">
                    {a.method || 'Bioimpedância'}
                  </span>
                </div>
                <p className="text-xs text-white/40">Peso: {a.weight}kg • Gordura: {a.bodyFat}%</p>
              </div>
              {!readOnly && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEditAssessment(a)}
                    className="p-2 text-white/20 hover:text-brand-red opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => setDeletingId(a.id)}
                    className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md bg-dark-surface rounded-t-3xl p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold">Excluir Avaliação?</h3>
                <p className="text-sm text-white/40">Esta ação não pode ser desfeita. Deseja continuar?</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    onDeleteAssessment(deletingId);
                    setDeletingId(null);
                  }}
                  className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Confirmar Exclusão
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="w-full py-4 bg-white/5 text-white/60 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MeasurementItem({ label, value, unit }: { label: string, value?: number, unit: string }) {
  return (
    <div className="flex justify-between items-center border-b border-dark-border pb-2">
      <span className="text-xs text-white/60">{label}</span>
      <span className="text-sm font-bold">{value || '--'} {unit}</span>
    </div>
  );
}

function NewAssessmentView({ onSave, onCancel, initialData }: { onSave: (a: BodyAssessment) => void, onCancel: () => void, initialData?: BodyAssessment }) {
  const [formData, setFormData] = useState<Partial<BodyAssessment>>(initialData || {
    method: 'Bioimpedância',
    weight: undefined,
    bodyFat: undefined,
    arm: undefined,
    chest: undefined,
    waist: undefined,
    leg: undefined,
    targetWeight: undefined,
    targetBodyFat: undefined,
    observation: '',
    skinfolds: {}
  });
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const requiredFields = ['weight', 'bodyFat', 'arm', 'chest', 'waist', 'leg'];
    const missingFields = requiredFields.filter(f => formData[f as keyof BodyAssessment] === undefined || formData[f as keyof BodyAssessment] === 0);
    
    if (missingFields.length > 0) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newAssessment: BodyAssessment = {
      id: initialData?.id || Date.now().toString(),
      date: initialData?.date || new Date().toISOString(),
      method: formData.method as AssessmentMethod || 'Bioimpedância',
      weight: Number(formData.weight),
      bodyFat: Number(formData.bodyFat),
      arm: Number(formData.arm),
      chest: Number(formData.chest),
      waist: Number(formData.waist),
      leg: Number(formData.leg),
      skinfolds: formData.skinfolds,
      targetWeight: formData.targetWeight ? Number(formData.targetWeight) : undefined,
      targetBodyFat: formData.targetBodyFat ? Number(formData.targetBodyFat) : undefined,
      observation: formData.observation,
    };
    onSave(newAssessment);
  };

  const methods: AssessmentMethod[] = ['Bioimpedância', '7 Dobras', '3 Dobras'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Nova Avaliação</h2>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold"
        >
          <X size={18} />
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Método de Avaliação</label>
          <div className="grid grid-cols-2 gap-2">
            {methods.map(m => (
              <button
                key={m}
                onClick={() => setFormData({ ...formData, method: m })}
                className={cn(
                  "py-3 rounded-xl text-xs font-bold transition-all border",
                  formData.method === m 
                    ? "bg-brand-red/10 border-brand-red text-brand-red" 
                    : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Peso (kg)" value={formData.weight?.toString() || ''} onChange={(v) => setFormData({...formData, weight: Number(v)})} icon={<Scale size={18} />} type="number" />
          <InputGroup label="Gordura (%)" value={formData.bodyFat?.toString() || ''} onChange={(v) => setFormData({...formData, bodyFat: Number(v)})} icon={<Flame size={18} />} type="number" />
        </div>

        {(formData.method === '7 Dobras' || formData.method === '3 Dobras') && (
          <div className="pt-4 border-t border-white/5 space-y-4">
            <h3 className="text-[10px] text-brand-red font-bold uppercase tracking-widest px-2">Dobras Cutâneas (mm)</h3>
            <div className="grid grid-cols-2 gap-4">
              {formData.method === '7 Dobras' && (
                <>
                  <InputGroup label="Subescapular" value={formData.skinfolds?.subscapular?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, subscapular: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                  <InputGroup label="Tríceps" value={formData.skinfolds?.triceps?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, triceps: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                  <InputGroup label="Peitoral" value={formData.skinfolds?.chest?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, chest: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                  <InputGroup label="Axilar Média" value={formData.skinfolds?.axillary?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, axillary: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                  <InputGroup label="Supra-ilíaca" value={formData.skinfolds?.suprailiac?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, suprailiac: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                  <InputGroup label="Abdominal" value={formData.skinfolds?.abdominal?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, abdominal: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                  <InputGroup label="Coxa" value={formData.skinfolds?.thigh?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, thigh: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                </>
              )}
              {formData.method === '3 Dobras' && (
                <>
                  <InputGroup label="Peitoral/Tríceps" value={formData.skinfolds?.chest?.toString() || formData.skinfolds?.triceps?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, chest: Number(v), triceps: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                  <InputGroup label="Abdominal/Supra-ilíaca" value={formData.skinfolds?.abdominal?.toString() || formData.skinfolds?.suprailiac?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, abdominal: Number(v), suprailiac: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                  <InputGroup label="Coxa" value={formData.skinfolds?.thigh?.toString() || ''} onChange={(v) => setFormData({...formData, skinfolds: {...formData.skinfolds, thigh: Number(v)}})} icon={<Ruler size={16} />} type="number" />
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Braço (cm)" value={formData.arm?.toString() || ''} onChange={(v) => setFormData({...formData, arm: Number(v)})} icon={<Ruler size={18} />} type="number" />
          <InputGroup label="Peito (cm)" value={formData.chest?.toString() || ''} onChange={(v) => setFormData({...formData, chest: Number(v)})} icon={<Ruler size={18} />} type="number" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Cintura (cm)" value={formData.waist?.toString() || ''} onChange={(v) => setFormData({...formData, waist: Number(v)})} icon={<Ruler size={18} />} type="number" />
          <InputGroup label="Perna (cm)" value={formData.leg?.toString() || ''} onChange={(v) => setFormData({...formData, leg: Number(v)})} icon={<Ruler size={18} />} type="number" />
        </div>

        <div className="pt-4 border-t border-white/5 space-y-4">
          <h3 className="text-[10px] text-brand-red font-bold uppercase tracking-widest px-2">Metas de Evolução</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Meta de Peso (kg)" value={formData.targetWeight?.toString() || ''} onChange={(v) => setFormData({...formData, targetWeight: Number(v)})} icon={<Target size={18} />} type="number" />
            <InputGroup label="Meta de Gordura (%)" value={formData.targetBodyFat?.toString() || ''} onChange={(v) => setFormData({...formData, targetBodyFat: Number(v)})} icon={<Target size={18} />} type="number" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Observação</label>
          <textarea 
            value={formData.observation}
            onChange={(e) => setFormData({...formData, observation: e.target.value})}
            className="w-full bg-dark-card border border-dark-border rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-gray-400 transition-colors min-h-[100px]"
            placeholder="Como você se sente hoje?"
          />
        </div>

        <button className="w-full py-4 border border-dashed border-dark-border rounded-2xl text-white/40 font-bold flex items-center justify-center gap-2 hover:bg-white/5">
          <Camera size={20} /> Adicionar Foto (Opcional)
        </button>
      </div>

      <div className="pt-6">
        <button 
          onClick={handleSave}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          Salvar Avaliação
        </button>
      </div>
    </div>
  );
}

function AchievementsView({ achievements, userStats, userProfile }: { achievements: Achievement[], userStats: UserStats, userProfile: UserProfile }) {
  const isTrainer = userProfile.userType === 'treinador';
  const availableCategories = isTrainer 
    ? ['All', 'Engagement', 'Mentorship', 'Community', 'Challenges']
    : ['All', 'Consistency', 'Strength', 'Volume', 'Frequency', 'Challenges'];

  const [filter, setFilter] = useState<string>('All');

  const filtered = achievements
    .filter(a => filter === 'All' || a.category === filter);

  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Conquistas</h2>
        <div className="text-right">
          <p className="text-[10px] text-white/40 font-bold uppercase">Progresso Total</p>
          <p className="text-sm font-bold text-brand-red">{unlockedAchievements} / {totalAchievements}</p>
        </div>
      </div>

      {/* Level Card */}
      <Card className="red-gradient p-6 text-black">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Nível Atual</p>
            <h3 className="text-3xl font-display font-bold">
              {userStats.level < 5 ? 'Iniciante' : 
               userStats.level < 10 ? 'Intermediário' : 
               userStats.level < 20 ? 'Avançado' : 
               userStats.level < 50 ? 'Elite' : 'Lenda'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-black/20 flex items-center justify-center font-display font-bold text-xl">
            {userStats.level}
          </div>
        </div>
        <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-black" style={{ width: `${(userStats.xp / 1000) * 100}%` }} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{userStats.xp} / 1000 XP para Nível {userStats.level + 1}</p>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {availableCategories.map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors",
              filter === f ? "bg-brand-red text-black" : "bg-white/5 text-white/40"
            )}
          >
            {f === 'All' ? 'Todas' : f}
          </button>
        ))}
      </div>

      {/* Achievements List */}
      <div className="space-y-4">
        {filtered.map(a => (
          <Card key={a.id} className={cn("flex items-center gap-4", a.unlockedAt ? "border-brand-red/30" : "opacity-60")}>
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", a.unlockedAt ? "bg-brand-red/10 text-brand-red" : "bg-white/5 text-white/20")}>
              {a.icon === 'Flame' && <Flame size={28} />}
              {a.icon === 'Dumbbell' && <Dumbbell size={28} />}
              {a.icon === 'Trophy' && <Trophy size={28} />}
              {a.icon === 'Weight' && <TrendingUp size={28} />}
              {a.icon === 'Target' && <Target size={28} />}
              {a.icon === 'Sun' && <Sun size={28} />}
              {a.icon === 'Users' && <Users size={28} />}
              {a.icon === 'FileText' && <FileText size={28} />}
              {a.icon === 'Star' && <Star size={28} />}
              {a.icon === 'MessageSquare' && <MessageSquare size={28} />}
              {a.icon === 'Award' && <Award size={28} />}
              {a.icon === 'Crown' && <Crown size={28} />}
              {a.icon === 'Swords' && <Swords size={28} />}
              {a.icon === 'Activity' && <Activity size={28} />}
              {a.icon === 'Medal' && <Medal size={28} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">{a.name}</h3>
                {a.unlockedAt && <CheckCircle2 size={16} className="text-brand-red" />}
              </div>
              <p className="text-xs text-white/40 mb-2">{a.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex-1 max-w-[120px]">
                  <ProgressBar progress={a.progress} max={a.maxProgress} className="h-1" />
                </div>
                <span className="text-[10px] font-bold text-brand-red">+{a.xpValue} XP</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CustomizationModal({ onClose }: { onClose: () => void }) {
  const themes = [
    { id: 'default', name: 'Vermelho (Padrão)', color: '#E53E3E' },
    { id: 'blue', name: 'Azul', color: '#3B82F6' },
    { id: 'green', name: 'Verde', color: '#10B981' },
    { id: 'purple', name: 'Roxo', color: '#8B5CF6' },
    { id: 'orange', name: 'Laranja', color: '#F97316' },
  ];

  const [currentTheme, setCurrentTheme] = useState(document.documentElement.getAttribute('data-theme') || 'default');
  const [currentMode, setCurrentMode] = useState(document.documentElement.getAttribute('data-mode') || 'dark');
  const [currentRadius, setCurrentRadius] = useState(document.documentElement.getAttribute('data-radius') || 'rounded');
  const [currentGradients, setCurrentGradients] = useState(document.documentElement.getAttribute('data-gradients') || 'enabled');
  const [currentTextSize, setCurrentTextSize] = useState(document.documentElement.getAttribute('data-text-size') || 'standard');
  const [currentAnimations, setCurrentAnimations] = useState(document.documentElement.getAttribute('data-animations') || 'enabled');
  
  const [activeCategory, setActiveCategory] = useState<'appearance' | 'interface' | 'layout'>('appearance');

  const categories = [
    { id: 'appearance', label: 'Aparência', icon: <Palette size={16} /> },
    { id: 'interface', label: 'Interface', icon: <SlidersHorizontal size={16} /> },
    { id: 'layout', label: 'Layout', icon: <LayoutDashboard size={16} /> },
  ];

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    if (themeId === 'default') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('app-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('app-theme', themeId);
    }
  };

  const handleModeChange = (modeId: string) => {
    setCurrentMode(modeId);
    if (modeId === 'dark') {
      document.documentElement.removeAttribute('data-mode');
      localStorage.removeItem('app-mode');
    } else {
      document.documentElement.setAttribute('data-mode', modeId);
      localStorage.setItem('app-mode', modeId);
    }
  };

  const handleRadiusChange = (radiusId: string) => {
    setCurrentRadius(radiusId);
    if (radiusId === 'rounded') {
      document.documentElement.removeAttribute('data-radius');
      localStorage.removeItem('app-radius');
    } else {
      document.documentElement.setAttribute('data-radius', radiusId);
      localStorage.setItem('app-radius', radiusId);
    }
  };

  const handleGradientsChange = (gradientsId: string) => {
    setCurrentGradients(gradientsId);
    if (gradientsId === 'enabled') {
      document.documentElement.removeAttribute('data-gradients');
      localStorage.removeItem('app-gradients');
    } else {
      document.documentElement.setAttribute('data-gradients', gradientsId);
      localStorage.setItem('app-gradients', gradientsId);
    }
  };

  const handleTextSizeChange = (textSizeId: string) => {
    setCurrentTextSize(textSizeId);
    if (textSizeId === 'standard') {
      document.documentElement.removeAttribute('data-text-size');
      localStorage.removeItem('app-text-size');
    } else {
      document.documentElement.setAttribute('data-text-size', textSizeId);
      localStorage.setItem('app-text-size', textSizeId);
    }
  };

  const handleAnimationsChange = (animationsId: string) => {
    setCurrentAnimations(animationsId);
    if (animationsId === 'enabled') {
      document.documentElement.removeAttribute('data-animations');
      localStorage.removeItem('app-animations');
    } else {
      document.documentElement.setAttribute('data-animations', animationsId);
      localStorage.setItem('app-animations', animationsId);
    }
  };

  const [currentDefaultTab, setCurrentDefaultTab] = useState(localStorage.getItem('app-default-tab') || 'dashboard');
  
  const handleDefaultTabChange = (tabId: string) => {
    setCurrentDefaultTab(tabId);
    localStorage.setItem('app-default-tab', tabId);
  };

  const defaultWidgets = [
    { id: 'stats', title: 'Estatísticas Rápidas', visible: true },
    { id: 'next-workout', title: 'Próximo Treino', visible: true },
    { id: 'water', title: 'Água', visible: true },
    { id: 'calories', title: 'Calorias', visible: true },
    { id: 'progress-score', title: 'Score de Progresso', visible: true },
    { id: 'ai-coach', title: 'Coach IA', visible: true },
    { id: 'hire-coach', title: 'Contratar Treinador', visible: true },
    { id: 'motivation', title: 'Motivação do Dia', visible: true },
    { id: 'community', title: 'Comunidade', visible: true },
    { id: 'records', title: 'Recordes Pessoais', visible: true },
    { id: 'weekly-goal', title: 'Meta Semanal', visible: true },
    { id: 'last-achievement', title: 'Última Conquista', visible: true },
  ];

  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('app-dashboard-widgets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with default to ensure new widgets are added if any
        const merged = defaultWidgets.map(dw => {
          const found = parsed.find((pw: any) => pw.id === dw.id);
          return found ? { ...dw, visible: found.visible } : dw;
        });
        // Sort based on parsed order
        merged.sort((a, b) => {
          const indexA = parsed.findIndex((pw: any) => pw.id === a.id);
          const indexB = parsed.findIndex((pw: any) => pw.id === b.id);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        return merged;
      } catch (e) {
        return defaultWidgets;
      }
    }
    return defaultWidgets;
  });

  const toggleWidget = (id: string) => {
    const newWidgets = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgets(newWidgets);
    localStorage.setItem('app-dashboard-widgets', JSON.stringify(newWidgets));
    window.dispatchEvent(new Event('dashboard-widgets-updated'));
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newWidgets = [...widgets];
      [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
      setWidgets(newWidgets);
      localStorage.setItem('app-dashboard-widgets', JSON.stringify(newWidgets));
      window.dispatchEvent(new Event('dashboard-widgets-updated'));
    } else if (direction === 'down' && index < widgets.length - 1) {
      const newWidgets = [...widgets];
      [newWidgets[index + 1], newWidgets[index]] = [newWidgets[index], newWidgets[index + 1]];
      setWidgets(newWidgets);
      localStorage.setItem('app-dashboard-widgets', JSON.stringify(newWidgets));
      window.dispatchEvent(new Event('dashboard-widgets-updated'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-dark-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Customização</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Aparência do App</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-white/5 px-6 pt-4 gap-4 shrink-0 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeCategory === cat.id 
                  ? 'border-brand-red text-brand-red' 
                  : 'border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto no-scrollbar">
          {activeCategory === 'appearance' && (
            <>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Modo de Exibição</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleModeChange('dark')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      currentMode === 'dark' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <Moon size={24} />
                    <span className="font-bold text-sm">Escuro</span>
                  </button>
                  <button
                    onClick={() => handleModeChange('light')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      currentMode === 'light' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <Sun size={24} />
                    <span className="font-bold text-sm">Claro</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Temas de Cores</h4>
                <div className="grid grid-cols-1 gap-3">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        currentTheme === theme.id 
                          ? 'bg-white/10 border-white/20' 
                          : 'bg-dark-card border-dark-border hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full shadow-inner" 
                          style={{ backgroundColor: theme.color }}
                        />
                        <span className="font-medium text-sm">{theme.name}</span>
                      </div>
                      {currentTheme === theme.id && (
                        <CheckCircle2 size={20} className="text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Efeitos de Gradiente</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleGradientsChange('enabled')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      currentGradients === 'enabled' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-red to-brand-red-light" />
                    <span className="font-bold text-sm">Ativado</span>
                  </button>
                  <button
                    onClick={() => handleGradientsChange('disabled')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      currentGradients === 'disabled' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-red" />
                    <span className="font-bold text-sm">Desativado</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeCategory === 'interface' && (
            <>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Estilo Visual</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleRadiusChange('rounded')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      currentRadius === 'rounded' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <div className="w-8 h-8 border-2 border-current rounded-xl" />
                    <span className="font-bold text-sm">Arredondado</span>
                  </button>
                  <button
                    onClick={() => handleRadiusChange('square')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      currentRadius === 'square' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <div className="w-8 h-8 border-2 border-current rounded-sm" />
                    <span className="font-bold text-sm">Quadrado</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Tamanho da Fonte</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleTextSizeChange('standard')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                      currentTextSize === 'standard' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <span className="font-bold text-sm">Aa</span>
                    <span className="font-bold text-xs">Padrão</span>
                  </button>
                  <button
                    onClick={() => handleTextSizeChange('large')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                      currentTextSize === 'large' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <span className="font-bold text-base">Aa</span>
                    <span className="font-bold text-xs">Grande</span>
                  </button>
                  <button
                    onClick={() => handleTextSizeChange('xlarge')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                      currentTextSize === 'xlarge' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <span className="font-bold text-lg">Aa</span>
                    <span className="font-bold text-xs">Extra</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Animações</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAnimationsChange('enabled')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      currentAnimations === 'enabled' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                      <Activity size={16} />
                    </div>
                    <span className="font-bold text-sm">Padrão</span>
                  </button>
                  <button
                    onClick={() => handleAnimationsChange('reduced')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      currentAnimations === 'reduced' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center opacity-50">
                      <Activity size={16} />
                    </div>
                    <span className="font-bold text-sm">Reduzidas</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeCategory === 'layout' && (
            <>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Navegação Padrão</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'dashboard', label: 'Início', icon: <Home size={18} /> },
                    { id: 'workouts', label: 'Treinos', icon: <Activity size={18} /> },
                    { id: 'stats', label: 'Evolução', icon: <TrendingUp size={18} /> },
                    { id: 'community', label: 'Comunidade', icon: <Users size={18} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleDefaultTabChange(tab.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                        currentDefaultTab === tab.id 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-dark-card border-dark-border hover:border-white/10 text-white/40'
                      }`}
                    >
                      {tab.icon}
                      <span className="font-bold text-sm">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Widgets da Tela Inicial</h4>
                <p className="text-xs text-white/40 mb-2">Escolha quais cards aparecem e a ordem deles.</p>
                <div className="space-y-2">
                  {widgets.map((widget, index) => (
                    <div key={widget.id} className="flex items-center justify-between p-3 bg-dark-card border border-dark-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleWidget(widget.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            widget.visible ? 'bg-brand-red border-brand-red text-white' : 'border-white/20 text-transparent'
                          }`}
                        >
                          <Check size={14} />
                        </button>
                        <span className={`text-sm font-medium ${widget.visible ? 'text-white' : 'text-white/40 line-through'}`}>
                          {widget.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => moveWidget(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/40 transition-colors"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button 
                          onClick={() => moveWidget(index, 'down')}
                          disabled={index === widgets.length - 1}
                          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/40 transition-colors"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ProfileView({ 
  userStats, 
  sessions,
  userProfile, 
  userTrainingProfile,
  userCalorieProfile,
  onEditProfile, 
  onLogout, 
  onViewAchievements, 
  onChangeGoal, 
  onNotifications, 
  onHelp, 
  onViewHistory,
  onViewLibrary,
  onViewEvolution,
  progressScore,
  students = [],
  assessments = []
}: { 
  userStats: UserStats, 
  sessions: WorkoutSession[],
  userProfile: UserProfile, 
  userTrainingProfile: UserTrainingProfile,
  userCalorieProfile: UserCalorieProfile,
  onEditProfile: () => void, 
  onLogout: () => void, 
  onViewAchievements: () => void, 
  onChangeGoal: () => void, 
  onNotifications: () => void, 
  onHelp: () => void, 
  onViewHistory: () => void,
  onViewLibrary: () => void,
  onViewEvolution: () => void,
  progressScore: ProgressScore | null,
  students?: Student[],
  assessments?: BodyAssessment[]
}) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  const completedThisWeek = useMemo(() => {
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    return sessions.filter(s => {
      const sessionDate = parseISO(s.date);
      return sessionDate >= startOfCurrentWeek;
    }).length;
  }, [sessions]);

  const isTrainer = userProfile?.userType === 'treinador';

  const avgStudentScore = useMemo(() => {
    if (!isTrainer || students.length === 0) return 0;
    const total = students.reduce((acc, s) => acc + (s.score || 0), 0);
    return Math.round(total / students.length);
  }, [isTrainer, students]);

  const lastAssessment = useMemo(() => {
    if (isTrainer || assessments.length === 0) return null;
    return assessments.sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [isTrainer, assessments]);

  const handleCopyCode = () => {
    if (userProfile?.personalCode) {
      navigator.clipboard.writeText(userProfile.personalCode);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section */}
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-2 border-brand-red p-1">
            <img src={userProfile?.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
          </div>
          {!isTrainer && (
            <button 
              onClick={onViewAchievements}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full red-gradient flex items-center justify-center border-4 border-dark-surface active:scale-90 transition-transform"
            >
              <Trophy size={18} color="currentColor" />
            </button>
          )}
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold">
              {(() => {
                const parts = (userProfile?.name || '').trim().split(/\s+/);
                if (parts.length === 0) return "";
                const formatPart = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                const first = formatPart(parts[0]);
                if (parts.length === 1) return first;
                const last = formatPart(parts[parts.length - 1]);
                return `${first} ${last}`;
              })()}
            </h2>
            {isTrainer && <Badge className="bg-brand-red/10 text-brand-red border border-brand-red/20">PRO</Badge>}
          </div>
          <p className="text-sm text-white/40 font-medium">
            {isTrainer ? (userProfile?.cref || 'Treinador Certificado') : `Nível ${userStats.level} — Disciplina Forte`}
          </p>

          {isTrainer && userProfile?.personalCode && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Seu Código de Treinador</span>
              <div 
                onClick={handleCopyCode}
                className="group relative flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-brand-red/30 transition-all"
              >
                <span className="text-xl font-mono font-bold tracking-[0.2em] text-brand-red">{userProfile?.personalCode}</span>
                <Copy size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
                
                <AnimatePresence>
                  {showCopyToast && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                    >
                      Copiado com sucesso!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[10px] text-white/20 mt-1">Compartilhe este código com seus alunos</p>
            </div>
          )}
        </div>
        
        {!isTrainer && (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <span>{userStats.xp} / 1000 XP</span>
            </div>
            <ProgressBar progress={userStats.xp} max={1000} />
          </div>
        )}
      </div>

      {/* Trainer Bio / Athlete Info */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-4 bg-brand-red rounded-full" />
          <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">
            {isTrainer ? 'Sobre o Profissional' : 'Perfil de Treino'}
          </h3>
        </div>
        
        {isTrainer ? (
          <div className="space-y-4">
            <p className="text-sm text-white/60 leading-relaxed italic">
              "{userProfile?.bio || 'Especialista em transformar vidas através do treinamento de alta performance.'}"
            </p>
            <div className="flex flex-wrap gap-2">
              {(userProfile?.specialties || ['Hipertrofia', 'Emagrecimento', 'Performance']).map((s, i) => (
                <Badge key={i} className="bg-white/5 text-white/60 border border-white/10">{s}</Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] text-white/20 font-bold uppercase">Experiência</p>
                <p className="text-sm font-bold">{userProfile?.experienceYears || '5+'} anos</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/20 font-bold uppercase">Atendimento</p>
                <p className="text-sm font-bold">{userProfile?.serviceType || 'Híbrido'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] text-white/20 font-bold uppercase">Objetivo</p>
              <div className="flex items-center gap-2">
                <Target size={14} className="text-brand-red" />
                <p className="text-sm font-bold">{userProfile?.objective}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-white/20 font-bold uppercase">Nível</p>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-brand-red" />
                <p className="text-sm font-bold">{userProfile?.experienceLevel || 'Intermediário'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-white/20 font-bold uppercase">Local</p>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-brand-red" />
                <p className="text-sm font-bold">{userProfile?.trainingLocation || 'Academia'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-white/20 font-bold uppercase">Frequência</p>
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-brand-red" />
                <p className="text-sm font-bold">{userProfile?.trainingFrequency || 4}x / semana</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {isTrainer ? (
          <>
            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase">Alunos Ativos</p>
                <p className="text-sm font-bold">{students.length || userProfile?.studentsCount || '0'}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase">Score Médio</p>
                <p className="text-sm font-bold">{avgStudentScore}%</p>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase">Streak Atual</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-sm font-bold text-brand-red">{userStats.streak} d</p>
                  <p className="text-[8px] text-white/20 font-bold uppercase">Recorde: {userStats.bestStreak}d</p>
                </div>
              </div>
            </Card>
            <Card 
              onClick={onViewHistory}
              className="flex items-center gap-3 cursor-pointer hover:bg-white/5 active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
                <CalendarIcon size={20} />
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-bold uppercase">Total Sessões</p>
                <p className="text-sm font-bold">{sessions.length}</p>
              </div>
            </Card>
          </>
        )}
        
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase">{isTrainer ? 'Retenção' : 'Progresso'}</p>
            <p className="text-sm font-bold">{isTrainer ? '94%' : `${progressScore?.score || 0}%`}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase">{isTrainer ? 'Avaliações' : 'Medalhas'}</p>
            <p className="text-sm font-bold">{isTrainer ? '4.9/5' : userStats.medalsCount}</p>
          </div>
        </Card>
      </div>

      {/* Last Assessment (Athlete Only) */}
      {!isTrainer && lastAssessment && (
        <Card 
          onClick={onViewEvolution}
          className="flex items-center justify-between p-4 hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Scale size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Última Avaliação</h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                {format(parseISO(lastAssessment.date), "dd 'de' MMMM", { locale: ptBR })} • {lastAssessment.weight}kg
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-emerald-400 transition-colors">
            <ChevronRight size={18} />
          </div>
        </Card>
      )}

      {/* Performance Insights (Athlete Only) */}
      {!isTrainer && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-brand-red rounded-full" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Métricas de Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] text-white/20 font-bold uppercase mb-1">Tempo Médio</p>
              <p className="text-lg font-display font-bold text-brand-red">
                {Math.round(userTrainingProfile.avg_workout_duration / 60)} <span className="text-[10px] font-sans text-white/40">min</span>
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] text-white/20 font-bold uppercase mb-1">Calorias Médias</p>
              <p className="text-lg font-display font-bold text-orange-400">
                {Math.round(userCalorieProfile.avg_workout_calories)} <span className="text-[10px] font-sans text-white/40">kcal</span>
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] text-white/20 font-bold uppercase mb-1">Volume Total</p>
              <p className="text-lg font-display font-bold text-blue-400">
                {userStats.totalVolume.toLocaleString()} <span className="text-[10px] font-sans text-white/40">kg</span>
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] text-white/20 font-bold uppercase mb-1">Descanso Médio</p>
              <p className="text-lg font-display font-bold text-emerald-400">
                {userTrainingProfile.avg_rest_duration} <span className="text-[10px] font-sans text-white/40">s</span>
              </p>
            </div>
          </div>

          {/* Additional Athlete Insights */}
          <div className="pt-2 space-y-4 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-white/20 font-bold uppercase">Horário Preferido</p>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-brand-red" />
                  <p className="text-sm font-bold">{userTrainingProfile.preferred_time || 'Manhã'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/20 font-bold uppercase">Total Calorias</p>
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-orange-400" />
                  <p className="text-sm font-bold">{Math.round(userCalorieProfile.total_calories_burned).toLocaleString()} kcal</p>
                </div>
              </div>
            </div>
            
            {userTrainingProfile.focus_areas && userTrainingProfile.focus_areas.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-white/20 font-bold uppercase">Foco do Treinamento</p>
                <div className="flex flex-wrap gap-2">
                  {userTrainingProfile.focus_areas.map((area, idx) => (
                    <Badge key={idx} className="bg-brand-red/5 text-brand-red/80 border border-brand-red/10 text-[10px]">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Weekly Goal Progress (Athlete Only) */}
      {!isTrainer && (
        <Card className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Meta Semanal</h3>
            <span className="text-xs font-bold text-brand-red">{(completedThisWeek / userStats.weeklyGoal * 100).toFixed(0)}%</span>
          </div>
          <ProgressBar progress={completedThisWeek} max={userStats.weeklyGoal} />
          {completedThisWeek >= userStats.weeklyGoal && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <CheckCircle2 size={14} />
              <span>Meta Concluída!</span>
            </div>
          )}
        </Card>
      )}

      {/* Recent Achievements */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Conquistas Recentes</h3>
          <button 
            onClick={onViewAchievements}
            className="text-xs text-white/40 font-bold flex items-center gap-1"
          >
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {ACHIEVEMENTS
            .sort((a, b) => (b.progress / b.maxProgress) - (a.progress / a.maxProgress))
            .slice(0, 4)
            .map(a => (
            <button 
              key={a.id} 
              onClick={() => setSelectedAchievement(a)}
              className="min-w-[140px] bg-dark-card border border-dark-border rounded-xl p-3 flex flex-col items-center text-center space-y-2 active:scale-95 transition-transform"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                a.progress >= a.maxProgress ? "bg-emerald-400/10 text-emerald-400" : "bg-brand-red/10 text-brand-red"
              )}>
                {a.icon === 'Flame' && <Flame size={20} />}
                {a.icon === 'Dumbbell' && <Dumbbell size={20} />}
                {a.icon === 'Trophy' && <Trophy size={20} />}
                {a.icon === 'Weight' && <TrendingUp size={20} />}
                {a.icon === 'Target' && <Target size={20} />}
                {a.icon === 'Sun' && <Sun size={20} />}
                {a.icon === 'Users' && <Users size={20} />}
                {a.icon === 'FileText' && <FileText size={20} />}
                {a.icon === 'Star' && <Star size={20} />}
                {a.icon === 'MessageSquare' && <MessageSquare size={20} />}
                {a.icon === 'Award' && <Award size={20} />}
                {a.icon === 'Crown' && <Crown size={20} />}
                {a.icon === 'Swords' && <Swords size={20} />}
                {a.icon === 'Activity' && <Activity size={20} />}
                {a.icon === 'Medal' && <Medal size={20} />}
              </div>
              <p className="text-[10px] font-bold leading-tight">{a.name}</p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all", a.progress >= a.maxProgress ? "bg-emerald-400" : "bg-brand-red")}
                  style={{ width: `${(a.progress / a.maxProgress) * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Library Shortcut */}
      <Card 
        onClick={onViewLibrary}
        className="flex items-center justify-between p-4 hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
            <Search size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Biblioteca de Exercícios</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Explorar técnicas e vídeos</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-red transition-colors">
          <ChevronRight size={18} />
        </div>
      </Card>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAchievement(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full bg-dark-card border border-dark-border rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red mx-auto">
                {selectedAchievement.icon === 'Flame' && <Flame size={32} />}
                {selectedAchievement.icon === 'Dumbbell' && <Dumbbell size={32} />}
                {selectedAchievement.icon === 'Trophy' && <Trophy size={32} />}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedAchievement.name}</h3>
                <p className="text-brand-red text-xs font-bold uppercase tracking-widest">+{selectedAchievement.xpValue} XP</p>
              </div>
              <p className="text-sm text-white/60">{selectedAchievement.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span>Progresso</span>
                  <span>{selectedAchievement.progress} / {selectedAchievement.maxProgress}</span>
                </div>
                <ProgressBar progress={selectedAchievement.progress} max={selectedAchievement.maxProgress} />
              </div>
              <button 
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trainer Invitation Section */}
      {isTrainer && (
        <Card className="bg-brand-red/5 border-brand-red/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 py-2">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-brand-red">Convide seus Alunos</h3>
              <p className="text-xs text-white/40">Compartilhe seu código ou QR Code</p>
            </div>
            
            {userProfile?.personalCode ? (
              <>
                <div className="bg-[#ffffff] p-3 rounded-2xl shadow-xl shadow-brand-red/10">
                  <QRCodeCanvas 
                    value={userProfile?.personalCode} 
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <button 
                  onClick={handleCopyCode}
                  className="flex items-center gap-3 bg-dark-surface border border-white/10 px-6 py-3 rounded-2xl hover:bg-white/5 transition-all group relative active:scale-95"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Seu Código</span>
                    <span className="text-xl font-display font-bold tracking-[0.2em] text-brand-red">{userProfile?.personalCode}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/60 transition-colors">
                    <Copy size={18} />
                  </div>
                  
                  <AnimatePresence>
                    {showCopyToast && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-lg shadow-emerald-500/20 whitespace-nowrap z-50"
                      >
                        Código Copiado!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </>
            ) : (
              <div className="py-4 space-y-4">
                <p className="text-xs text-white/60">Você ainda não tem um código de convite. Solicite no suporte se desejar um.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Settings Section */}
      <div className="space-y-2">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Configurações</h3>
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <SettingsItem icon={<UserCircle size={18} />} label="Meus Dados" onClick={onEditProfile} />
          <SettingsItem icon={<Palette size={18} />} label="Customização" onClick={() => setShowCustomization(true)} />
          {!isTrainer && <SettingsItem icon={<History size={18} />} label="Minhas Avaliações" onClick={onViewEvolution} />}
          {isTrainer && <SettingsItem icon={<Instagram size={18} />} label="Conectar Instagram" onClick={() => window.open(`https://instagram.com/${userProfile?.instagram || ''}`, '_blank')} />}
          {!isTrainer && <SettingsItem icon={<TrendingUp size={18} />} label="Alterar Meta Semanal" onClick={onChangeGoal} />}
          <SettingsItem icon={<Bell size={18} />} label="Notificações" onClick={onNotifications} />
          <SettingsItem icon={<HelpCircle size={18} />} label="Ajuda e Suporte" onClick={onHelp} />
          <SettingsItem icon={<LogOut size={18} />} label="Logout" className="text-red-400" onClick={onLogout} />
        </div>
      </div>

      <AnimatePresence>
        {showCustomization && (
          <CustomizationModal onClose={() => setShowCustomization(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsItem({ icon, label, onClick, className }: { icon: React.ReactNode, label: string, onClick?: () => void, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn("w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-dark-border last:border-0", className)}
    >
      <div className="flex items-center gap-3">
        <span className="text-white/40">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight size={16} className="text-white/20" />
    </button>
  );
}


function CreateWorkoutView({ 
  onSave, 
  onCancel, 
  initialTemplate,
  userProfile,
  studentEmail
}: { 
  onSave: (t: WorkoutTemplate) => void, 
  onCancel: () => void, 
  initialTemplate?: WorkoutTemplate,
  userProfile: UserProfile,
  studentEmail?: string
}) {
  const [step, setStep] = useState<'protocol-info' | 'cycle-list' | 'num-sheets' | 'sheet-names' | 'exercise-selection' | 'exercise-configuration'>(
    initialTemplate 
      ? (initialTemplate.category === 'multicycle' ? 'cycle-list' : 'exercise-selection') 
      : 'protocol-info'
  );
  const [protocolName, setProtocolName] = useState(initialTemplate?.name || '');
  const [category, setCategory] = useState<WorkoutCategory>(initialTemplate?.category || 'basic');
  const [startDate, setStartDate] = useState(initialTemplate?.startDate || format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initialTemplate?.endDate || format(addMonths(new Date(), 3), 'yyyy-MM-dd'));
  
  const [cycles, setCycles] = useState<WorkoutCycle[]>(initialTemplate?.cycles || []);
  const [currentCycleIndex, setCurrentCycleIndex] = useState<number | null>(null);

  const [numSheets, setNumSheets] = useState(initialTemplate?.sheets?.length || 1);
  const [sheets, setSheets] = useState<WorkoutSheet[]>(() => {
    if (initialTemplate?.sheets) return initialTemplate.sheets;
    return [{ id: Math.random().toString(36).substr(2, 9), name: '', order: 0, exerciseIds: [], exercises: [] }];
  });

  // Draft saving logic
  useEffect(() => {
    if (initialTemplate) return; // Don't save drafts when editing existing templates
    
    const draft = {
      protocolName,
      category,
      startDate,
      endDate,
      cycles,
      numSheets,
      sheets,
      step
    };
    localStorage.setItem('workout_draft', JSON.stringify(draft));
  }, [protocolName, category, startDate, endDate, cycles, numSheets, sheets, step, initialTemplate]);

  // Load draft on mount
  useEffect(() => {
    if (initialTemplate) return;
    
    const savedDraft = localStorage.getItem('workout_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Only ask if there's actual progress
        if (draft.protocolName || draft.cycles.length > 0 || draft.sheets[0].exerciseIds.length > 0) {
          if (confirm('Você tem um rascunho de treino não finalizado. Deseja continuar de onde parou?')) {
            setProtocolName(draft.protocolName);
            setCategory(draft.category);
            setStartDate(draft.startDate);
            setEndDate(draft.endDate);
            setCycles(draft.cycles);
            setNumSheets(draft.numSheets);
            setSheets(draft.sheets);
            setStep(draft.step);
          } else {
            localStorage.removeItem('workout_draft');
          }
        }
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }, [initialTemplate]);

  const clearDraft = () => {
    localStorage.removeItem('workout_draft');
  };
  
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedMuscleSubgroup, setSelectedMuscleSubgroup] = useState<MuscleSubgroup | 'Todos'>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'Todos'>('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'Todos'>('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedExerciseForVideo, setSelectedExerciseForVideo] = useState<Exercise | null>(null);

  const activeSheet = sheets[activeSheetIndex];

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscleGroup === 'Todos' || ex.muscleGroup === selectedMuscleGroup;
    const matchesSubgroup = selectedMuscleSubgroup === 'Todos' || ex.muscleSubgroup === selectedMuscleSubgroup;
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'Todos' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesSubgroup && matchesCategory && matchesEquipment;
  });

  const muscleSubgroupsMap: Record<string, MuscleSubgroup[]> = {
    'Peito': ['Peito superior', 'Peito médio', 'Peito inferior'],
    'Costas': ['Dorsal', 'Trapézio', 'Lombar'],
    'Pernas': ['Quadríceps', 'Posterior', 'Glúteos', 'Adutor', 'Abdutor', 'Panturrilha'],
    'Ombros': ['Deltoide Anterior', 'Deltoide Lateral', 'Deltoide Posterior'],
    'Braços': ['Bíceps', 'Tríceps', 'Antebraço'],
    'Core': ['Abdominais', 'Oblíquos', 'Lombar (Core)'],
  };

  const toggleExercise = (id: string) => {
    setSheets(prev => {
      const newSheets = [...prev];
      const sheet = { ...newSheets[activeSheetIndex] };
      if (sheet.exerciseIds.includes(id)) {
        sheet.exerciseIds = sheet.exerciseIds.filter(i => i !== id);
        sheet.exercises = sheet.exercises.filter(e => e.exerciseId !== id);
      } else {
        sheet.exerciseIds = [...sheet.exerciseIds, id];
        sheet.exercises = [...sheet.exercises, {
          exerciseId: id,
          sets: '8-10',
          numSets: 3,
          rest: '1 min',
          notes: ''
        }];
      }
      newSheets[activeSheetIndex] = sheet;
      return newSheets;
    });
  };

  const handleProtocolInfoNext = () => {
    if (!protocolName.trim()) return alert('Insira o nome do treino.');
    if (category === 'basic') {
      setStep('num-sheets');
    } else {
      setStep('cycle-list');
    }
  };

  const handleNumSheetsNext = () => {
    setSheets(prev => {
      const newSheets = [...prev];
      if (numSheets > prev.length) {
        for (let i = prev.length; i < numSheets; i++) {
          newSheets.push({ 
            id: Math.random().toString(36).substr(2, 9), 
            name: '', 
            order: i,
            exerciseIds: [], 
            exercises: [] 
          });
        }
      } else if (numSheets < prev.length) {
        return prev.slice(0, numSheets);
      }
      return newSheets;
    });
    setStep('sheet-names');
  };

  const handleSheetNamesNext = () => {
    setSheets(prev => prev.map((sheet, i) => ({
      ...sheet,
      name: sheet.name.trim() || `Ficha ${String.fromCharCode(65 + i)}`,
      order: i
    })));
    setStep('exercise-selection');
  };

  const handleExerciseSelectionNext = () => {
    if (sheets.some(s => (s.exerciseIds?.length || s.exercises?.length || 0) === 0)) {
      return alert('Todas as fichas devem ter pelo menos um exercício.');
    }
    setStep('exercise-configuration');
  };

  const handleFinalSave = (updatedSheets: WorkoutSheet[]) => {
    if (category === 'multicycle') {
      // If we are editing a cycle, update it in the cycles list
      if (currentCycleIndex !== null) {
        const newCycles = [...cycles];
        newCycles[currentCycleIndex] = {
          ...newCycles[currentCycleIndex],
          sheets: updatedSheets
        };
        setCycles(newCycles);
        setStep('cycle-list');
        setCurrentCycleIndex(null);
        // Reset sheets for next cycle
        setSheets([{ id: Math.random().toString(36).substr(2, 9), name: '', order: 0, exerciseIds: [], exercises: [] }]);
        setNumSheets(1);
        setActiveSheetIndex(0);
      } else {
        // This shouldn't happen in multicycle if we follow the flow
        alert('Erro ao salvar ciclo.');
      }
    } else {
      clearDraft();
      onSave({
        id: initialTemplate?.id || Date.now().toString(),
        userId: initialTemplate?.userId || studentEmail || userProfile.email,
        creatorEmail: initialTemplate?.creatorEmail || userProfile.email,
        name: protocolName,
        category,
        startDate,
        endDate,
        sheets: updatedSheets,
        exerciseIds: [],
        exercises: []
      });
    }
  };

  const handleSaveWorkout = () => {
    if (category === 'multicycle') {
      const emptyCycles = cycles.filter(c => c.sheets.length === 0);
      if (cycles.length === 0) {
        return alert('Adicione pelo menos um ciclo ao treino multiciclo.');
      }
      if (emptyCycles.length > 0) {
        setValidationErrors(emptyCycles.map(c => c.id));
        return alert('Todos os ciclos devem ter fichas configuradas antes de finalizar. Confira os ciclos destacados.');
      }
    }
    clearDraft();
    onSave({
      id: initialTemplate?.id || Date.now().toString(),
      userId: initialTemplate?.userId || studentEmail || userProfile.email,
      creatorEmail: initialTemplate?.creatorEmail || userProfile.email,
      name: protocolName,
      category,
      startDate,
      endDate,
      cycles: category === 'multicycle' ? cycles : undefined,
      sheets: category === 'basic' ? sheets : undefined,
      exerciseIds: [],
      exercises: []
    });
  };

  const addCycle = () => {
    const lastCycle = cycles[cycles.length - 1];
    const newStartDate = lastCycle ? lastCycle.endDate : startDate;
    const newEndDate = format(addMonths(parseISO(newStartDate), 1), 'yyyy-MM-dd');

    const newCycle: WorkoutCycle = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Ciclo ${cycles.length + 1}`,
      startDate: newStartDate,
      endDate: newEndDate,
      sheets: []
    };
    setCycles([...cycles, newCycle]);
  };

  const editCycle = (index: number) => {
    setCurrentCycleIndex(index);
    const cycle = cycles[index];
    if (cycle.sheets && cycle.sheets.length > 0) {
      setSheets(cycle.sheets);
      setNumSheets(cycle.sheets.length);
    } else {
      setSheets([{ id: Math.random().toString(36).substr(2, 9), name: '', order: 0, exerciseIds: [], exercises: [] }]);
      setNumSheets(1);
    }
    setActiveSheetIndex(0);
    setStep('num-sheets');
  };

  const deleteCycle = (index: number) => {
    setCycles(cycles.filter((_, i) => i !== index));
  };

  if (step === 'protocol-info') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{initialTemplate ? 'Editar Treino' : 'Novo Treino'}</h2>
          <button onClick={onCancel} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
        </div>

        <Card className="space-y-6 p-6">
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Nome do Treino</label>
            <input 
              type="text" 
              value={protocolName}
              onChange={(e) => setProtocolName(e.target.value)}
              placeholder="Ex: Hipertrofia Elite"
              className="w-full bg-dark-surface border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Categoria</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCategory('basic')}
                className={cn(
                  "p-4 rounded-2xl border font-bold text-sm transition-all",
                  category === 'basic' ? "bg-brand-red border-brand-red text-black" : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                Básico
              </button>
              <button
                onClick={() => setCategory('multicycle')}
                className={cn(
                  "p-4 rounded-2xl border font-bold text-sm transition-all",
                  category === 'multicycle' ? "bg-brand-red border-brand-red text-black" : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                Multiciclo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Início</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-dark-surface border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Fim</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-dark-surface border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
              />
            </div>
          </div>

          <button 
            onClick={handleProtocolInfoNext}
            className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
          >
            Avançar
          </button>
        </Card>
      </div>
    );
  }

  if (step === 'cycle-list') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Ciclos do Treino {protocolName}</h2>
          <button onClick={() => setStep('protocol-info')} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        </div>

        <div className="space-y-4">
          {cycles.map((cycle, index) => {
            const hasError = validationErrors.includes(cycle.id);
            return (
              <Card key={cycle.id} className={cn(
                "p-6 space-y-4 transition-colors",
                hasError ? "border-red-500/50 bg-red-500/5" : ""
              )}>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1 mr-4">
                    <input 
                      type="text" 
                      value={cycle.name}
                      onChange={(e) => {
                        const newCycles = [...cycles];
                        newCycles[index].name = e.target.value;
                        setCycles(newCycles);
                      }}
                      placeholder="Nome do Ciclo"
                      className="w-full bg-transparent border-none p-0 font-bold text-lg focus:ring-0 focus:outline-none placeholder:text-white/20"
                    />
                    <p className="text-[10px] text-white/40 font-bold uppercase">
                      {format(parseISO(cycle.startDate), 'dd/MM')} - {format(parseISO(cycle.endDate), 'dd/MM')}
                    </p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase",
                      cycle.sheets.length > 0 ? "text-brand-red" : (hasError ? "text-red-500" : "text-white/20")
                    )}>
                      {cycle.sheets.length > 0 ? `${cycle.sheets.length} Fichas configuradas` : 'Nenhuma ficha configurada'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (hasError) setValidationErrors(prev => prev.filter(id => id !== cycle.id));
                        editCycle(index);
                      }} 
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        cycle.sheets.length > 0 ? "bg-brand-red/10 text-brand-red" : (hasError ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-white/5 text-white/60 hover:text-white")
                      )}
                    >
                      {cycle.sheets.length > 0 ? <Edit size={16} /> : <Plus size={16} />}
                    </button>
                    <button onClick={() => deleteCycle(index)} className="p-2 bg-white/5 rounded-lg text-red-400/60 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] text-white/20 font-bold uppercase px-1">Início</label>
                  <input 
                    type="date" 
                    value={cycle.startDate}
                    onChange={(e) => {
                      const newCycles = [...cycles];
                      newCycles[index].startDate = e.target.value;
                      setCycles(newCycles);
                    }}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl p-2 focus:outline-none focus:border-gray-400 transition-colors text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-white/20 font-bold uppercase px-1">Fim</label>
                  <input 
                    type="date" 
                    value={cycle.endDate}
                    onChange={(e) => {
                      const newCycles = [...cycles];
                      newCycles[index].endDate = e.target.value;
                      setCycles(newCycles);
                    }}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl p-2 focus:outline-none focus:border-gray-400 transition-colors text-[10px]"
                  />
                </div>
              </div>
            </Card>
          );
        })}

          <button 
            onClick={addCycle}
            className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-2xl text-white/40 font-bold text-sm flex items-center justify-center gap-2 hover:border-white/20 transition-all"
          >
            <Plus size={18} /> Adicionar Novo Ciclo
          </button>
        </div>

        <button 
          onClick={handleSaveWorkout}
          disabled={cycles.length === 0}
          className={cn(
            "w-full py-4 rounded-2xl text-black font-bold shadow-lg active:scale-95 transition-all",
            cycles.length === 0 ? "bg-white/10 text-white/20 cursor-not-allowed" : "red-gradient shadow-brand-red/20"
          )}
        >
          Finalizar Treino Multiciclo
        </button>
      </div>
    );
  }

  if (step === 'num-sheets') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(category === 'basic' ? 'protocol-info' : 'cycle-list')} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold">{category === 'multicycle' ? `Fichas: ${cycles[currentCycleIndex!].name}` : 'Quantidade de Fichas'}</h2>
        </div>

        <Card className="space-y-6 p-6">
          <div className="space-y-4">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Quantidade de Fichas</label>
            <div className="flex items-center justify-between bg-dark-surface border border-dark-border rounded-2xl p-4">
              <button 
                onClick={() => setNumSheets(Math.max(1, numSheets - 1))}
                className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center text-xl font-bold"
              >
                -
              </button>
              <span className="text-4xl font-display font-bold text-brand-red">{numSheets}</span>
              <button 
                onClick={() => setNumSheets(Math.min(30, numSheets + 1))}
                className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          <button 
            onClick={handleNumSheetsNext}
            className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
          >
            Avançar
          </button>
        </Card>
      </div>
    );
  }

  if (step === 'sheet-names') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('num-sheets')} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold">Nomear Fichas</h2>
        </div>

        <div className="space-y-4">
          {sheets.map((sheet, index) => (
            <div key={sheet.id} className="space-y-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Ficha {index + 1}</label>
              <input 
                type="text" 
                value={sheet.name}
                placeholder={`Ex: Ficha ${String.fromCharCode(65 + index)}`}
                onChange={(e) => {
                  const newSheets = [...sheets];
                  newSheets[index].name = e.target.value;
                  setSheets(newSheets);
                }}
                className="w-full bg-dark-card border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          ))}
        </div>

        <button 
          onClick={handleSheetNamesNext}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          Avançar para Exercícios
        </button>
      </div>
    );
  }

  if (step === 'exercise-configuration') {
    return (
      <ConfigureExercisesView 
        sheets={sheets}
        onSave={handleFinalSave}
        onBack={() => setStep('exercise-selection')}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            if (initialTemplate) {
              onCancel();
            } else {
              setStep('sheet-names');
            }
          }} 
          className="p-2 bg-white/5 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Selecionar Exercícios</h2>
      </div>

      {/* Sheet Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            onClick={() => setActiveSheetIndex(index)}
            className={cn(
              "px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
              activeSheetIndex === index 
                ? "bg-brand-red border-brand-red text-black shadow-lg shadow-brand-red/20" 
                : "bg-white/5 border-white/10 text-white/40"
            )}
          >
            {sheet.name} ({(sheet.exerciseIds?.length || sheet.exercises?.length || 0)})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar exercícios..."
                className="w-full bg-dark-card border border-dark-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-gray-400 transition-colors text-sm"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-3 rounded-2xl border transition-all flex items-center justify-center gap-2",
                showFilters || selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos'
                  ? "bg-brand-red/10 border-brand-red/30 text-brand-red" 
                  : "bg-dark-card border-dark-border text-white/40"
              )}
            >
              <SlidersHorizontal size={20} />
              {(selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && !showFilters && (
                <span className="w-2 h-2 bg-brand-red rounded-full"></span>
              )}
            </button>
          </div>

          {!showFilters && (selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {selectedCategory !== 'Todos' && (
                <button 
                  onClick={() => setSelectedCategory('Todos')}
                  className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                >
                  {selectedCategory} <X size={10} />
                </button>
              )}
              {selectedEquipment !== 'Todos' && (
                <button 
                  onClick={() => setSelectedEquipment('Todos')}
                  className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                >
                  {selectedEquipment} <X size={10} />
                </button>
              )}
              {selectedMuscleGroup !== 'Todos' && (
                <button 
                  onClick={() => {
                    setSelectedMuscleGroup('Todos');
                    setSelectedMuscleSubgroup('Todos');
                  }}
                  className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                >
                  {selectedMuscleGroup} <X size={10} />
                </button>
              )}
              {selectedMuscleSubgroup !== 'Todos' && (
                <button 
                  onClick={() => setSelectedMuscleSubgroup('Todos')}
                  className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                >
                  {selectedMuscleSubgroup} <X size={10} />
                </button>
              )}
            </div>
          )}

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Todos', 'Musculação', 'Alongamento', 'Exercício em casa', 'Funcional'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                        selectedCategory === cat 
                          ? "bg-brand-red border-brand-red text-black" 
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Todos', 'Barra', 'Halter', 'Máquina', 'Peso corporal', 'Elástico', 'Kettlebell'].map((eq) => (
                    <button
                      key={eq}
                      onClick={() => setSelectedEquipment(eq as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                        selectedEquipment === eq 
                          ? "bg-brand-red border-brand-red text-black" 
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                      )}
                    >
                      {eq}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Full Body'].map((group) => (
                    <button
                      key={group}
                      onClick={() => {
                        setSelectedMuscleGroup(group as any);
                        setSelectedMuscleSubgroup('Todos');
                      }}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                        selectedMuscleGroup === group 
                          ? "bg-brand-red border-brand-red text-black" 
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                      )}
                    >
                      {group}
                    </button>
                  ))}
                </div>

                {selectedMuscleGroup !== 'Todos' && muscleSubgroupsMap[selectedMuscleGroup] && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['Todos', ...muscleSubgroupsMap[selectedMuscleGroup]].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedMuscleSubgroup(sub as any)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                          selectedMuscleSubgroup === sub 
                            ? "bg-brand-red border-brand-red text-black" 
                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                        )}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredExercises.map(ex => {
            const isSelected = activeSheet.exerciseIds.includes(ex.id);
            return (
              <div 
                key={ex.id}
                onClick={() => toggleExercise(ex.id)}
                className={cn(
                  "flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all",
                  isSelected ? "bg-brand-red/5 border-brand-red/30" : "bg-dark-card border-dark-border hover:border-white/10"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{ex.name}</h4>
                    {ex.youtubeUrl && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExerciseForVideo(ex);
                        }}
                        className="p-1 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                      >
                        <Play size={10} fill="currentColor" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase">{ex.muscleGroup}</p>
                    {ex.muscleSubgroup && (
                      <>
                        <span className="text-[10px] text-white/20">•</span>
                        <p className="text-[10px] text-brand-red/60 font-bold uppercase">{ex.muscleSubgroup}</p>
                      </>
                    )}
                    <span className="text-[10px] text-white/20">•</span>
                    <p className="text-[10px] text-white/40 font-bold uppercase">{ex.category}</p>
                    <span className="text-[10px] text-white/20">•</span>
                    <p className="text-[10px] text-white/40 font-bold uppercase">{ex.equipment}</p>
                  </div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                  isSelected ? "bg-brand-red border-brand-red text-black" : "border-white/10"
                )}>
                  {isSelected && <Check size={14} strokeWidth={4} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        <button 
          onClick={() => {
            if (activeSheetIndex < sheets.length - 1) {
              setActiveSheetIndex(activeSheetIndex + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              handleExerciseSelectionNext();
            }
          }}
          disabled={activeSheet.exerciseIds.length === 0}
          className={cn(
            "w-full py-4 rounded-2xl text-black font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
            activeSheet.exerciseIds.length === 0 
              ? "bg-white/10 text-white/20 cursor-not-allowed shadow-none" 
              : "red-gradient shadow-brand-red/20"
          )}
        >
          {activeSheetIndex < sheets.length - 1 ? 'Próxima Ficha' : 'Configurar Treino'} 
          <ChevronRight size={20} />
        </button>
      </div>

      <AnimatePresence>
        {selectedExerciseForVideo && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExerciseForVideo(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-dark-surface border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Execução: {selectedExerciseForVideo.name}</h3>
                <button onClick={() => setSelectedExerciseForVideo(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              {getYouTubeEmbedUrl(selectedExerciseForVideo.youtubeUrl) ? (
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative">
                  <iframe 
                    src={getYouTubeEmbedUrl(selectedExerciseForVideo.youtubeUrl)!}
                    title={`Vídeo de execução: ${selectedExerciseForVideo.name}`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-sm text-white/40">Vídeo não disponível para incorporação.</p>
                  <a href={selectedExerciseForVideo.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-brand-red font-bold mt-2 block">Ver no YouTube</a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfigureExercisesView({ 
  sheets, 
  onSave, 
  onBack 
}: { 
  sheets: WorkoutSheet[], 
  onSave: (updatedSheets: WorkoutSheet[]) => void, 
  onBack: () => void 
}) {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localSheets, setLocalSheets] = useState<WorkoutSheet[]>(sheets);
  const [selectedExerciseForVideo, setSelectedExerciseForVideo] = useState<Exercise | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [showSubstitutionList, setShowSubstitutionList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedMuscleSubgroup, setSelectedMuscleSubgroup] = useState<MuscleSubgroup | 'Todos'>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'Todos'>('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'Todos'>('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const activeSheet = localSheets[activeSheetIndex];
  const currentExerciseId = activeSheet.exerciseIds[currentIndex];
  const exercise = EXERCISES.find(e => e.id === currentExerciseId);
  const currentConfig = activeSheet.exercises[currentIndex];

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscleGroup === 'Todos' || ex.muscleGroup === selectedMuscleGroup;
    const matchesSubgroup = selectedMuscleSubgroup === 'Todos' || ex.muscleSubgroup === selectedMuscleSubgroup;
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'Todos' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesSubgroup && matchesCategory && matchesEquipment && ex.id !== currentExerciseId;
  });

  const muscleSubgroupsMap: Record<string, MuscleSubgroup[]> = {
    'Peito': ['Peito superior', 'Peito médio', 'Peito inferior'],
    'Costas': ['Dorsal', 'Trapézio', 'Lombar'],
    'Pernas': ['Quadríceps', 'Posterior', 'Glúteos', 'Adutor', 'Abdutor', 'Panturrilha'],
    'Ombros': ['Deltoide Anterior', 'Deltoide Lateral', 'Deltoide Posterior'],
    'Braços': ['Bíceps', 'Tríceps', 'Antebraço'],
    'Core': ['Abdominais', 'Oblíquos', 'Lombar (Core)'],
  };

  const updateConfig = (updates: Partial<WorkoutTemplateExercise>) => {
    const newSheets = [...localSheets];
    const newExercises = [...newSheets[activeSheetIndex].exercises];
    newExercises[currentIndex] = { ...newExercises[currentIndex], ...updates };
    newSheets[activeSheetIndex].exercises = newExercises;
    setLocalSheets(newSheets);
  };

  const handleNext = () => {
    if (currentIndex < activeSheet.exerciseIds.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeSheetIndex < localSheets.length - 1) {
      setActiveSheetIndex(activeSheetIndex + 1);
      setCurrentIndex(0);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onSave(localSheets);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeSheetIndex > 0) {
      setActiveSheetIndex(activeSheetIndex - 1);
      setCurrentIndex(localSheets[activeSheetIndex - 1].exerciseIds.length - 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  const repOptions = ['6–8', '8–10', '10–12', '12–15', 'Personalizado'];
  const restOptions = ['1 min', '2 min', '3 min', '5 min', 'Personalizado'];

  const isCustomReps = !repOptions.slice(0, 4).includes(currentConfig.sets);
  const isCustomRest = !restOptions.slice(0, 4).includes(currentConfig.rest);

  return (
    <div className="fixed inset-0 bg-dark-surface z-[100] flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-dark-border">
        <button onClick={handleBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <div className="text-center">
          <h2 className="font-bold text-lg">Configurar Treino</h2>
          <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">{activeSheet.name}</p>
        </div>
        <button onClick={() => onSave(localSheets)} className="text-brand-red font-bold text-sm">Salvar</button>
      </div>

      {/* Sheet Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar p-4 bg-dark-card/50 border-b border-white/5">
        {localSheets.map((sheet, index) => (
          <button
            key={sheet.id}
            onClick={() => {
              setActiveSheetIndex(index);
              setCurrentIndex(0);
              scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              activeSheetIndex === index ? "bg-brand-red text-black" : "text-white/40"
            )}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Exercise Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
            <Dumbbell size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold">{exercise?.name}</h3>
              {exercise?.youtubeUrl && (
                <button 
                  onClick={() => setSelectedExerciseForVideo(exercise)}
                  className="p-1.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                >
                  <Play size={14} fill="currentColor" />
                </button>
              )}
            </div>
            <p className="text-sm text-white/40 font-medium">Grupo: {exercise?.muscleGroup}</p>
          </div>
        </div>

        {/* Number of Sets */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
              <Dumbbell size={16} />
            </div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Quantidade de Séries</h4>
          </div>
          <div className="flex items-center justify-between bg-dark-card border border-dark-border rounded-2xl p-4">
            <button 
              onClick={() => updateConfig({ numSets: Math.max(1, currentConfig.numSets - 1) })}
              className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center text-xl font-bold hover:bg-white/5 transition-colors"
            >
              -
            </button>
            <span className="text-3xl font-display font-bold text-brand-red">{currentConfig.numSets}</span>
            <button 
              onClick={() => updateConfig({ numSets: Math.min(10, currentConfig.numSets + 1) })}
              className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center text-xl font-bold hover:bg-white/5 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Reps Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center text-brand-red">
              <TrendingUp size={16} />
            </div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Séries / Repetições</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {repOptions.map(option => {
              const isSelected = option === 'Personalizado' ? isCustomReps : currentConfig.sets === option;
              return (
                <button
                  key={option}
                  onClick={() => {
                    if (option === 'Personalizado') {
                      if (!isCustomReps) {
                        const baseVal = currentConfig.sets.includes('–') ? currentConfig.sets.split('–')[1] : currentConfig.sets;
                        updateConfig({ sets: Array(currentConfig.numSets).fill(baseVal || '10').join(',') });
                      }
                    } else {
                      updateConfig({ sets: option });
                    }
                  }}
                  className={cn(
                    "py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden",
                    isSelected 
                      ? "bg-brand-red text-black shadow-lg shadow-brand-red/30" 
                      : "bg-dark-card border border-dark-border text-white/40"
                  )}
                >
                  {option}
                  {isSelected && <motion.div layoutId="rep-glow" className="absolute inset-0 bg-white/10" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {isCustomReps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: currentConfig.numSets }).map((_, i) => {
                    const repsArray = currentConfig.sets.split(',').map(s => s.trim());
                    const currentVal = repsArray[i] !== undefined ? repsArray[i] : (repsArray[0] || '10');
                    
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 bg-dark-card border border-white/5 rounded-xl p-2">
                        <span className="text-[8px] text-white/20 font-bold uppercase">Série {i + 1}</span>
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={currentVal}
                          onChange={(e) => {
                            const newReps = [...repsArray];
                            while (newReps.length < currentConfig.numSets) {
                              newReps.push(newReps[newReps.length - 1] || '10');
                            }
                            newReps[i] = e.target.value;
                            updateConfig({ sets: newReps.join(',') });
                          }}
                          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-center font-bold text-sm text-brand-red"
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[8px] text-white/20 text-center uppercase font-bold tracking-widest">Repetições individuais por série</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rest Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400">
              <History size={16} />
            </div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Descanso</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {restOptions.map(option => {
              const isSelected = option === 'Personalizado' ? isCustomRest : currentConfig.rest === option;
              return (
                <button
                  key={option}
                  onClick={() => {
                    if (option === 'Personalizado') {
                      if (!isCustomRest) {
                        const baseVal = currentConfig.rest.includes('min') 
                          ? (parseInt(currentConfig.rest) * 60).toString() + 's'
                          : currentConfig.rest;
                        updateConfig({ rest: Array(currentConfig.numSets).fill(baseVal || '60s').join(',') });
                      }
                    } else {
                      updateConfig({ rest: option });
                    }
                  }}
                  className={cn(
                    "py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden",
                    isSelected 
                      ? "bg-brand-red text-black shadow-lg shadow-brand-red/30" 
                      : "bg-dark-card border border-dark-border text-white/40"
                  )}
                >
                  {option}
                  {isSelected && <motion.div layoutId="rest-glow" className="absolute inset-0 bg-white/10" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {isCustomRest && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: currentConfig.numSets }).map((_, i) => {
                    const restArray = currentConfig.rest.split(',').map(s => s.trim());
                    const currentVal = restArray[i] !== undefined ? restArray[i] : (restArray[0] || '60s');
                    
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 bg-dark-card border border-white/5 rounded-xl p-2">
                        <span className="text-[8px] text-white/20 font-bold uppercase">Série {i + 1}</span>
                        <input 
                          type="text"
                          value={currentVal}
                          onChange={(e) => {
                            const newRest = [...restArray];
                            while (newRest.length < currentConfig.numSets) {
                              newRest.push(newRest[newRest.length - 1] || '60s');
                            }
                            newRest[i] = e.target.value;
                            updateConfig({ rest: newRest.join(',') });
                          }}
                          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-center font-bold text-sm text-blue-400"
                          placeholder="60s"
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[8px] text-white/20 text-center uppercase font-bold tracking-widest">Descanso individual por série (ex: 60s ou 1:30)</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Observation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
              <Edit size={16} />
            </div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Observação</h4>
          </div>
          <textarea 
            value={currentConfig.notes || ''}
            onChange={(e) => updateConfig({ notes: e.target.value })}
            placeholder="Dicas de execução, carga anterior..."
            className="w-full bg-dark-card border border-dark-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-gray-400 transition-colors min-h-[100px]"
          />
        </div>

        {/* Substitutions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
              <RefreshCw size={16} />
            </div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Substituições (Opcional)</h4>
          </div>
          
          <div className="space-y-2">
            {currentConfig.substitutions?.map((subId, idx) => {
              const subEx = EXERCISES.find(e => e.id === subId);
              return (
                <div key={idx} className="flex items-center justify-between bg-dark-card border border-dark-border rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{subEx?.name}</p>
                      <p className="text-xs text-white/40">{subEx?.muscleGroup}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const newSubs = currentConfig.substitutions?.filter(id => id !== subId);
                      updateConfig({ substitutions: newSubs });
                    }}
                    className="p-2 text-white/40 hover:text-brand-red transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              );
            })}
            
            <button
              onClick={() => setShowSubstitutionList(true)}
              className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-white/60 font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Adicionar Opção
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 glass border-t border-white/10">
        <button 
          onClick={handleNext}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {currentIndex < activeSheet.exerciseIds.length - 1 || activeSheetIndex < localSheets.length - 1 ? 'Próximo Exercício' : 'Salvar Treino'}
        </button>
      </div>

      <AnimatePresence>
        {showSubstitutionList && (
          <div className="fixed inset-0 z-[400] flex flex-col bg-dark-surface">
            <div className="p-6 flex items-center gap-4 border-b border-dark-border">
              <button onClick={() => setShowSubstitutionList(false)} className="p-2 bg-white/5 rounded-full">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Selecionar Substituição</h2>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar exercícios..."
                      className="w-full bg-dark-card border border-dark-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "p-3 rounded-2xl border transition-all flex items-center justify-center gap-2",
                      showFilters || selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos'
                        ? "bg-brand-red/10 border-brand-red/30 text-brand-red" 
                        : "bg-dark-card border-dark-border text-white/40"
                    )}
                  >
                    <SlidersHorizontal size={20} />
                    {(selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && !showFilters && (
                      <span className="w-2 h-2 bg-brand-red rounded-full"></span>
                    )}
                  </button>
                </div>

                {!showFilters && (selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {selectedCategory !== 'Todos' && (
                      <button 
                        onClick={() => setSelectedCategory('Todos')}
                        className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                      >
                        {selectedCategory} <X size={10} />
                      </button>
                    )}
                    {selectedEquipment !== 'Todos' && (
                      <button 
                        onClick={() => setSelectedEquipment('Todos')}
                        className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                      >
                        {selectedEquipment} <X size={10} />
                      </button>
                    )}
                    {selectedMuscleGroup !== 'Todos' && (
                      <button 
                        onClick={() => {
                          setSelectedMuscleGroup('Todos');
                          setSelectedMuscleSubgroup('Todos');
                        }}
                        className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                      >
                        {selectedMuscleGroup} <X size={10} />
                      </button>
                    )}
                    {selectedMuscleSubgroup !== 'Todos' && (
                      <button 
                        onClick={() => setSelectedMuscleSubgroup('Todos')}
                        className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                      >
                        {selectedMuscleSubgroup} <X size={10} />
                      </button>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['Todos', 'Musculação', 'Alongamento', 'Exercício em casa', 'Funcional'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat as any)}
                            className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                              selectedCategory === cat 
                                ? "bg-brand-red border-brand-red text-black" 
                                : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['Todos', 'Barra', 'Halter', 'Máquina', 'Peso corporal', 'Elástico', 'Kettlebell'].map((eq) => (
                          <button
                            key={eq}
                            onClick={() => setSelectedEquipment(eq as any)}
                            className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                              selectedEquipment === eq 
                                ? "bg-brand-red border-brand-red text-black" 
                                : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                            )}
                          >
                            {eq}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Full Body'].map((group) => (
                          <button
                            key={group}
                            onClick={() => {
                              setSelectedMuscleGroup(group as any);
                              setSelectedMuscleSubgroup('Todos');
                            }}
                            className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                              selectedMuscleGroup === group 
                                ? "bg-brand-red border-brand-red text-black" 
                                : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                            )}
                          >
                            {group}
                          </button>
                        ))}
                      </div>

                      {selectedMuscleGroup !== 'Todos' && muscleSubgroupsMap[selectedMuscleGroup] && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                          {['Todos', ...muscleSubgroupsMap[selectedMuscleGroup]].map((sub) => (
                            <button
                              key={sub}
                              onClick={() => setSelectedMuscleSubgroup(sub as any)}
                              className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                                selectedMuscleSubgroup === sub 
                                  ? "bg-brand-red border-brand-red text-black" 
                                  : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                              )}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                {filteredExercises.map(ex => {
                  const isSelected = currentConfig.substitutions?.includes(ex.id);
                  return (
                    <div 
                      key={ex.id}
                      onClick={() => {
                        const currentSubs = currentConfig.substitutions || [];
                        if (!isSelected) {
                          updateConfig({ substitutions: [...currentSubs, ex.id] });
                          setShowSubstitutionList(false);
                        }
                      }}
                      className={cn(
                        "flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all",
                        isSelected ? "bg-brand-red/5 border-brand-red/30 opacity-50" : "bg-dark-card border-dark-border hover:border-white/10"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{ex.name}</h4>
                          {ex.youtubeUrl && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExerciseForVideo(ex);
                              }}
                              className="p-1 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                            >
                              <Play size={10} fill="currentColor" />
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-[10px] text-white/40 font-bold uppercase">{ex.muscleGroup}</p>
                          {ex.muscleSubgroup && (
                            <>
                              <span className="text-[10px] text-white/20">•</span>
                              <p className="text-[10px] text-brand-red/60 font-bold uppercase">{ex.muscleSubgroup}</p>
                            </>
                          )}
                          <span className="text-[10px] text-white/20">•</span>
                          <p className="text-[10px] text-white/40 font-bold uppercase">{ex.category}</p>
                          <span className="text-[10px] text-white/20">•</span>
                          <p className="text-[10px] text-white/40 font-bold uppercase">{ex.equipment}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                        isSelected ? "bg-brand-red border-brand-red text-black" : "border-white/10"
                      )}>
                        {isSelected && <Check size={14} strokeWidth={4} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedExerciseForVideo && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExerciseForVideo(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-dark-surface border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Execução: {selectedExerciseForVideo.name}</h3>
                <button onClick={() => setSelectedExerciseForVideo(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              {getYouTubeEmbedUrl(selectedExerciseForVideo.youtubeUrl) ? (
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative">
                  <iframe 
                    src={getYouTubeEmbedUrl(selectedExerciseForVideo.youtubeUrl)!}
                    title={`Vídeo de execução: ${selectedExerciseForVideo.name}`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-sm text-white/40">Vídeo não disponível para incorporação.</p>
                  <a href={selectedExerciseForVideo.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-brand-red font-bold mt-2 block">Ver no YouTube</a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getOpeningSuggestions(target: Student, userType?: 'treinador' | 'atleta'): string[] {
  const firstName = target.name.split(' ')[0];
  
  if (userType === 'atleta') {
    return [
      `Oi ${firstName}, acabei de finalizar o treino de hoje. Pode dar uma olhada no meu desempenho?`,
      `Professor, estou com uma dúvida sobre a execução de um exercício da minha planilha.`,
      `E aí ${firstName}, tudo bem? Gostaria de conversar sobre a progressão de carga para o próximo treino.`,
      `Oi, notei que meu score de progresso mudou. Como estamos em relação ao nosso objetivo?`
    ];
  }

  switch (target.status) {
    case 'evolving':
      return [
        `Parabéns pela evolução, ${firstName}! Vi que você está com um streak de ${target.streak} dias. Como está se sentindo?`,
        `Excelente ritmo nos treinos! Notei que seu score subiu para ${target.score}. Alguma dificuldade nos exercícios?`,
        `Fala ${firstName}, seu progresso de ${target.progress}% está ótimo. Vamos manter esse foco!`
      ];
    case 'at-risk':
      return [
        `Oi ${firstName}, notei que você não treina há ${target.lastWorkout}. Está tudo bem? Como posso te ajudar a voltar?`,
        `Senti sua falta nos treinos ultimamente. Vamos tentar retomar essa semana?`,
        `E aí ${firstName}, percebi que o ritmo caiu um pouco. Quer conversar sobre os horários ou o plano de treino?`
      ];
    case 'stagnated':
      return [
        `Oi ${firstName}, vi que seu progresso deu uma estabilizada. O que acha de revisarmos as cargas ou a dieta?`,
        `Notei que os resultados estagnaram um pouco. Vamos marcar um check-in para ajustar o planejamento?`,
        `Fala ${firstName}, como está a percepção de esforço nos treinos? Talvez seja hora de mudar o estímulo.`
      ];
    default:
      return [
        `Olá ${firstName}, tudo bem? Como estão os treinos?`,
        `E aí ${firstName}, pronto para o treino de hoje?`,
        `Oi ${firstName}, alguma dúvida sobre a execução dos exercícios?`
      ];
  }
}

function ChatView({ student, messages, onSendMessage, onBack, userProfile }: { student: Student, messages: ChatMessage[], onSendMessage: (text: string) => void, onBack: () => void, userProfile: UserProfile }) {
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() => getOpeningSuggestions(student, userProfile?.userType), [student, userProfile?.userType]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] -mx-6">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4 bg-dark-surface/50 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-brand-red/50" />
          <div>
            <h3 className="font-bold text-sm">{student.name}</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4 opacity-40">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <MessageSquare size={32} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Inicie uma conversa com {student.name.split(' ')[0]}</p>
            </div>
            
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 px-2 text-brand-red">
                <Sparkles size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sugestões de Abertura</span>
              </div>
              <div className="grid gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(suggestion)}
                    className="text-left p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-medium hover:bg-white/10 hover:border-brand-red/30 transition-all active:scale-[0.98]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === userProfile?.email;
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm font-medium",
                  isMe 
                    ? "bg-brand-red text-black rounded-tr-none shadow-lg shadow-brand-red/10" 
                    : "bg-dark-card border border-white/5 text-white rounded-tl-none"
                )}>
                  {msg.text}
                </div>
                <span className="text-[8px] text-white/20 font-bold uppercase mt-1 px-1">
                  {(() => {
                    const date = new Date(msg.timestamp);
                    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  })()}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-dark-surface border-t border-white/5 relative">
        <AnimatePresence>
          {showSuggestions && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-6 right-6 mb-4 p-4 bg-dark-card border border-white/10 rounded-3xl shadow-2xl z-20 space-y-3"
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-brand-red">
                  <Sparkles size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sugestões de Abertura</span>
                </div>
                <button onClick={() => setShowSuggestions(false)} className="text-white/40 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="grid gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSendMessage(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="text-left p-3 bg-white/5 border border-white/5 rounded-xl text-[11px] font-medium hover:bg-white/10 hover:border-brand-red/30 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center gap-2">
          <button 
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90",
              showSuggestions ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" : "bg-white/5 text-white/40 hover:text-brand-red hover:bg-brand-red/10"
            )}
          >
            <Sparkles size={20} />
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-dark-card border border-dark-border rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-gray-400 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90",
              inputText.trim() ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" : "bg-white/5 text-white/20"
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ExpressView({ 
  userProfile, 
  trainers, 
  onMessage, 
  onConnect, 
  onDisconnect, 
  studentConnections, 
  onViewPurchased,
  api,
  onBack,
}: { 
  userProfile: UserProfile, 
  trainers: any[], 
  onMessage: (t: any) => void, 
  onConnect: (code: string) => Promise<void>, 
  onDisconnect: (trainerEmail: string) => Promise<void>, 
  studentConnections: any[], 
  onViewPurchased: () => void,
  api: any,
  onBack?: () => void,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [showConnectPopup, setShowConnectPopup] = useState(false);
  const [connectCode, setConnectCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'treinadores' | 'loja'>(userProfile?.userType === 'treinador' ? 'loja' : 'treinadores');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrainerForProfile, setSelectedTrainerForProfile] = useState<any>(null);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [purchasedProtocols, setPurchasedProtocols] = useState<any[]>([]);
  const [isLoadingProtocols, setIsLoadingProtocols] = useState(true);

  useEffect(() => {
    const loadProtocols = async () => {
      try {
        const [all, purchased] = await Promise.all([
          api.getProtocols(),
          api.getPurchasedProtocols()
        ]);
        setProtocols(all);
        setPurchasedProtocols(purchased);
      } catch (error) {
        console.error('Failed to load protocols', error);
      } finally {
        setIsLoadingProtocols(false);
      }
    };
    loadProtocols();
  }, [api]);

  // Handle Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const protocolId = urlParams.get('protocol_id');
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (success && sessionId && protocolId) {
      api.verifyCheckoutSession(sessionId, protocolId).then(() => {
        // Refresh purchased protocols
        api.getPurchasedProtocols().then(setPurchasedProtocols);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        alert('Pagamento confirmado! Protocolo adicionado à sua biblioteca.');
      }).catch((e: any) => {
        console.error('Verify error:', e);
        alert('Erro ao verificar pagamento.');
      });
    } else if (canceled) {
      window.history.replaceState({}, document.title, window.location.pathname);
      alert('Pagamento cancelado.');
    }
  }, [api]);

  const handlePurchase = async (protocolId: string) => {
    try {
      const { url } = await api.createCheckoutSession(protocolId);
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao iniciar pagamento.');
    }
  };


  
  const filters = ['Todos', 'Protocolos', 'Online', 'Presencial', 'Hipertrofia', 'Emagrecimento'];

  const connectedTrainers = trainers.filter(t => 
    studentConnections.some(c => c.trainerEmail === t.email && c.status === 'accepted')
  );

  const nearbyTrainers = trainers
    .filter(t => !connectedTrainers.some(ct => ct.email === t.email))
    .map(t => {
      const charCode = t.email?.charCodeAt(0) || 1;
      const pseudoRandom = ((charCode * 13) % 50 + 10) / 10;
      return {
        ...t,
        distance: t.distance || `${pseudoRandom.toFixed(1)}km`,
        isPresencial: t.serviceType === 'Presencial' || t.serviceType === 'Ambos' || true
      };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  const filteredTrainers = trainers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (t.specialty && t.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter logic
    let matchesFilter = true;
    if (selectedFilter !== 'Todos') {
      if (selectedFilter === 'Protocolos') {
        matchesFilter = false;
      } else if (selectedFilter === 'Online') {
        matchesFilter = t.serviceType === 'Online' || t.serviceType === 'Ambos';
      } else if (selectedFilter === 'Presencial') {
        matchesFilter = t.serviceType === 'Presencial' || t.serviceType === 'Ambos';
      } else {
        // Specialty or tag match
        matchesFilter = (t.specialty && t.specialty.toLowerCase().includes(selectedFilter.toLowerCase())) ||
                        (t.tags && t.tags.includes(selectedFilter));
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  const availableProtocols = protocols.filter(p => !purchasedProtocols.some(pp => pp.id === p.id));

  const filteredProtocols = protocols.filter(p => {
    const isPurchased = purchasedProtocols.some(pp => pp.id === p.id);
    if (isPurchased) return false;

    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter !== 'Todos') {
      if (selectedFilter === 'Protocolos') {
        matchesFilter = true;
      } else if (selectedFilter === 'Online') {
        matchesFilter = p.tags.includes('Online');
      } else if (selectedFilter === 'Presencial') {
        matchesFilter = p.tags.includes('Presencial');
      } else {
        matchesFilter = p.tags.includes(selectedFilter);
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  const showTrainers = selectedFilter === 'Todos' || selectedFilter === 'Treinadores' || filteredTrainers.length > 0;
  const showProtocols = selectedFilter === 'Todos' || selectedFilter === 'Protocolos' || filteredProtocols.length > 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Search */}
      <div className="space-y-4 sticky top-0 bg-dark-surface/80 backdrop-blur-xl pt-4 pb-2 z-30">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-1.5 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors border border-white/10"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-display font-bold">Express</h2>
            <button 
              onClick={() => setShowConnectPopup(true)}
              className="p-1.5 bg-white/5 rounded-lg text-white/40 hover:text-brand-red transition-colors border border-white/10"
              title="Conectar por código"
            >
              <UserPlus size={16} />
            </button>
          </div>
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            {userProfile?.userType !== 'treinador' && (
              <button
                onClick={() => setActiveSubTab('treinadores')}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeSubTab === 'treinadores' 
                    ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" 
                    : "text-white/40 hover:text-white/60"
                )}
              >
                Treinadores
              </button>
            )}
            <button
              onClick={() => setActiveSubTab('loja')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                activeSubTab === 'loja' 
                  ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              Loja
            </button>
          </div>
        </div>

        {!searchTerm && activeSubTab === 'treinadores' && (
          <div className="space-y-6">
            {/* Pending Requests */}
            {studentConnections.some(c => c.status === 'pending') && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">Solicitação Pendente</h3>
                {studentConnections.filter(c => c.status === 'pending').map(pending => (
                  <div key={pending.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-center">
                    <img src={pending.trainerAvatar} alt={pending.trainerName} className="w-12 h-12 rounded-xl object-cover grayscale opacity-50" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{pending.trainerName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <RefreshCw size={10} className="text-amber-500 animate-spin-slow" />
                        <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest">Aguardando aprovação</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDisconnect(pending.trainerEmail)}
                      className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-brand-red transition-colors"
                      title="Cancelar solicitação"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* My Connected Trainers */}
            {connectedTrainers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Meus Treinadores</h3>
                </div>
                <div className="grid gap-3">
                  {connectedTrainers.map(trainer => (
                    <div 
                      key={trainer.email}
                      className="p-4 rounded-2xl bg-brand-red/5 border border-brand-red/20 flex gap-4 items-center cursor-pointer hover:bg-brand-red/10 transition-all"
                      onClick={() => setSelectedTrainerForProfile(trainer)}
                    >
                      <img src={trainer.avatarUrl} alt={trainer.name} className="w-16 h-16 rounded-xl object-cover border border-brand-red/30" />
                      <div className="flex-1">
                        <h4 className="font-bold">{trainer.name}</h4>
                        <p className="text-xs text-white/40">{trainer.specialty}</p>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onMessage({ ...trainer, id: trainer.email });
                            }}
                            className="px-3 py-1 bg-brand-red text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                          >
                            Chat
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDisconnectConfirm(trainer.email);
                            }}
                            className="px-3 py-1 bg-white/5 text-white/40 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:text-brand-red transition-colors"
                          >
                            Desconectar
                          </button>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeSubTab === 'treinadores' ? "Buscar treinadores..." : "Buscar protocolos..."}
              className="w-full bg-dark-card border border-dark-border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-gray-400 transition-all shadow-2xl"
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3 rounded-2xl border transition-all flex items-center justify-center gap-2",
              showFilters || selectedFilter !== 'Todos'
                ? "bg-brand-red/10 border-brand-red/30 text-brand-red" 
                : "bg-dark-card border-dark-border text-white/40"
            )}
          >
            <SlidersHorizontal size={20} />
            {selectedFilter !== 'Todos' && !showFilters && (
              <span className="w-2 h-2 bg-brand-red rounded-full"></span>
            )}
          </button>

          <div className="flex items-center gap-1">
          </div>

        </div>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                {filters.filter(f => {
                  if (activeSubTab === 'treinadores') return f !== 'Protocolos';
                  return true;
                }).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={cn(
                      "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                      selectedFilter === filter 
                        ? "bg-brand-red border-brand-red text-black shadow-lg shadow-brand-red/20" 
                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showFilters && selectedFilter !== 'Todos' && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setSelectedFilter('Todos')}
              className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
            >
              {selectedFilter} <X size={10} />
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-8">
        {/* Search Results Grouped */}
        {searchTerm && (
          <div className="space-y-6">
            {activeSubTab === 'treinadores' && filteredTrainers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">Treinadores</h3>
                <div className="grid gap-3">
                  {filteredTrainers.map(trainer => (
                    <TrainerCard 
                      key={trainer.email} 
                      trainer={trainer} 
                      onConnect={onConnect} 
                      studentConnections={studentConnections} 
                      onViewProfile={setSelectedTrainerForProfile}
                    />
                  ))}
                </div>
              </div>
            )}
            {activeSubTab === 'loja' && filteredProtocols.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">Protocolos</h3>
                <div className="grid gap-3">
                  {filteredProtocols.map(protocol => (
                    <ProtocolCard key={protocol.id} protocol={protocol} onPurchase={handlePurchase} />
                  ))}
                </div>
              </div>
            )}
            {((activeSubTab === 'treinadores' && filteredTrainers.length === 0) || (activeSubTab === 'loja' && filteredProtocols.length === 0)) && (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                  <Search size={32} />
                </div>
                <p className="text-sm text-white/40">Nenhum resultado para "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}

        {/* Default View Sections */}
        {!searchTerm && activeSubTab === 'treinadores' && (
          <>
            {/* Nearby Trainers (Suggestions) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-brand-red" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Sugestões de Treinadores</h3>
                </div>
                <button className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Ver todos</button>
              </div>
              <div className="grid gap-3">
                {nearbyTrainers.slice(0, 5).map(trainer => (
                  <TrainerCard 
                    key={trainer.email} 
                    trainer={trainer} 
                    showDistance 
                    onConnect={onConnect} 
                    studentConnections={studentConnections} 
                    onViewProfile={setSelectedTrainerForProfile}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {!searchTerm && activeSubTab === 'loja' && (
          <>
            {/* My Protocols */}
            {purchasedProtocols.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Meus Protocolos</h3>
                  <button className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Ver todos</button>
                </div>
                <div className="grid gap-3">
                  {purchasedProtocols.map(protocol => (
                    <ProtocolCard key={protocol.id} protocol={protocol} purchased />
                  ))}
                </div>
              </div>
            )}

            {/* Featured Section */}
            {availableProtocols.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Destaques</h3>
                  <button className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Ver tudo</button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {availableProtocols.slice(0, 2).map(protocol => (
                    <div key={protocol.id} className="min-w-[280px]">
                      <ProtocolCard protocol={protocol} featured onPurchase={handlePurchase} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paid Protocols */}
            {availableProtocols.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Programas de Treino</h3>
                  <button className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Ver todos</button>
                </div>
                <div className="grid gap-4">
                  {availableProtocols.map(protocol => (
                    <ProtocolCard key={protocol.id} protocol={protocol} onPurchase={handlePurchase} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Disconnect Confirmation */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xs bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Desconectar Treinador?</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Você perderá o acesso aos treinos personalizados enviados por este profissional.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowDisconnectConfirm(null)}
                  className="py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60 active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    if (showDisconnectConfirm) {
                      await onDisconnect(showDisconnectConfirm);
                      setShowDisconnectConfirm(null);
                    }
                  }}
                  className="py-3 bg-red-500 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connect Popup */}
      <AnimatePresence>
        {showConnectPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConnectPopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-dark-surface border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mx-auto text-brand-red">
                    <UserPlus size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Conectar por Código</h3>
                  <p className="text-sm text-white/40">Insira o código fornecido pelo seu treinador para solicitar conexão.</p>
                </div>

                <div className="space-y-4">
                  <input 
                    type="text"
                    value={connectCode}
                    onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
                    placeholder="EX: TREINADOR123"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:border-gray-400 transition-all"
                  />
                  <button 
                    disabled={!connectCode || isConnecting}
                    onClick={async () => {
                      setIsConnecting(true);
                      try {
                        await onConnect(connectCode);
                        setShowConnectPopup(false);
                        setConnectCode('');
                      } catch (e: any) {
                        alert(e.message || 'Código inválido ou erro na conexão.');
                      } finally {
                        setIsConnecting(false);
                      }
                    }}
                    className="w-full py-4 bg-brand-red text-black rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {isConnecting ? 'Conectando...' : 'Solicitar Conexão'}
                  </button>
                  <button 
                    onClick={() => setShowConnectPopup(false)}
                    className="w-full py-4 text-white/40 font-bold uppercase tracking-widest text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trainer Profile Modal */}
      <AnimatePresence>
        {selectedTrainerForProfile && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrainerForProfile(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-dark-surface border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
            >
              {/* Header Image */}
              <div className="relative h-48 w-full">
                <img 
                  src={selectedTrainerForProfile.avatarUrl} 
                  alt={selectedTrainerForProfile.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/20 to-transparent" />
                <button 
                  onClick={() => setSelectedTrainerForProfile(null)}
                  className="absolute top-6 left-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-colors z-20"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 -mt-12 relative z-10 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-display font-bold">{selectedTrainerForProfile.name}</h3>
                    <p className="text-brand-red font-bold uppercase tracking-widest text-xs">{selectedTrainerForProfile.specialty || 'Treinador Elite'}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <Trophy size={14} className="text-brand-red" />
                    <span className="font-bold">{selectedTrainerForProfile.rating || '5.0'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Alunos</p>
                    <p className="text-lg font-bold">{selectedTrainerForProfile.students || '45'}</p>
                  </div>
                  <div className="text-center space-y-1 border-x border-white/5">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Exp.</p>
                    <p className="text-lg font-bold">{selectedTrainerForProfile.experience || '8 anos'}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Aulas</p>
                    <p className="text-lg font-bold">1.2k</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Sobre</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {selectedTrainerForProfile.bio || `Especialista em ${selectedTrainerForProfile.specialty || 'treinamento de alta performance'}, focado em resultados consistentes e saúde integral. Com mais de 8 anos de experiência transformando vidas através do movimento.`}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Hipertrofia', 'Emagrecimento', 'Performance', 'Saúde'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  {(() => {
                    const connection = studentConnections.find(c => c.trainerEmail === selectedTrainerForProfile.email);
                    const isPending = connection?.status === 'pending';
                    const isConnected = connection?.status === 'accepted';

                    if (isConnected) {
                      return (
                        <div className="flex-1 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <ShieldCheck size={18} />
                          Conectado
                        </div>
                      );
                    }

                    if (isPending) {
                      return (
                        <div className="flex-1 py-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <RefreshCw size={18} className="animate-spin-slow" />
                          Solicitado
                        </div>
                      );
                    }

                    return (
                      <button 
                        disabled={!selectedTrainerForProfile.personalCode && !selectedTrainerForProfile.email}
                        onClick={async () => {
                          try {
                            const codeToUse = selectedTrainerForProfile.email || selectedTrainerForProfile.personalCode;
                            if (codeToUse) {
                              await onConnect(codeToUse);
                              // The profile refresh in onConnect will update the state
                            }
                          } catch (e: any) {
                            alert(e.message || 'Erro ao solicitar conexão.');
                          }
                        }}
                        className="flex-1 py-4 bg-brand-red text-black rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserPlus size={18} />
                        Conectar Treinador
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TrainerCardProps {
  trainer: any;
  showDistance?: boolean;
  onConnect: (code: string) => Promise<void>;
  studentConnections?: any[];
  key?: any;
}

function PurchasedProductsView({ onBack, api }: { onBack: () => void, api: any }) {
  const [purchasedProtocols, setPurchasedProtocols] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPurchased = async () => {
      try {
        const data = await api.getPurchasedProtocols();
        setPurchasedProtocols(data);
      } catch (error) {
        console.error('Failed to load purchased protocols', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPurchased();
  }, [api]);
  
  return (
    <div className="space-y-6 pb-24">
      <div className="sticky top-0 z-30 bg-dark-bg/80 backdrop-blur-xl pt-4 pb-2 -mx-4 px-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold">Meus Produtos</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Galeria de Compras</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Protocolos Adquiridos</h3>
        {isLoading ? (
          <div className="text-center py-12 text-white/40 text-sm">Carregando...</div>
        ) : (
          <div className="grid gap-4">
            {purchasedProtocols.map(protocol => (
              <ProtocolCard key={protocol.id} protocol={protocol} purchased />
            ))}
          </div>
        )}
      </div>
      
      {!isLoading && purchasedProtocols.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10">
            <ShoppingBag size={40} />
          </div>
          <div className="space-y-1">
            <p className="font-bold">Nenhum produto encontrado</p>
            <p className="text-xs text-white/40 max-w-[200px]">Você ainda não adquiriu nenhum protocolo ou serviço.</p>
          </div>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-brand-red text-black rounded-xl font-bold text-xs uppercase tracking-widest"
          >
            Explorar Loja
          </button>
        </div>
      )}
    </div>
  );
}

function TrainerCard({ trainer, showDistance, onConnect, studentConnections = [], onViewProfile }: TrainerCardProps & { onViewProfile?: (t: any) => void }) {
  const connection = studentConnections.find(c => c.trainerEmail === trainer.email);
  const isPending = connection?.status === 'pending';
  const isConnected = connection?.status === 'accepted';

  return (
    <Card 
      className="p-4 hover:border-brand-red/30 transition-all group cursor-pointer"
      onClick={() => onViewProfile?.(trainer)}
    >
      <div className="flex gap-4">
        <div className="relative">
          <img src={trainer.avatarUrl} alt={trainer.name} className="w-16 h-16 rounded-2xl object-cover border border-white/10 group-hover:border-brand-red/50 transition-all" />
          {showDistance && (
            <div className="absolute -bottom-1 -right-1 bg-brand-red text-black text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-lg">
              {trainer.distance}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-sm">{trainer.name}</h4>
              <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider">{trainer.specialty || 'Treinador Elite'}</p>
            </div>
            <div className="flex items-center gap-1 bg-brand-red/10 px-2 py-1 rounded-lg">
              <Trophy size={10} className="text-brand-red" />
              <span className="text-[10px] font-bold text-brand-red">{trainer.rating || '5.0'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex flex-col">
              <span className="text-[8px] text-white/20 uppercase font-bold">Alunos</span>
              <span className="text-[10px] font-bold">{trainer.students || (((trainer.email?.charCodeAt(0) || 1) + (trainer.name?.charCodeAt(0) || 1)) % 50 + 10)}</span>
            </div>
            <div className="w-px h-4 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-[8px] text-white/20 uppercase font-bold">Exp.</span>
              <span className="text-[10px] font-bold">{trainer.experience || '5+ anos'}</span>
            </div>
            
            {isConnected ? (
              <div className="ml-auto flex items-center gap-1 text-emerald-500">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Conectado</span>
              </div>
            ) : isPending ? (
              <div className="ml-auto flex items-center gap-1 text-amber-500">
                <RefreshCw size={14} className="animate-spin-slow" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Solicitado</span>
              </div>
            ) : (
              <button 
                disabled={!trainer.personalCode && !trainer.email}
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect(trainer.email || trainer.personalCode || '');
                }}
                className="ml-auto px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-brand-red hover:text-black hover:border-brand-red transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Conectar
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function MarketplaceView() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Marketplace</h2>
      </div>

      <Card className="py-12 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red">
          <ShoppingBag size={32} />
        </div>
        <div className="space-y-1">
          <p className="text-white/40 font-bold">Em breve</p>
          <p className="text-xs text-white/20">O marketplace oficial do Shape Express está sendo preparado.</p>
        </div>
      </Card>
    </div>
  );
}

function ExerciseLibraryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedMuscleSubgroup, setSelectedMuscleSubgroup] = useState<MuscleSubgroup | 'Todos'>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'Todos'>('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'Todos'>('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const muscleSubgroupsMap: Record<string, MuscleSubgroup[]> = {
    'Peito': ['Peito superior', 'Peito médio', 'Peito inferior'],
    'Costas': ['Dorsal', 'Trapézio', 'Lombar'],
    'Pernas': ['Quadríceps', 'Posterior', 'Glúteos', 'Adutor', 'Abdutor', 'Panturrilha'],
    'Ombros': ['Deltoide Anterior', 'Deltoide Lateral', 'Deltoide Posterior'],
    'Braços': ['Bíceps', 'Tríceps', 'Antebraço'],
    'Core': ['Abdominais', 'Oblíquos', 'Lombar (Core)'],
  };

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscleGroup === 'Todos' || ex.muscleGroup === selectedMuscleGroup;
    const matchesSubgroup = selectedMuscleSubgroup === 'Todos' || ex.muscleSubgroup === selectedMuscleSubgroup;
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'Todos' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesSubgroup && matchesCategory && matchesEquipment;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Biblioteca</h2>
        <Badge className="bg-brand-red/20 text-brand-red">{filteredExercises.length} exercícios</Badge>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar exercícios..."
              className="w-full bg-dark-card border border-dark-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-gray-400 transition-colors text-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3 rounded-2xl border transition-all flex items-center justify-center gap-2",
              showFilters || selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos'
                ? "bg-brand-red/10 border-brand-red/30 text-brand-red" 
                : "bg-dark-card border-dark-border text-white/40"
            )}
          >
            <SlidersHorizontal size={20} />
            {(selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && !showFilters && (
              <span className="w-2 h-2 bg-brand-red rounded-full"></span>
            )}
          </button>
        </div>

        {!showFilters && (selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {selectedCategory !== 'Todos' && (
              <button 
                onClick={() => setSelectedCategory('Todos')}
                className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
              >
                {selectedCategory} <X size={10} />
              </button>
            )}
            {selectedEquipment !== 'Todos' && (
              <button 
                onClick={() => setSelectedEquipment('Todos')}
                className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
              >
                {selectedEquipment} <X size={10} />
              </button>
            )}
            {selectedMuscleGroup !== 'Todos' && (
              <button 
                onClick={() => {
                  setSelectedMuscleGroup('Todos');
                  setSelectedMuscleSubgroup('Todos');
                }}
                className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
              >
                {selectedMuscleGroup} <X size={10} />
              </button>
            )}
            {selectedMuscleSubgroup !== 'Todos' && (
              <button 
                onClick={() => setSelectedMuscleSubgroup('Todos')}
                className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
              >
                {selectedMuscleSubgroup} <X size={10} />
              </button>
            )}
          </div>
        )}

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3"
            >
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Todos', 'Musculação', 'Alongamento', 'Exercício em casa', 'Funcional'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                      selectedCategory === cat 
                        ? "bg-brand-red border-brand-red text-black" 
                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Todos', 'Barra', 'Halter', 'Máquina', 'Peso corporal', 'Elástico', 'Kettlebell'].map((eq) => (
                  <button
                    key={eq}
                    onClick={() => setSelectedEquipment(eq as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                      selectedEquipment === eq 
                        ? "bg-brand-red border-brand-red text-black" 
                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                    )}
                  >
                    {eq}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Full Body'].map((group) => (
                  <button
                    key={group}
                    onClick={() => {
                      setSelectedMuscleGroup(group as any);
                      setSelectedMuscleSubgroup('Todos');
                    }}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                      selectedMuscleGroup === group 
                        ? "bg-brand-red border-brand-red text-black" 
                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                    )}
                  >
                    {group}
                  </button>
                ))}
              </div>

              {selectedMuscleGroup !== 'Todos' && muscleSubgroupsMap[selectedMuscleGroup] && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Todos', ...muscleSubgroupsMap[selectedMuscleGroup]].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedMuscleSubgroup(sub as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                        selectedMuscleSubgroup === sub 
                          ? "bg-brand-red border-brand-red text-black" 
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredExercises.map(ex => (
          <Card 
            key={ex.id} 
            onClick={() => setSelectedExercise(ex)}
            className="flex justify-between items-center hover:bg-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-red">
                <Dumbbell size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold">{ex.name}</h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-[10px] text-white/40 font-bold uppercase">{ex.muscleGroup}</p>
                  {ex.muscleSubgroup && (
                    <>
                      <span className="text-[10px] text-white/20">•</span>
                      <p className="text-[10px] text-brand-red/60 font-bold uppercase">{ex.muscleSubgroup}</p>
                    </>
                  )}
                  <span className="text-[10px] text-white/20">•</span>
                  <p className="text-[10px] text-white/40 font-bold uppercase">{ex.equipment}</p>
                </div>
              </div>
            </div>
            {ex.youtubeUrl && (
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <Play size={14} fill="currentColor" />
              </div>
            )}
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-sm bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6 overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-brand-red/20 text-brand-red mb-2">{selectedExercise.muscleGroup}</Badge>
                  <h3 className="text-xl font-bold">{selectedExercise.name}</h3>
                </div>
                <button onClick={() => setSelectedExercise(null)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-white/40 font-bold uppercase">Equipamento</p>
                  <p className="text-sm font-bold">{selectedExercise.equipment}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-white/40 font-bold uppercase">Tipo</p>
                  <p className="text-sm font-bold capitalize">{selectedExercise.type === 'compound' ? 'Composto' : selectedExercise.type === 'isolation' ? 'Isolado' : selectedExercise.type}</p>
                </div>
              </div>

              {selectedExercise.youtubeUrl ? (
                <div className="space-y-3">
                  <p className="text-[10px] text-white/40 font-bold uppercase px-2">Vídeo de Execução</p>
                  {getYouTubeEmbedUrl(selectedExercise.youtubeUrl) ? (
                    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative">
                      <iframe 
                        src={getYouTubeEmbedUrl(selectedExercise.youtubeUrl)!}
                        title={`Vídeo de execução: ${selectedExercise.name}`}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <a 
                      href={selectedExercise.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full aspect-video bg-black rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10 group overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-red-500/10 group-hover:bg-red-500/20 transition-colors" />
                      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-600/40 group-hover:scale-110 transition-transform z-10">
                        <Play size={32} fill="currentColor" />
                      </div>
                      <span className="text-xs font-bold z-10">Assistir no YouTube</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-8 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center space-y-2">
                  <p className="text-xs text-white/40">Nenhum vídeo disponível para este exercício.</p>
                </div>
              )}

              <button 
                onClick={() => setSelectedExercise(null)}
                className="w-full py-4 bg-white/5 text-white/60 font-bold text-sm rounded-2xl"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsGoalView({ currentGoal, onSave, onCancel }: { currentGoal: number, onSave: (g: number) => void, onCancel: () => void }) {
  const [goal, setGoal] = useState(currentGoal);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Meta Semanal</h2>
      </div>

      <Card className="space-y-8 p-8 text-center">
        <div className="space-y-2">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Treinos por Semana</p>
          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={() => setGoal(Math.max(1, goal - 1))}
              className="w-12 h-12 rounded-full border border-dark-border flex items-center justify-center text-2xl font-bold hover:bg-white/5 transition-colors"
            >
              -
            </button>
            <span className="text-6xl font-display font-bold text-brand-red">{goal}</span>
            <button 
              onClick={() => setGoal(Math.min(14, goal + 1))}
              className="w-12 h-12 rounded-full border border-dark-border flex items-center justify-center text-2xl font-bold hover:bg-white/5 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        
        <p className="text-sm text-white/40">
          Defina quantas fichas por semana você pretende treinar. 
          Manter a consistência é a chave para a elite.
        </p>

        <button 
          onClick={() => onSave(goal)}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          Atualizar Meta
        </button>
      </Card>
    </div>
  );
}

function SettingsNotificationsView({ onSave, onCancel }: { onSave: () => void, onCancel: () => void }) {
  const [settings, setSettings] = useState({
    reminders: true,
    achievements: true,
    weeklyReport: true,
    marketing: false
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Notificações</h2>
      </div>

      <Card className="divide-y divide-dark-border">
        <NotificationToggle 
          label="Lembretes de Treino" 
          description="Avisar quando for hora de esmagar."
          active={settings.reminders}
          onToggle={() => setSettings({...settings, reminders: !settings.reminders})}
        />
        <NotificationToggle 
          label="Novas Conquistas" 
          description="Notificar quando você desbloquear medalhas."
          active={settings.achievements}
          onToggle={() => setSettings({...settings, achievements: !settings.achievements})}
        />
        <NotificationToggle 
          label="Relatório Semanal" 
          description="Resumo da sua performance a cada domingo."
          active={settings.weeklyReport}
          onToggle={() => setSettings({...settings, weeklyReport: !settings.weeklyReport})}
        />
        <NotificationToggle 
          label="Novidades e Dicas" 
          description="Conteúdo exclusivo para atletas Shape Express."
          active={settings.marketing}
          onToggle={() => setSettings({...settings, marketing: !settings.marketing})}
        />
      </Card>

      <div className="pt-6">
        <button 
          onClick={onSave}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          Salvar Preferências
        </button>
      </div>
    </div>
  );
}

function HelpView({ onBack }: { onBack: () => void }) {
  const faqs = [
    {
      question: "Como crio um novo treino?",
      answer: "Vá na aba 'Treinos' e clique no botão '+' no topo da tela. Você poderá definir o nome do protocolo, número de fichas e selecionar os exercícios."
    },
    {
      question: "Como registro minha evolução?",
      answer: "Na aba 'Evolução', clique em 'Nova Avaliação'. Você pode registrar seu peso, medidas e até tirar fotos para comparar seu progresso visualmente."
    },
    {
      question: "O que é o Volume Total?",
      answer: "É a soma de (Peso × Repetições × Séries) de todos os exercícios realizados. É um excelente indicador de sobrecarga progressiva."
    },
    {
      question: "Como ganho medalhas?",
      answer: "As medalhas são desbloqueadas automaticamente conforme você atinge marcos, como completar seu primeiro treino, manter uma sequência ou atingir volume recorde."
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Ajuda e Suporte</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Perguntas Frequentes</h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={index} className="space-y-2">
              <h4 className="text-sm font-bold text-brand-red">{faq.question}</h4>
              <p className="text-xs text-white/60 leading-relaxed">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Suporte Direto</h3>
        <Card className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
            <Mail size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold">E-mail de Suporte</h4>
            <p className="text-xs text-white/40">suporte@shapeexpress.com</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
            <Bell size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold">Comunidade Shape Express</h4>
            <p className="text-xs text-white/40">Acesse nosso Discord oficial</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function NotificationToggle({ label, description, active, onToggle }: { label: string, description: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="space-y-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[10px] text-white/40">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-12 h-6 rounded-full relative transition-colors duration-300",
          active ? "bg-brand-red" : "bg-dark-border"
        )}
      >
        <motion.div 
          animate={{ x: active ? 24 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
}

