import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Poll = ({ poll: initialPoll, onVote }) => {
  const [poll, setPoll] = useState(initialPoll);
  const [hasVoted, setHasVoted] = useState(!!initialPoll?.votedOptionId);

  // 防御性检查
  if (!poll || !poll.options || poll.options.length === 0) {
    return null;
  }

  const handleVote = async (optionId) => {
    if (hasVoted) return;

    // 乐观更新
    setPoll(prev => ({
      ...prev,
      totalVotes: prev.totalVotes + 1,
      votedOptionId: optionId,
      options: prev.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    }));
    setHasVoted(true);

    // 调用后端接口
    if (onVote) {
      try {
        await onVote(poll.id, optionId);
      } catch (error) {
        console.error('投票失败:', error);
        // 回滚
        setPoll(initialPoll);
        setHasVoted(false);
      }
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 mt-3 border border-gray-100">
      {poll.title && (
        <h4 className="font-semibold text-brand-text mb-3">{poll.title}</h4>
      )}
      
      <div className="space-y-2">
        {poll.options.map(option => {
          const percent = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;
          
          const isSelected = poll.votedOptionId === option.id;

          return (
            <div 
              key={option.id}
              onClick={() => handleVote(option.id)}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 ${!hasVoted ? 'cursor-pointer hover:bg-gray-100 border border-gray-200 hover:border-brand-primary/50' : 'cursor-default border border-transparent'}`}
            >
              {/* Background Progress Bar */}
              {hasVoted && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 opacity-20 ${isSelected ? 'bg-brand-primary' : 'bg-gray-400'}`}
                />
              )}

              <div className="relative p-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isSelected ? 'text-brand-primary' : 'text-brand-text'}`}>
                    {option.text}
                  </span>
                  {isSelected && <Check size={16} className="text-brand-primary" />}
                </div>
                
                {hasVoted && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-sm font-bold ${isSelected ? 'text-brand-primary' : 'text-gray-500'}`}
                  >
                    {percent}%
                  </motion.span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 text-xs text-brand-text-secondary text-right">
        {poll.totalVotes} 人参与
      </div>
    </div>
  );
};

export default Poll;
