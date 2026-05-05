import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Post, Community, Challenge, UserChallenge, Ranking,
  CommunityMessage, UserProfile, UserStats, LeaderboardEntry,
} from "../../domain/entities";
import {
  CommunityHeader, CommunityTabs, CommunityListView,
  CommunityFeedTab, CommunityChallengesTab, CommunityRankingTab,
  CommunitySearchModal, CommentsModal, CreateCommunityModal, CommunitySettingsModal,
} from "../../features/community";

interface CommunityViewProps {
  userProfile: UserProfile | null;
  userStats: UserStats;
  api: any;
  communityMessages: CommunityMessage[];
  setCommunityMessages: React.Dispatch<React.SetStateAction<CommunityMessage[]>>;
  recommendedCommunities: Community[];
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  getLeaderboard: (league: string) => Promise<LeaderboardEntry[]>;
  initialTab?: "feed" | "challenges" | "ranking";
  initialRankingType?: "community" | "global" | "league" | "friends";
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  userProfile, userStats, api, posts, setPosts,
  initialTab = "feed",
}) => {
  const [activeTab, setActiveTab] = useState<"feed" | "challenges" | "ranking">(initialTab);
  const [feedFilter, setFeedFilter] = useState<"global" | "following">("global");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ users: any[]; communities: Community[] }>({ users: [], communities: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunityIds, setUserCommunityIds] = useState<string[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [ranking, setRanking] = useState<Ranking[]>([]);

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { if (activeTab === "feed") loadPosts(); }, [activeTab, feedFilter, activeCommunity]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, communitiesRes, challengesRes, userChallengesRes, userCommunitiesRes] = await Promise.all([
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
        setRanking(await api.getCommunityRanking(communitiesRes[0].id));
      }
    } catch (e) {
      console.error("Failed to load community data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPosts(await api.getPosts(activeCommunity?.id, feedFilter));
    } catch (e) {
      console.error("Failed to load posts:", e);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults({ users: [], communities: [] }); return; }
    setIsSearching(true);
    try {
      const [users, communities] = await Promise.all([api.searchUsers(q), api.searchCommunities(q)]);
      setSearchResults({ users, communities });
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCloseSearch = () => {
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults({ users: [], communities: [] });
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await api.joinCommunity(communityId);
      const updated = await api.getCommunities();
      setCommunities(updated);
      setUserCommunityIds((prev) => [...prev, communityId]);
      const found = updated.find((c: Community) => c.id === communityId);
      if (found) setActiveCommunity(found);
    } catch (e) {
      console.error("Failed to join community:", e);
    }
  };

  const handleFollowToggle = async (email: string, isFollowing?: boolean) => {
    try {
      isFollowing ? await api.unfollowUser(email) : await api.followUser(email);
      if (activeCommunity) setRanking(await api.getCommunityRanking(activeCommunity.id));
    } catch (e) {
      console.error("Error toggling follow:", e);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() && !postImageUrl) return;
    setIsPosting(true);
    try {
      const post = await api.createPost({
        type: postImageUrl ? "photo" : "text",
        content: { text: newPostText, ...(postImageUrl ? { imageUrl: postImageUrl } : {}) },
        communityId: activeCommunity?.id,
      });
      setPosts([post, ...posts]);
      setNewPostText("");
      setPostImageUrl(null);
    } catch (e) {
      console.error("Failed to create post:", e);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    setPosts((prev) => prev.map((p) => p.id !== postId ? p : {
      ...p, likesCount: p.likedByMe ? Math.max(0, p.likesCount - 1) : p.likesCount + 1, likedByMe: !p.likedByMe,
    }));
    try {
      await api.likePost(postId);
    } catch (e) {
      console.error("Failed to like post:", e);
      loadPosts();
    }
  };

  const handleCollectChallenge = async (challenge: Challenge) => {
    try {
      await api.updateChallengeProgress(challenge.id, challenge.goal, true);
      if (api.addXP) await api.addXP(challenge.rewardXp);
      setUserChallenges((prev) => prev.map((uc) => uc.challengeId === challenge.id ? { ...uc, collected: true } : uc));
      setNewPostText(`🏆 Completei o desafio "${challenge.title}" e ganhei ${challenge.rewardXp} XP! Quem vem comigo?`);
      setActiveTab("feed");
      toast.success(`Desafio coletado! +${challenge.rewardXp} XP`);
    } catch (e) {
      toast.error("Erro ao coletar recompensa: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleCancelChallenge = async (challenge: Challenge) => {
    try {
      if (api.cancelChallenge) await api.cancelChallenge(challenge.id);
      setUserChallenges((prev) => {
        const exists = prev.find((uc) => uc.challengeId === challenge.id);
        return exists
          ? prev.map((uc) => uc.challengeId === challenge.id ? { ...uc, cancelled: true } : uc)
          : [...prev, { userId: userProfile?.email || "", challengeId: challenge.id, progress: 0, completed: false, cancelled: true }];
      });
      toast.success("Desafio cancelado com sucesso.");
    } catch (e) {
      toast.error("Erro ao cancelar desafio: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Sincronizando Comunidade...</p>
      </div>
    </div>
  );

  const isMember = activeCommunity ? userCommunityIds.includes(activeCommunity.id) : false;

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-bg">
      <CommunityHeader
        activeCommunity={activeCommunity}
        onBack={() => setActiveCommunity(null)}
        onSettings={() => setShowSettingsModal(true)}
        onCreate={() => setShowCreateModal(true)}
        onSearch={() => setShowSearchModal(true)}
      />

      {activeCommunity && isMember && (
        <CommunityTabs activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {!activeCommunity || !isMember ? (
          <CommunityListView
            communities={communities}
            userCommunityIds={userCommunityIds}
            activeCommunity={activeCommunity}
            onSelect={setActiveCommunity}
            onJoin={handleJoinCommunity}
          />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "feed" && (
              <CommunityFeedTab
                key="feed"
                posts={posts}
                userProfile={userProfile}
                feedFilter={feedFilter}
                newPostText={newPostText}
                postImageUrl={postImageUrl}
                isPosting={isPosting}
                api={api}
                onFilterChange={setFeedFilter}
                onPostTextChange={setNewPostText}
                onPostImageClear={() => setPostImageUrl(null)}
                onPost={handleCreatePost}
                onLike={handleLikePost}
                onComment={setSelectedPost}
                onImageUpload={async (f) => { const r = await api.uploadImage(f); setPostImageUrl(r.url); }}
              />
            )}
            {activeTab === "challenges" && (
              <CommunityChallengesTab
                key="challenges"
                challenges={challenges}
                userChallenges={userChallenges}
                onCollect={handleCollectChallenge}
                onCancel={handleCancelChallenge}
              />
            )}
            {activeTab === "ranking" && (
              <CommunityRankingTab
                key="ranking"
                ranking={ranking}
                activeCommunity={activeCommunity}
                userProfile={userProfile}
                onFollowToggle={handleFollowToggle}
              />
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showSearchModal && (
          <CommunitySearchModal
            searchQuery={searchQuery}
            isSearching={isSearching}
            searchResults={searchResults}
            userProfile={userProfile}
            onSearch={handleSearch}
            onClose={handleCloseSearch}
            onJoin={handleJoinCommunity}
            onFollowToggle={handleFollowToggle}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <CommentsModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            api={api}
            userProfile={userProfile}
            onCommentAdded={() => setPosts(posts.map((p) => p.id === selectedPost.id ? { ...p, commentsCount: p.commentsCount + 1 } : p))}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && (
          <CreateCommunityModal
            onClose={() => setShowCreateModal(false)}
            api={api}
            onCommunityCreated={(c) => {
              setCommunities((prev) => [...prev, c]);
              setUserCommunityIds((prev) => [...prev, c.id]);
              setActiveCommunity(c);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettingsModal && activeCommunity && (
          <CommunitySettingsModal
            community={activeCommunity}
            onClose={() => setShowSettingsModal(false)}
            api={api}
            currentUserEmail={userProfile?.email || ""}
            onUpdate={(updated) => {
              setCommunities((prev) => prev.map((c) => c.id === updated.id ? updated : c));
              setActiveCommunity(updated);
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
