import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageSquare, Trash2 } from 'lucide-react';
import CommentInput from './CommentInput';
import { Modal } from 'antd';

const CommentItem = ({ 
  comment, 
  onReply, 
  onLike,
  onDelete,
  parentId,
  currentUser
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);

  const isSubComment = !!parentId;
  
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
    return count || 0;
  };

  // Handlers
  const handleLike = () => onLike(comment.id);
  
  const handleToggleReply = () => setShowReplyInput(!showReplyInput);
  
  const handleSubmitReply = (text) => {
    const replyToUser = isSubComment ? {
      id: comment.owner_id,
      name: comment.owner_name
    } : undefined;
    
    onReply(parentId || comment.id, text, replyToUser);
    setShowReplyInput(false);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除该评论？',
      content: '删除后将无法恢复',
      okText: '确认',
      cancelText: '取消',
      onOk: () => onDelete(comment.id),
    });
  };

  // 判断是否是作者或管理员
  const isAuthor = currentUser?.userId === comment.owner_id;
  const isAdmin = currentUser?.username === "root" || ["ADMIN", "ROOT", "SUPER_ADMIN"].includes(currentUser?.role);
  const canDelete = isAuthor || isAdmin;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex gap-4 ${isSubComment ? 'mt-3 mb-2' : 'mb-6'} w-full`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 cursor-pointer">
        <div 
          className={`${isSubComment ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} rounded bg-brand-gray flex items-center justify-center text-brand-text-secondary font-bold`}
        >
          {comment.owner_name?.[0] || '?'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <div className="flex flex-col">
          {/* Header: Name */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium text-brand-text-secondary cursor-pointer hover:text-brand-primary transition-colors ${isSubComment ? 'text-xs' : 'text-sm'}`}>
              {comment.owner_name || '匿名用户'}
            </span>
          </div>

          {/* Body: Text */}
          <div className="text-sm text-brand-text leading-relaxed break-words">
            {comment.replyTo && (
              <span className="mr-2">
                回复 <span className="text-brand-primary hover:underline cursor-pointer">@{comment.replyTo.name}</span> :
              </span>
            )}
            {comment.content}
          </div>

          {/* Footer: Meta & Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs text-brand-text-secondary">
            <span>{formatTimeAgo(comment.created_at)}</span>
            
            <div className="flex items-center gap-1 cursor-pointer group/like" onClick={handleLike}>
              <motion.div
                whileTap={{ scale: 0.8 }}
                animate={{ scale: comment.isLiked ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.2 }}
              >
                <ThumbsUp 
                  size={14} 
                  className={`transition-colors ${comment.isLiked ? 'text-brand-primary fill-brand-primary' : 'group-hover/like:text-brand-primary'}`}
                />
              </motion.div>
              <span className={`${comment.isLiked ? 'text-brand-primary' : ''}`}>
                {formatCount(comment.like_count)}
              </span>
            </div>

            <div 
              className="flex items-center gap-1 cursor-pointer hover:text-brand-primary transition-colors"
              onClick={handleToggleReply}
            >
              <MessageSquare size={14} />
              <span>回复</span>
            </div>
            
            {canDelete && (
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors"
                onClick={handleDelete}
              >
                <Trash2 size={14} />
                <span>删除</span>
              </div>
            )}
          </div>

          {/* Reply Input */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <CommentInput 
                  onSubmit={handleSubmitReply}
                  placeholder={`回复 @${comment.owner_name || '匿名用户'}`}
                  autoFocus
                  onCancel={() => setShowReplyInput(false)}
                  currentUser={currentUser}
                  buttonText="回复"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  parentId={parentId || comment.id}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommentItem;
