import React, { useState, useCallback } from 'react';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import { createComment, likeComment, deleteComment } from '../../../api/communication';

const CommentList = ({ postId, initialComments, currentUser }) => {
  const [comments, setComments] = useState(initialComments);
  const [sortType, setSortType] = useState('hot');

  // Helper to recursively find and update a comment
  const updateCommentTree = useCallback((list, id, updateFn) => {
    return list.map(c => {
      if (c.id === id) return updateFn(c);
      if (c.replies) {
        return { ...c, replies: updateCommentTree(c.replies, id, updateFn) };
      }
      return c;
    });
  }, []);

  const handleLike = useCallback(async (commentId) => {
    try {
      await likeComment(commentId);
      setComments(prev => updateCommentTree(prev, commentId, (c) => ({
        ...c,
        isLiked: !c.isLiked,
        like_count: c.isLiked ? (c.like_count || 0) - 1 : (c.like_count || 0) + 1
      })));
    } catch (error) {
      console.error('点赞失败:', error);
    }
  }, [updateCommentTree]);

  const handleAddComment = useCallback(async (text) => {
    try {
      const params = {
        content: text,
        owner_id: currentUser?.userId,
        post_id: postId,
      };
      
      await createComment(params);
      
      // 创建新评论对象
      const newComment = {
        id: Date.now(),
        content: text,
        owner_id: currentUser?.userId,
        owner_name: currentUser?.username,
        created_at: new Date().toISOString(),
        like_count: 0,
        isLiked: false,
        replies: []
      };
      
      setComments(prev => [newComment, ...prev]);
    } catch (error) {
      console.error('发表评论失败:', error);
    }
  }, [currentUser, postId]);

  const handleReply = useCallback(async (parentId, text, replyToUser) => {
    try {
      const params = {
        content: text,
        owner_id: currentUser?.userId,
        post_id: postId,
        parent_comment_id: parentId,
      };
      
      if (replyToUser) {
        params.answer_id = replyToUser.id;
        params.answer_name = replyToUser.name;
      }
      
      await createComment(params);
      
      const newReply = {
        id: Date.now(),
        content: text,
        owner_id: currentUser?.userId,
        owner_name: currentUser?.username,
        created_at: new Date().toISOString(),
        like_count: 0,
        isLiked: false,
        replyTo: replyToUser,
      };

      setComments(prev => {
        return prev.map(c => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply]
            };
          }
          return c;
        });
      });
    } catch (error) {
      console.error('回复失败:', error);
    }
  }, [currentUser, postId]);

  const handleDelete = useCallback(async (commentId) => {
    try {
      await deleteComment(commentId);
      
      // 递归删除评论
      const removeComment = (list) => {
        return list.filter(c => {
          if (c.id === commentId) return false;
          if (c.replies) {
            c.replies = removeComment(c.replies);
          }
          return true;
        });
      };
      
      setComments(prev => removeComment(prev));
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  }, []);

  // Sorting logic
  const sortedComments = [...comments].sort((a, b) => {
    if (sortType === 'hot') return (b.like_count || 0) - (a.like_count || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="w-full">
      {/* Top Input */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-brand-text">
          评论 <span className="text-brand-text-secondary text-sm font-normal">{comments.length}</span>
        </h3>
        
        {/* Sort Tabs */}
        <div className="flex gap-6 mb-4 border-b border-gray-100 pb-2">
          <button 
            className={`text-sm font-medium transition-colors ${sortType === 'hot' ? 'text-brand-primary border-b-2 border-brand-primary -mb-2.5 pb-2' : 'text-brand-text-secondary hover:text-brand-primary'}`}
            onClick={() => setSortType('hot')}
          >
            按热度
          </button>
          <button 
            className={`text-sm font-medium transition-colors ${sortType === 'new' ? 'text-brand-primary border-b-2 border-brand-primary -mb-2.5 pb-2' : 'text-brand-text-secondary hover:text-brand-primary'}`}
            onClick={() => setSortType('new')}
          >
            按时间
          </button>
        </div>

        <CommentInput 
          onSubmit={handleAddComment} 
          currentUser={currentUser}
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {sortedComments.map(comment => (
          <div key={comment.id} className="border-b border-gray-100 last:border-0">
            <CommentItem 
              comment={comment}
              onLike={handleLike}
              onReply={handleReply}
              onDelete={handleDelete}
              currentUser={currentUser}
            />
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            暂无评论，快来发表第一条评论吧！
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList;
