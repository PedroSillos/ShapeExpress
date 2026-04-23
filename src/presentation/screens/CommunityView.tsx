import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  MessageSquare,
  Trophy,
  Flame,
  Heart,
  Share2,
  Plus,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  TrendingUp,
  Target,
  ChevronRight,
  Search,
  Filter,
  Sparkles,
  X,
  RefreshCw,
  UserPlus,
  UserCheck,
  Medal,
  Loader2,
  Clock,
  AlertTriangle,
  Ban,
  ChevronLeft,
  Settings,
  User,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { formatDistanceToNow, endOfDay, endOfWeek, endOfMonth, differenceInSeconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { calculateChallengeXP } from "../../constants";
import {
  Post,
  Community,
  Challenge,
  UserChallenge,
  Ranking,
  CommunityMessage,
  UserProfile,
  UserStats,
  LeaderboardEntry,
} from "../../domain/entities";
import { ImageUpload } from "../components/ImageUpload";

interface CommunityViewProps {
  userProfile: UserProfile | null;
  userStats: UserStats;
  api: any;
  communityMessages: CommunityMessage[];
  setCommunityMessages: React.Dispatch<
    React.SetStateAction<CommunityMessage[]>
  >;
  recommendedCommunities: Community[];
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  getLeaderboard: (league: string) => Promise<LeaderboardEntry[]>;
  initialTab?: "feed" | "challenges" | "ranking" | "chat";
  initialRankingType?: "community" | "global" | "league" | "friends";
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  userProfile,
  userStats,
  api,
  communityMessages,
  setCommunityMessages,
  recommendedCommunities,
  posts,
  setPosts,
  getLeaderboard,
  initialTab = "feed",
  initialRankingType = "community",
}) => {
  const [activeTab, setActiveTab] = useState<
    "feed" | "challenges" | "ranking" | "chat"
  >(initialTab);
  const [rankingType, setRankingType] = useState<
    "community" | "global" | "league" | "friends"
  >(initialRankingType);
  const [feedFilter, setFeedFilter] = useState<"global" | "following">(
    "global",
  );
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] =
    useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    communities: Community[];
  }>({ users: [], communities: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialRankingType) setRankingType(initialRankingType);
  }, [initialRankingType]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunityIds, setUserCommunityIds] = useState<string[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(
    null,
  );
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPostForComments, setSelectedPostForComments] =
    useState<Post | null>(null);

  const userLeague = userStats.league || "Bronze";

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "chat" && activeCommunity) {
      loadMessages();
    }
  }, [activeTab, activeCommunity]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [communityMessages]);

  useEffect(() => {
    if (activeTab === "ranking" && rankingType !== "community") {
      fetchLeaderboard();
    }
  }, [activeTab, rankingType, userLeague]);

  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const leagueParam =
        rankingType === "global"
          ? "global"
          : rankingType === "friends"
            ? "friends"
            : userLeague;
      const data = await getLeaderboard(leagueParam);

      if (data.length === 0) {
        // Fallback to mock data for demo if no real data in DB
        const mockData: LeaderboardEntry[] = Array.from({ length: 10 }).map(
          (_, i) => ({
            id: `mock-${i}`,
            name: [
              "Lucas Oliveira",
              "Mariana Costa",
              "Pedro Santos",
              "Ana Silva",
              "João Pereira",
              "Carla Dias",
              "Bruno Lima",
              "Sofia Rocha",
              "Tiago Alves",
              "Beatriz Cruz",
            ][i],
            avatarUrl: `https://picsum.photos/seed/user${i + (rankingType === "global" ? 100 : rankingType === "friends" ? 300 : 200)}/200`,
            xp: 15000 - i * 1200,
            streak: 50 - i * 4,
            level: 30 - i * 2,
            rank: i + 1,
          }),
        );
        setLeaderboard(mockData);
      } else {
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  const handleFollowToggle = async (
    targetEmail: string,
    isFollowing?: boolean,
  ) => {
    try {
      if (isFollowing) {
        await api.unfollowUser(targetEmail);
      } else {
        await api.followUser(targetEmail);
      }
      // Refresh ranking data
      if (rankingType === "community" && activeCommunity) {
        const data = await api.getCommunityRanking(activeCommunity.id);
        setRanking(data);
      } else {
        fetchLeaderboard();
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "feed") {
      loadPosts();
    }
  }, [activeTab, feedFilter, activeCommunity]);

  const loadPosts = async () => {
    try {
      const res = await api.getPosts(activeCommunity?.id, feedFilter);
      setPosts(res);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults({ users: [], communities: [] });
      return;
    }
    setIsSearching(true);
    try {
      const [users, communities] = await Promise.all([
        api.searchUsers(q),
        api.searchCommunities(q),
      ]);
      setSearchResults({ users, communities });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, communitiesRes, challengesRes, userChallengesRes, userCommunitiesRes] =
        await Promise.all([
          api.getPosts(),
          api.getCommunities(),
          api.getChallenges(),
          api.getUserChallenges(),
          api.getUserCommunities ? api.getUserCommunities() : Promise.resolve([]),
        ]);
      setPosts(postsRes);
      setCommunities(communitiesRes);
      setChallenges(challengesRes);
      setUserChallenges(userChallengesRes);
      setUserCommunityIds(userCommunitiesRes);

      if (communitiesRes.length > 0) {
        const rankingRes = await api.getCommunityRanking(communitiesRes[0].id);
        setRanking(rankingRes);
      }
    } catch (error) {
      console.error("Failed to load community data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!activeCommunity) return;
    try {
      const res = await api.getCommunityMessages(activeCommunity.id);
      setCommunityMessages(res);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() && !postImageUrl) return;
    setIsPosting(true);
    try {
      const post = await api.createPost({
        type: postImageUrl ? "photo" : "text",
        content: {
          text: newPostText,
          ...(postImageUrl ? { imageUrl: postImageUrl } : {}),
        },
        communityId: activeCommunity?.id,
      });
      setPosts([post, ...posts]);
      setNewPostText("");
      setPostImageUrl(null);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCollectChallenge = async (challenge: Challenge) => {
    try {
      // Update the user challenge to collected
      await api.updateChallengeProgress(challenge.id, challenge.goal, true);

      // Add XP to user
      if (api.addXP) {
        await api.addXP(challenge.rewardXp);
      }

      // Update local state
      setUserChallenges((prev) =>
        prev.map((uc) =>
          uc.challengeId === challenge.id ? { ...uc, collected: true } : uc,
        ),
      );

      // Create a share post
      const postContent = `🏆 Completei o desafio "${challenge.title}" e ganhei ${challenge.rewardXp} XP! Quem vem comigo?`;
      setNewPostText(postContent);
      setActiveTab("feed");

      toast.success(`Desafio coletado! +${challenge.rewardXp} XP`);
    } catch (error) {
      console.error("Failed to collect challenge", error);
      toast.error("Erro ao coletar recompensa: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const ChallengeTimer = ({ category, durationDays }: { category: string, durationDays: number }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
      const calculateTimeLeft = () => {
        const now = new Date();
        let targetDate = now;

        if (category === "daily") {
          targetDate = endOfDay(now);
        } else if (category === "weekly") {
          targetDate = endOfWeek(now, { weekStartsOn: 1 }); // Monday is start of week
        } else if (category === "community") {
          // If durationDays is provided, we could calculate based on it, but for simplicity we use endOfMonth
          targetDate = endOfMonth(now);
        }

        const diffInSeconds = differenceInSeconds(targetDate, now);

        if (diffInSeconds > 0) {
          const days = Math.floor(diffInSeconds / (3600 * 24));
          const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
          const minutes = Math.floor((diffInSeconds % 3600) / 60);
          const seconds = diffInSeconds % 60;

          if (days > 0) {
            setTimeLeft(`${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`);
          } else {
            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          }
        } else {
          setTimeLeft("Expirado");
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }, [category, durationDays]);

    return <span>{timeLeft}</span>;
  };

  const handleCancelChallenge = async (challenge: Challenge) => {
    try {
      if (api.cancelChallenge) {
        await api.cancelChallenge(challenge.id);
      }
      
      setUserChallenges((prev) => {
        const existing = prev.find(uc => uc.challengeId === challenge.id);
        if (existing) {
          return prev.map(uc => uc.challengeId === challenge.id ? { ...uc, cancelled: true } : uc);
        } else {
          return [...prev, { userId: userProfile?.email || '', challengeId: challenge.id, progress: 0, completed: false, cancelled: true }];
        }
      });
      
      toast.success("Desafio cancelado com sucesso.");
    } catch (error) {
      console.error("Failed to cancel challenge", error);
      toast.error("Erro ao cancelar desafio: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const renderChallengeGroup = (title: string, category: string) => {
    const groupChallenges = challenges.filter((c) => {
      if (c.category !== category) return false;
      const userProgress = userChallenges.find((uc) => uc.challengeId === c.id);
      return !userProgress?.cancelled;
    });
    if (groupChallenges.length === 0) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">
          {title}
        </h2>
        {groupChallenges.map((challenge) => {
          const userProgress = userChallenges.find(
            (uc) => uc.challengeId === challenge.id,
          );
          const progressPercent = userProgress
            ? (userProgress.progress / challenge.goal) * 100
            : 0;
          const isCompleted = userProgress?.progress >= challenge.goal;
          const isCollected = userProgress?.collected;

          return (
            <div
              key={challenge.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                    <Flame size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm">{challenge.title}</h3>
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
                          challenge.difficulty === "easy"
                            ? "bg-green-500/20 text-green-400"
                            : challenge.difficulty === "medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : challenge.difficulty === "hard"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-purple-500/20 text-purple-400",
                        )}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-white/30">
                      <Clock size={12} />
                      <span className="text-[10px] uppercase tracking-wider font-bold">
                        <ChallengeTimer category={challenge.category} durationDays={challenge.durationDays} />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-brand-red">
                    +{challenge.rewardXp} XP
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-white/40">Progresso</span>
                  <span className="text-white">
                    {userProgress?.progress || 0} / {challenge.goal}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progressPercent)}%` }}
                    className={cn(
                      "h-full",
                      isCompleted ? "bg-green-500" : "bg-brand-red",
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {challenge.category === "community" && !isCollected && (
                  <button 
                    onClick={() => handleCancelChallenge(challenge)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors text-white/60"
                  >
                    Cancelar
                  </button>
                )}
                
                {isCollected ? (
                  <button
                    disabled
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/40 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Entregue
                  </button>
                ) : (
                  <button
                    onClick={() => handleCollectChallenge(challenge)}
                    disabled={!isCompleted}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors",
                      isCompleted 
                        ? "bg-brand-red text-black hover:bg-brand-red/90" 
                        : "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                    )}
                  >
                    <Trophy size={16} />
                    Entregar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleLikePost = async (postId: string) => {
    try {
      // Optimistic update using functional state to prevent race conditions
      setPosts((currentPosts) =>
        currentPosts.map((p) => {
          if (p.id === postId) {
            const isLiked = p.likedByMe;
            return {
              ...p,
              likesCount: isLiked
                ? Math.max(0, p.likesCount - 1)
                : p.likesCount + 1,
              likedByMe: !isLiked,
            };
          }
          return p;
        })
      );

      await api.likePost(postId);
    } catch (error) {
      console.error("Failed to like post:", error);
      // Revert optimistic update on error by reloading posts
      loadPosts();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeCommunity) return;
    try {
      const msg = await api.sendCommunityMessage(
        activeCommunity.id,
        newMessage,
      );
      setCommunityMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await api.joinCommunity(communityId);
      const updatedCommunities = await api.getCommunities();
      setCommunities(updatedCommunities);
      setUserCommunityIds((prev) => [...prev, communityId]);
      const community = updatedCommunities.find(
        (c: Community) => c.id === communityId,
      );
      if (community) setActiveCommunity(community);
    } catch (error) {
      console.error("Failed to join community:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-white/40 font-bold uppercase tracking-widest">
            Sincronizando Comunidade...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-bg">
      {/* Community Selector Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-dark-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeCommunity ? (
              <button
                onClick={() => setActiveCommunity(null)}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                <Users size={24} />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                {activeCommunity ? activeCommunity.name : "Comunidades"}
              </h1>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                {activeCommunity ? "Comunidade" : "Explore e participe"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCommunity && (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors"
              >
                <Settings size={20} />
              </button>
            )}
            {!activeCommunity && (
              <>
                <button
                  onClick={() => setShowCreateCommunityModal(true)}
                  className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <Search size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      {activeCommunity && (
        <div className="flex border-b border-white/5 bg-dark-surface/30">
          {[
            { id: "feed", label: "Feed", icon: <TrendingUp size={16} /> },
            { id: "challenges", label: "Desafios", icon: <Target size={16} /> },
            { id: "ranking", label: "Ranking", icon: <Trophy size={16} /> },
            { id: "chat", label: "Chat", icon: <MessageSquare size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
                activeTab === tab.id
                  ? "text-brand-red"
                  : "text-white/40 hover:text-white/60",
              )}
            >
              {tab.icon}
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {!activeCommunity ? (
          <div className="p-6">
            {communities.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-red">
                  <Users size={18} />
                  <h2 className="text-xs font-bold uppercase tracking-widest">
                    Minhas Comunidades
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  {communities.map((community) => (
                    <div
                      key={community.id}
                      onClick={() => setActiveCommunity(community)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
                          <Users size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold truncate">
                            {community.name}
                          </h3>
                          <p className="text-xs text-white/40">
                            {community.membersCount} membros
                          </p>
                        </div>
                        {userCommunityIds.includes(community.id) ? (
                          <div
                            className="px-4 py-2 bg-white/10 rounded-lg text-white font-bold text-xs shrink-0"
                          >
                            Acessar
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinCommunity(community.id);
                            }}
                            className="px-4 py-2 bg-brand-red rounded-lg text-black font-bold text-xs active:scale-95 transition-transform shrink-0"
                          >
                            Entrar
                          </button>
                        )}
                      </div>
                      {community.description && (
                        <p className="text-xs text-white/60 line-clamp-2">
                          {community.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                  <Users size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Nenhuma comunidade</h3>
                  <p className="text-xs text-white/40 mt-1">
                    Crie ou pesquise uma comunidade para começar.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : !userCommunityIds.includes(activeCommunity.id) ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
              <Users size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Comunidade {activeCommunity.name}</h2>
              <p className="text-sm text-white/60 max-w-xs mx-auto">
                {activeCommunity.description || "Junte-se a esta comunidade para ver posts, desafios, ranking e conversar com outros membros."}
              </p>
            </div>
            <button
              onClick={() => handleJoinCommunity(activeCommunity.id)}
              className="px-8 py-4 bg-brand-red text-black rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-brand-red/90 transition-colors flex items-center gap-2"
            >
              <UserPlus size={18} />
              Entrar na Comunidade
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 space-y-6"
            >
              {/* Feed Filter */}
              <div className="flex bg-white/5 p-1 rounded-xl w-fit">
                {[
                  { id: "global", label: "Global" },
                  { id: "following", label: "Seguindo" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFeedFilter(filter.id as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      feedFilter === filter.id
                        ? "bg-brand-red text-black"
                        : "text-white/40",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Create Post */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="flex gap-3">
                  <img
                    src={userProfile?.avatarUrl}
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-4">
                    <textarea
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="O que você treinou hoje?"
                      className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none h-20 placeholder:text-white/20"
                    />
                    {postImageUrl && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                        <img
                          src={postImageUrl}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => setPostImageUrl(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-brand-red transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    <div className="relative">
                      <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                        <ImageIcon size={18} />
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const res = await api.uploadImage(file);
                            setPostImageUrl(res.url);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={
                      isPosting || (!newPostText.trim() && !postImageUrl)
                    }
                    className="px-6 py-2 bg-brand-red rounded-xl text-black font-bold text-xs disabled:opacity-50 active:scale-95 transition-transform"
                  >
                    {isPosting ? "Postando..." : "Postar"}
                  </button>
                </div>
              </div>

              {/* Posts List */}
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => handleLikePost(post.id)}
                    onComment={() => setSelectedPostForComments(post)}
                    api={api}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "challenges" && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 space-y-6"
            >
              {renderChallengeGroup("Desafios Diários", "daily")}
              {renderChallengeGroup("Desafios Semanais", "weekly")}
              {renderChallengeGroup("Desafios da Comunidade", "community")}
            </motion.div>
          )}

          {activeTab === "ranking" && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 space-y-6"
            >
              {/* Ranking Type Selector */}
              <div className="flex bg-white/5 p-1 rounded-xl">
                {[
                  { id: "community", label: "Comunidade" },
                  { id: "global", label: "Global" },
                  { id: "league", label: "Liga" },
                  { id: "friends", label: "Amigos" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setRankingType(type.id as any)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      rankingType === type.id
                        ? "bg-brand-red text-black"
                        : "text-white/40",
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {rankingType === "community" ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-white/5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">
                      Top Atletas - {activeCommunity?.name}
                    </h2>
                  </div>
                  <div className="divide-y divide-white/5">
                    {ranking.map((item, index) => {
                      const isMe = item.userId === userProfile?.email;
                      return (
                        <div
                          key={item.userId}
                          className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 flex justify-center">
                              {index < 3 ? (
                                <Medal
                                  className={cn(
                                    "w-5 h-5",
                                    index === 0
                                      ? "text-yellow-500"
                                      : index === 1
                                        ? "text-slate-400"
                                        : "text-amber-600",
                                  )}
                                />
                              ) : (
                                <span className="text-[10px] font-black text-white/40">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <img
                                src={item.userAvatar}
                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold">
                                    {item.userName}
                                  </p>
                                  {isMe && (
                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-red/10 text-brand-red font-bold uppercase">
                                      Você
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                                  {item.xp} XP • {item.streak} Dias
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!isMe && (
                              <button
                                onClick={() =>
                                  handleFollowToggle(
                                    item.userId,
                                    item.isFollowing,
                                  )
                                }
                                className={cn(
                                  "p-2 rounded-lg transition-all",
                                  item.isFollowing
                                    ? "bg-brand-red/10 text-brand-red"
                                    : "bg-white/5 text-white/40 hover:bg-white/10",
                                )}
                              >
                                {item.isFollowing ? (
                                  <UserCheck size={14} />
                                ) : (
                                  <UserPlus size={14} />
                                )}
                              </button>
                            )}
                            <div className="text-right min-w-[30px]">
                              <p className="text-xs font-bold text-brand-red">
                                #{index + 1}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {isLeaderboardLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <RefreshCw
                        className="animate-spin text-brand-red"
                        size={32}
                      />
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Carregando Ranking...
                      </p>
                    </div>
                  ) : (
                    leaderboard.map((entry, index) => {
                      const isMe = entry.id === userProfile?.email;
                      const rank = entry.rank || index + 1;
                      return (
                        <div
                          key={entry.id}
                          className={cn(
                            "p-4 rounded-2xl flex items-center gap-4 transition-all border",
                            isMe
                              ? "border-brand-red/50 bg-brand-red/5"
                              : "bg-white/5 border-white/10",
                          )}
                        >
                          <div className="flex items-center justify-center w-8 h-8">
                            {rank <= 3 ? (
                              <Medal
                                className={cn(
                                  "w-6 h-6",
                                  rank === 1
                                    ? "text-yellow-500"
                                    : rank === 2
                                      ? "text-slate-400"
                                      : "text-amber-600",
                                )}
                              />
                            ) : (
                              <span className="text-xs font-bold text-white/40">
                                #{rank}
                              </span>
                            )}
                          </div>

                          <img
                            src={entry.avatarUrl}
                            alt={entry.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                            referrerPolicy="no-referrer"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold truncate">
                                {entry.name}
                              </h4>
                              {isMe && (
                                <span className="text-[8px] py-0.5 px-1.5 rounded bg-brand-red/10 border border-brand-red text-brand-red font-bold">
                                  VOCÊ
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-white/40 font-medium">
                                Nível {entry.level}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold">
                                <Flame size={10} />
                                {entry.streak}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {!isMe && (
                              <button
                                onClick={() =>
                                  handleFollowToggle(
                                    entry.id,
                                    entry.isFollowing,
                                  )
                                }
                                className={cn(
                                  "p-2 rounded-lg transition-all",
                                  entry.isFollowing
                                    ? "bg-brand-red/10 text-brand-red"
                                    : "bg-white/5 text-white/40 hover:bg-white/10",
                                )}
                              >
                                {entry.isFollowing ? (
                                  <UserCheck size={14} />
                                ) : (
                                  <UserPlus size={14} />
                                )}
                              </button>
                            )}
                            <div className="text-right min-w-[60px]">
                              <div className="text-sm font-bold">
                                {entry.xp.toLocaleString()}
                              </div>
                              <div className="text-[8px] text-white/40 font-bold uppercase tracking-widest">
                                XP Total
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col h-[calc(100vh-280px)]"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {communityMessages.map((msg, idx) => {
                  const isMe = msg.userId === userProfile?.email;
                  return (
                    <div
                      key={msg.id || idx}
                      className={cn(
                        "flex flex-col",
                        isMe ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-3 rounded-2xl text-sm",
                          isMe
                            ? "bg-brand-red text-black rounded-tr-none"
                            : "bg-white/5 border border-white/10 text-white rounded-tl-none",
                        )}
                      >
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-1">
                            <img
                              src={msg.userAvatar}
                              className="w-4 h-4 rounded-full"
                              referrerPolicy="no-referrer"
                            />
                            <p className="text-[10px] font-bold text-brand-red">
                              {msg.userName}
                            </p>
                          </div>
                        )}
                        <p>{msg.content}</p>
                        <p
                          className={cn(
                            "text-[8px] mt-1 text-right opacity-40",
                          )}
                        >
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-dark-surface/50 border-t border-white/5 backdrop-blur-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Envie uma mensagem..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 bg-brand-red rounded-xl flex items-center justify-center text-black disabled:opacity-50 active:scale-95 transition-transform"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col"
          >
            <div className="p-6 flex items-center gap-4 border-b border-white/5">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  size={20}
                />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar atletas ou comunidades..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery("");
                  setSearchResults({ users: [], communities: [] });
                }}
                className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-brand-red" size={32} />
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Buscando...
                  </p>
                </div>
              ) : searchQuery.trim() ? (
                <>
                  {/* Users Results */}
                  <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">
                      Atletas
                    </h2>
                    {searchResults.users.length > 0 ? (
                      <div className="space-y-3">
                        {searchResults.users.map((user) => (
                          <div
                            key={user.email}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatarUrl}
                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="text-sm font-bold">{user.name}</p>
                                <p className="text-[10px] text-white/40">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            {user.email !== userProfile?.email && (
                              <button
                                onClick={() =>
                                  handleFollowToggle(
                                    user.email,
                                    user.isFollowing,
                                  )
                                }
                                className={cn(
                                  "p-2 rounded-lg transition-all",
                                  user.isFollowing
                                    ? "bg-brand-red/10 text-brand-red"
                                    : "bg-white/5 text-white/40 hover:bg-white/10",
                                )}
                              >
                                {user.isFollowing ? (
                                  <UserCheck size={16} />
                                ) : (
                                  <UserPlus size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/20 italic">
                        Nenhum atleta encontrado.
                      </p>
                    )}
                  </div>

                  {/* Communities Results */}
                  <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">
                      Comunidades
                    </h2>
                    {searchResults.communities.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {searchResults.communities.map((community) => (
                          <div
                            key={community.id}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                                  <Users size={20} />
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold">
                                    {community.name}
                                  </h3>
                                  <p className="text-[10px] text-white/40">
                                    {community.membersCount} membros
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  handleJoinCommunity(community.id);
                                  setShowSearchModal(false);
                                }}
                                className="px-4 py-2 bg-brand-red rounded-xl text-black font-bold text-[10px]"
                              >
                                Entrar
                              </button>
                            </div>
                            <p className="text-xs text-white/60 line-clamp-2">
                              {community.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/20 italic">
                        Nenhuma comunidade encontrada.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                    <Search size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/40">
                      Busca Global
                    </p>
                    <p className="text-xs text-white/20 mt-1">
                      Encontre atletas para seguir ou novas comunidades para
                      treinar junto.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {selectedPostForComments && (
          <CommentsModal
            post={selectedPostForComments}
            onClose={() => setSelectedPostForComments(null)}
            api={api}
            userProfile={userProfile}
            onCommentAdded={() => {
              setPosts(
                posts.map((p) =>
                  p.id === selectedPostForComments.id
                    ? { ...p, commentsCount: p.commentsCount + 1 }
                    : p,
                ),
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Create Community Modal */}
      <AnimatePresence>
        {showCreateCommunityModal && (
          <CreateCommunityModal
            onClose={() => setShowCreateCommunityModal(false)}
            api={api}
            onCommunityCreated={(newComm) => {
              setCommunities((prev) => [...prev, newComm]);
              setUserCommunityIds((prev) => [...prev, newComm.id]);
              setActiveCommunity(newComm);
            }}
          />
        )}
      </AnimatePresence>

      {/* Community Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && activeCommunity && (
          <CommunitySettingsModal
            community={activeCommunity}
            onClose={() => setShowSettingsModal(false)}
            api={api}
            onUpdate={(updatedComm) => {
              setCommunities((prev) =>
                prev.map((c) => (c.id === updatedComm.id ? updatedComm : c))
              );
              setActiveCommunity(updatedComm);
            }}
            onDelete={() => {
              setCommunities((prev) => prev.filter((c) => c.id !== activeCommunity.id));
              setActiveCommunity(communities.find((c) => c.id !== activeCommunity.id) || null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PostCard: React.FC<{
  post: Post;
  onLike: () => void;
  onComment: () => void;
  api: any;
}> = ({ post, onLike, onComment, api }) => {
  const [topComments, setTopComments] = useState<any[]>([]);

  useEffect(() => {
    if (post.commentsCount > 0) {
      api
        .getPostComments(post.id)
        .then((res: any) => {
          // Just take the first 3 comments
          setTopComments(res.slice(0, 3));
        })
        .catch((err: any) => console.error("Failed to load comments", err));
    }
  }, [post.id, post.commentsCount, api]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.userAvatar || "https://picsum.photos/seed/user/400"}
            className="w-10 h-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="text-sm font-bold">{post.userName || "Usuário"}</p>
            <p className="text-[10px] text-white/40">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
        <button className="text-white/20 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="px-4 pb-4">
        <p className="text-sm text-white/80 leading-relaxed">
          {post.content.text}
        </p>
        {post.content.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-white/5">
            <img
              src={post.content.imageUrl}
              className="w-full h-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {post.type === "workout" && (
          <div className="mt-4 p-4 bg-brand-red/5 border border-brand-red/10 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center text-brand-red">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Treino Concluído</p>
                <p className="text-[10px] text-white/40">Sessão de Elite</p>
              </div>
            </div>
            <TrendingUp size={20} className="text-brand-red" />
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/5 flex items-center gap-6">
        <button
          onClick={onLike}
          className={cn(
            "flex items-center gap-2 transition-colors group",
            post.likedByMe
              ? "text-brand-red"
              : "text-white/40 hover:text-brand-red",
          )}
        >
          <Heart
            size={18}
            className={cn(
              "group-active:scale-125 transition-transform",
              post.likedByMe && "fill-current",
            )}
          />
          <span className="text-xs font-bold">{post.likesCount}</span>
        </button>
        <button
          onClick={onComment}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <MessageSquare size={18} />
          <span className="text-xs font-bold">{post.commentsCount}</span>
        </button>
        <button className="ml-auto text-white/40 hover:text-white transition-colors">
          <Share2 size={18} />
        </button>
      </div>

      {topComments.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {topComments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <img
                src={comment.userAvatar}
                className="w-6 h-6 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 bg-white/5 rounded-xl p-2 text-sm">
                <p className="font-bold text-xs">{comment.userName}</p>
                <p className="text-white/80 text-xs">{comment.text}</p>
              </div>
            </div>
          ))}
          {post.commentsCount > 3 && (
            <button
              onClick={onComment}
              className="text-xs text-brand-red font-bold hover:underline"
            >
              Ver todos os {post.commentsCount} comentários
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CommentsModal: React.FC<{
  post: Post;
  onClose: () => void;
  api: any;
  userProfile: any;
  onCommentAdded?: () => void;
}> = ({ post, onClose, api, userProfile, onCommentAdded }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getPostComments(post.id).then((res: any) => {
      setComments(res);
      setIsLoading(false);
    });
  }, [post.id, api]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const comment = await api.addPostComment(post.id, newComment);
      setComments([...comments, comment]);
      setNewComment("");
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-dark-surface rounded-t-3xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold">Comentários</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-white/40"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-white/20">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={comment.userAvatar}
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold">{comment.userName}</p>
                    <p className="text-[10px] text-white/40">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-white/80">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-dark-surface border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="w-12 h-12 bg-brand-red rounded-xl flex items-center justify-center text-black disabled:opacity-50 active:scale-95 transition-transform"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CommunitySettingsModal: React.FC<{
  community: Community;
  onClose: () => void;
  api: any;
  onUpdate: (c: Community) => void;
  onDelete: () => void;
}> = ({ community, onClose, api, onUpdate, onDelete }) => {
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [isPublic, setIsPublic] = useState(true);
  const [allowMemberPosts, setAllowMemberPosts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  
  const [memberToBan, setMemberToBan] = useState<any>(null);
  const [banReason, setBanReason] = useState("spam");
  const [banDetails, setBanDetails] = useState("");
  const [deletePosts, setDeletePosts] = useState(false);
  const [activeMemberTab, setActiveMemberTab] = useState<"active" | "banned">("active");
  const [activeSettingsTab, setActiveSettingsTab] = useState<"general" | "members" | "challenges">("general");
  
  // Challenge creation state
  const [newChallengeTitle, setNewChallengeTitle] = useState("");
  const [newChallengeDesc, setNewChallengeDesc] = useState("");
  const [newChallengeDifficulty, setNewChallengeDifficulty] = useState<"easy" | "medium" | "hard" | "epic">("medium");
  const [newChallengeDuration, setNewChallengeDuration] = useState(7);
  const [newChallengeGoal, setNewChallengeGoal] = useState(10);
  
  // Mock members for demonstration
  const [members, setMembers] = useState([
    { id: "1", name: "João Silva (Você)", role: "admin", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: "2", name: "Maria Santos", role: "sub-admin", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: "3", name: "Pedro Costa", role: "member", avatar: "https://i.pravatar.cc/150?u=3" },
  ]);

  const [bannedMembers, setBannedMembers] = useState([
    { id: "4", name: "Lucas Almeida", avatar: "https://i.pravatar.cc/150?u=4", reason: "Spam ou Autopromoção", date: new Date().toISOString() }
  ]);

  const currentUserRole = members.find(m => m.id === "1")?.role || "member";
  const canChangeRoles = currentUserRole === "admin";
  const canDeleteCommunity = currentUserRole === "admin";

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()));
  const filteredBannedMembers = bannedMembers.filter(m => m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()));

  const handleRemoveMember = (member: any) => {
    setMemberToBan(member);
  };

  const handleConfirmBan = () => {
    if (!memberToBan) return;
    
    // Remove from active members
    setMembers(members.filter(m => m.id !== memberToBan.id));
    
    // Add to banned members
    const reasonText = {
      spam: "Spam ou Autopromoção",
      inappropriate: "Comportamento Inadequado",
      rules: "Violação das Regras",
      other: "Outro"
    }[banReason] || "Outro";

    setBannedMembers([...bannedMembers, { 
      id: memberToBan.id, 
      name: memberToBan.name, 
      avatar: memberToBan.avatar,
      reason: reasonText,
      date: new Date().toISOString()
    }]);

    toast.success(`${memberToBan.name} foi banido da comunidade.`);
    if (deletePosts) {
      toast.success(`Postagens recentes de ${memberToBan.name} foram excluídas.`);
    }
    setMemberToBan(null);
    setBanReason("spam");
    setBanDetails("");
    setDeletePosts(false);
  };

  const handleUnbanMember = (memberId: string) => {
    if (confirm("Deseja realmente desbanir este membro? Ele poderá acessar a comunidade novamente.")) {
      const memberToUnban = bannedMembers.find(m => m.id === memberId);
      if (memberToUnban) {
        setBannedMembers(bannedMembers.filter(m => m.id !== memberId));
        // Add back as a regular member
        setMembers([...members, { id: memberToUnban.id, name: memberToUnban.name, role: "member", avatar: memberToUnban.avatar }]);
        toast.success(`${memberToUnban.name} foi desbanido e retornou como membro comum.`);
      }
    }
  };

  const handleChangeRole = (memberId: string, newRole: string) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    toast.success("Cargo atualizado com sucesso.");
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      // Mock update
      const updated = { ...community, name, description };
      onUpdate(updated);
      toast.success("Configurações atualizadas!");
      onClose();
    } catch (error) {
      console.error("Failed to update community", error);
      toast.error("Erro ao atualizar comunidade: " + getFirebaseErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir esta comunidade? Esta ação não pode ser desfeita.")) {
      setIsDeleting(true);
      try {
        // Mock delete
        onDelete();
        toast.success("Comunidade excluída.");
        onClose();
      } catch (error) {
        console.error("Failed to delete community", error);
        toast.error("Erro ao excluir comunidade: " + getFirebaseErrorMessage(error));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-dark-surface rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-dark-surface z-10">
          <h2 className="text-lg font-bold">Configurações da Comunidade</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-4 border-b border-white/5 flex gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSettingsTab("general")}
            className={cn(
              "pb-3 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2",
              activeSettingsTab === "general" ? "text-brand-red border-brand-red" : "text-white/40 border-transparent hover:text-white"
            )}
          >
            Geral
          </button>
          <button
            onClick={() => setActiveSettingsTab("members")}
            className={cn(
              "pb-3 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2",
              activeSettingsTab === "members" ? "text-brand-red border-brand-red" : "text-white/40 border-transparent hover:text-white"
            )}
          >
            Membros
          </button>
          <button
            onClick={() => setActiveSettingsTab("challenges")}
            className={cn(
              "pb-3 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2",
              activeSettingsTab === "challenges" ? "text-brand-red border-brand-red" : "text-white/40 border-transparent hover:text-white"
            )}
          >
            Desafios
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          {activeSettingsTab === "general" && (
            <>
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red">Informações Básicas</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Descrição
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none h-24"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red">Privacidade e Permissões</h3>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <p className="font-bold text-sm">Comunidade Pública</p>
                    <p className="text-xs text-white/40">Qualquer um pode encontrar e participar</p>
                  </div>
                  <button 
                    onClick={() => setIsPublic(!isPublic)}
                    className={cn("w-12 h-6 rounded-full transition-colors relative", isPublic ? "bg-brand-red" : "bg-white/10")}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", isPublic ? "left-7" : "left-1")} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <p className="font-bold text-sm">Membros podem postar</p>
                    <p className="text-xs text-white/40">Permitir posts no feed da comunidade</p>
                  </div>
                  <button 
                    onClick={() => setAllowMemberPosts(!allowMemberPosts)}
                    className={cn("w-12 h-6 rounded-full transition-colors relative", allowMemberPosts ? "bg-brand-red" : "bg-white/10")}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", allowMemberPosts ? "left-7" : "left-1")} />
                  </button>
                </div>
              </div>
            </>
          )}

          {activeSettingsTab === "members" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red">Gestão de Membros</h3>
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setActiveMemberTab("active")}
                    className={cn(
                      "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors",
                      activeMemberTab === "active" ? "bg-brand-red text-black" : "text-white/40 hover:text-white"
                    )}
                  >
                    Ativos
                  </button>
                  <button
                    onClick={() => setActiveMemberTab("banned")}
                    className={cn(
                      "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors",
                      activeMemberTab === "banned" ? "bg-brand-red text-black" : "text-white/40 hover:text-white"
                    )}
                  >
                    Banidos
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input
                  type="text"
                  placeholder="Pesquisar membro..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                {activeMemberTab === "active" ? (
                  <>
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <img 
                            src={member.avatar} 
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-sm">{member.name}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                              {member.role === 'admin' ? 'Administrador' : member.role === 'sub-admin' ? 'Sub-Administrador' : 'Membro'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {canChangeRoles && member.id !== "1" && (
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeRole(member.id, e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-lg text-xs font-bold px-2 py-1.5 focus:outline-none focus:border-gray-400 transition-colors"
                            >
                              <option value="admin" className="bg-dark-bg">Admin</option>
                              <option value="sub-admin" className="bg-dark-bg">Sub-Admin</option>
                              <option value="member" className="bg-dark-bg">Membro</option>
                            </select>
                          )}
                          {member.id !== "1" && (
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredMembers.length === 0 && (
                      <p className="text-center text-xs text-white/40 py-4">Nenhum membro encontrado.</p>
                    )}
                  </>
                ) : (
                  <>
                    {filteredBannedMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <img 
                            src={member.avatar} 
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover opacity-50 grayscale"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-sm text-white/60 line-through">{member.name}</p>
                            <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">
                              {member.reason}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleUnbanMember(member.id)}
                          className="px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
                        >
                          Desbanir
                        </button>
                      </div>
                    ))}
                    {filteredBannedMembers.length === 0 && (
                      <p className="text-center text-xs text-white/40 py-4">Nenhum membro banido encontrado.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeSettingsTab === "challenges" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red">Criar Novo Desafio</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Título</label>
                  <input
                    type="text"
                    value={newChallengeTitle}
                    onChange={(e) => setNewChallengeTitle(e.target.value)}
                    placeholder="Ex: Maratona de Supino"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Descrição</label>
                  <textarea
                    value={newChallengeDesc}
                    onChange={(e) => setNewChallengeDesc(e.target.value)}
                    placeholder="Ex: Levante um total de 5000kg no Supino Reto."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Dificuldade</label>
                    <select
                      value={newChallengeDifficulty}
                      onChange={(e) => setNewChallengeDifficulty(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    >
                      <option value="easy" className="bg-dark-bg">Fácil</option>
                      <option value="medium" className="bg-dark-bg">Médio</option>
                      <option value="hard" className="bg-dark-bg">Difícil</option>
                      <option value="epic" className="bg-dark-bg">Épico</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Duração (Dias)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={newChallengeDuration}
                      onChange={(e) => setNewChallengeDuration(parseInt(e.target.value) || 1)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Meta (Quantidade)</label>
                  <input
                    type="number"
                    min="1"
                    value={newChallengeGoal}
                    onChange={(e) => setNewChallengeGoal(parseInt(e.target.value) || 1)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>

                <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-red">Recompensa Estimada</p>
                    <p className="text-xs text-brand-red/60">Baseada na dificuldade e duração</p>
                  </div>
                  <div className="flex items-center gap-1 text-brand-red font-bold text-lg">
                    <Sparkles size={18} />
                    <span>{calculateChallengeXP(newChallengeDifficulty, newChallengeDuration)} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!newChallengeTitle || !newChallengeDesc) {
                      toast.error("Preencha o título e a descrição do desafio.");
                      return;
                    }
                    toast.success("Desafio criado com sucesso!");
                    setNewChallengeTitle("");
                    setNewChallengeDesc("");
                  }}
                  className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                >
                  Criar Desafio
                </button>
              </div>
            </div>
          )}

          {activeSettingsTab === "general" && canDeleteCommunity && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">Zona de Perigo</h3>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Excluir Comunidade"
                )}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-dark-surface sticky bottom-0">
          <button
            onClick={handleUpdate}
            disabled={!name.trim() || !description.trim() || isSubmitting}
            className="w-full py-4 bg-brand-red text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Salvar Alterações"
            )}
          </button>
        </div>
      </motion.div>

      {/* Ban Member Modal */}
      <AnimatePresence>
        {memberToBan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setMemberToBan(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-dark-surface rounded-3xl overflow-hidden flex flex-col border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5 flex items-center gap-3 text-red-500">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Ban size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Banir Membro</h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    {memberToBan.name}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Motivo do Banimento
                  </label>
                  <select
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
                  >
                    <option value="spam" className="bg-dark-bg">Spam ou Autopromoção</option>
                    <option value="inappropriate" className="bg-dark-bg">Comportamento Inadequado</option>
                    <option value="rules" className="bg-dark-bg">Violação das Regras</option>
                    <option value="other" className="bg-dark-bg">Outro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Detalhes (Opcional)
                  </label>
                  <textarea
                    value={banDetails}
                    onChange={(e) => setBanDetails(e.target.value)}
                    placeholder="Adicione notas sobre o banimento..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none h-20"
                  />
                </div>

                <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={deletePosts}
                      onChange={(e) => setDeletePosts(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 text-brand-red focus:ring-brand-red bg-dark-bg"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-500">Excluir postagens recentes</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
                      Remove os posts dos últimos 7 dias
                    </p>
                  </div>
                </label>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={() => setMemberToBan(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors text-white/60"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmBan}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  Confirmar Banimento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CreateCommunityModal: React.FC<{
  onClose: () => void;
  api: any;
  onCommunityCreated: (c: Community) => void;
}> = ({ onClose, api, onCommunityCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const newComm = await api.createCommunity(name, description);
      if (newComm) {
        onCommunityCreated(newComm);
      }
      onClose();
    } catch (error) {
      console.error("Failed to create community:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-dark-surface rounded-3xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold">Criar Comunidade</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">
              Nome da Comunidade
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corredores de Elite"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sobre o que é esta comunidade?"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !description.trim() || isSubmitting}
            className="w-full py-4 bg-brand-red text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Criar Comunidade"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
