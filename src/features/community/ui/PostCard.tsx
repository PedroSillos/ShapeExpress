import React, { useState, useEffect } from "react";
import { Flame, Heart, MessageSquare, Share2, ChevronRight, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../../../utils/cn";
import { Post } from "../../../domain/entities";

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  api: any;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, api }) => {
  const [topComments, setTopComments] = useState<any[]>([]);

  useEffect(() => {
    if (post.commentsCount > 0) {
      api
        .getPostComments(post.id)
        .then((res: any) => setTopComments(res.slice(0, 3)))
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
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
        <button className="text-white/20 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="px-4 pb-4">
        <p className="text-sm text-white/80 leading-relaxed">{post.content.text}</p>
        {post.content.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-white/5">
            <img src={post.content.imageUrl} className="w-full h-auto" referrerPolicy="no-referrer" />
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
          className={cn("flex items-center gap-2 transition-colors group", post.likedByMe ? "text-brand-red" : "text-white/40 hover:text-brand-red")}
        >
          <Heart size={18} className={cn("group-active:scale-125 transition-transform", post.likedByMe && "fill-current")} />
          <span className="text-xs font-bold">{post.likesCount}</span>
        </button>
        <button onClick={onComment} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
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
              <img src={comment.userAvatar} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1 bg-white/5 rounded-xl p-2 text-sm">
                <p className="font-bold text-xs">{comment.userName}</p>
                <p className="text-white/80 text-xs">{comment.text}</p>
              </div>
            </div>
          ))}
          {post.commentsCount > 3 && (
            <button onClick={onComment} className="text-xs text-brand-red font-bold hover:underline">
              Ver todos os {post.commentsCount} comentários
            </button>
          )}
        </div>
      )}
    </div>
  );
};
