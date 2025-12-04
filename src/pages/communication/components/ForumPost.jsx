import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageSquare, Trash2 } from 'lucide-react';
import CommentList from './CommentList';

const ForumPost = ({ post, currentUser, onDelete, onLike, onLoadComments, comments }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    if (onLike) {
      await onLike(post.id);
    }
  };

  const handleToggleComments = async () => {
    const newShow = !showComments;
    setShowComments(newShow);
    if (newShow && onLoadComments && !comments) {
      await onLoadComments(post.id);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return '刚刚';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const formatCount = (count) => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
  };

  const isAuthor = currentUser?.userId === post.owner_id;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-md shadow-sm hover:shadow border border-gray-100 transition-all duration-300 overflow-hidden mb-4"
    >
      <div className="p-6">
        {/* Header: Author Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-brand-gray flex items-center justify-center text-brand-text-secondary font-bold">
              {post.owner_name?.[0] || '?'}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-brand-text text-sm hover:text-brand-primary cursor-pointer transition-colors">
                {post.owner_name || '匿名用户'}
              </span>
              <span className="text-xs text-brand-text-secondary">
                {formatTimeAgo(post.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-brand-text mb-2 leading-snug">
            {post.title}
          </h2>
          <p className="text-brand-text text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-6 border-t border-gray-50 pt-4 mt-4">
          <button 
            onClick={handleLike}
            className="flex items-center gap-1.5 group outline-none"
          >
            <motion.div
              animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.2 }}
            >
              <ThumbsUp 
                size={18} 
                className={`transition-colors ${isLiked ? 'text-brand-primary fill-brand-primary' : 'text-gray-400 group-hover:text-brand-primary'}`} 
              />
            </motion.div>
            <span className={`text-sm ${isLiked ? 'text-brand-primary' : 'text-gray-400 group-hover:text-brand-primary'} transition-colors`}>
              {formatCount(likeCount)}
            </span>
          </button>

          <button 
            onClick={handleToggleComments}
            className={`flex items-center gap-1.5 group outline-none ${showComments ? 'text-brand-primary' : 'text-gray-400'}`}
          >
            <MessageSquare 
              size={18} 
              className="group-hover:text-brand-primary transition-colors" 
            />
            <span className="text-sm group-hover:text-brand-primary transition-colors">
              {showComments ? '收起' : '查看'}评论 ({comments?.length || 0})
            </span>
          </button>

          {isAuthor && onDelete && (
            <button onClick={onDelete} className="ml-auto text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm transition-colors">
              <Trash2 size={16} /> 删除
            </button>
          )}
        </div>

        {/* Comment Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <CommentList 
                postId={post.id}
                initialComments={comments || []} 
                currentUser={currentUser}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ForumPost;
