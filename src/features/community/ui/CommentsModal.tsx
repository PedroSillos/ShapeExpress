import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Post } from "../../../domain/entities";

interface CommentsModalProps {
  post: Post;
  onClose: () => void;
  api: any;
  userProfile: any;
  onCommentAdded?: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ post, onClose, api, userProfile, onCommentAdded }) => {
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
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/40">
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
              <p className="text-sm text-white/20">Nenhum comentário ainda. Seja o primeiro!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img src={comment.userAvatar} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold">{comment.userName}</p>
                    <p className="text-[10px] text-white/40">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ptBR })}
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
