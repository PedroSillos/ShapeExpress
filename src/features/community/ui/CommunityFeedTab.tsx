import React from "react";
import { motion } from "motion/react";
import { Image as ImageIcon, X } from "lucide-react";
import { cn } from "../../../utils/cn";
import { Post, UserProfile } from "../../../domain/entities";
import { PostCard } from "./PostCard";

interface CommunityFeedTabProps {
  posts: Post[];
  userProfile: UserProfile | null;
  feedFilter: "global" | "following";
  newPostText: string;
  postImageUrl: string | null;
  isPosting: boolean;
  api: any;
  onFilterChange: (f: "global" | "following") => void;
  onPostTextChange: (t: string) => void;
  onPostImageClear: () => void;
  onPost: () => void;
  onLike: (id: string) => void;
  onComment: (post: Post) => void;
  onImageUpload: (file: File) => void;
}

export const CommunityFeedTab: React.FC<CommunityFeedTabProps> = ({
  posts, userProfile, feedFilter, newPostText, postImageUrl, isPosting, api,
  onFilterChange, onPostTextChange, onPostImageClear, onPost, onLike, onComment, onImageUpload,
}) => (
  <motion.div
    key="feed"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="p-6 space-y-6"
  >
    <div className="flex bg-white/5 p-1 rounded-xl w-fit">
      {(["global", "following"] as const).map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={cn(
            "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
            feedFilter === f ? "bg-brand-red text-black" : "text-white/40",
          )}
        >
          {f === "global" ? "Global" : "Seguindo"}
        </button>
      ))}
    </div>

    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
      <div className="flex gap-3">
        <img src={userProfile?.avatarUrl} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
        <div className="flex-1 space-y-4">
          <textarea
            value={newPostText}
            onChange={(e) => onPostTextChange(e.target.value)}
            placeholder="O que você treinou hoje?"
            className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none h-20 placeholder:text-white/20"
          />
          {postImageUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
              <img src={postImageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button
                onClick={onPostImageClear}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-brand-red transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <div className="relative">
          <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
            <ImageIcon size={18} />
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImageUpload(f); }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <button
          onClick={onPost}
          disabled={isPosting || (!newPostText.trim() && !postImageUrl)}
          className="px-6 py-2 bg-brand-red rounded-xl text-black font-bold text-xs disabled:opacity-50 active:scale-95 transition-transform"
        >
          {isPosting ? "Postando..." : "Postar"}
        </button>
      </div>
    </div>

    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={() => onLike(post.id)} onComment={() => onComment(post)} api={api} />
      ))}
    </div>
  </motion.div>
);
