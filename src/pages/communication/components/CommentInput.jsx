import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CommentInput = ({
  onSubmit,
  placeholder = "说点什么...",
  buttonText = "发表",
  autoFocus = false,
  onCancel,
  currentUser
}) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
    setIsFocused(false);
    if (onCancel) onCancel();
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter 发送
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-4 w-full pt-2 pb-4">
      {/* Current User Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
          {currentUser?.username?.[0] || 'U'}
        </div>
      </div>

      <div className="flex-grow">
        <div 
          className={`
            relative rounded-md transition-all duration-300 bg-gray-50 border
            ${isFocused ? 'bg-white border-brand-primary ring-1 ring-brand-primary' : 'border-gray-200 hover:border-gray-300 hover:bg-white'}
          `}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              if (!text) setIsFocused(false);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent p-3 text-sm text-brand-text placeholder-gray-400 outline-none resize-none min-h-[60px] rounded-md"
            rows={isFocused || text ? 3 : 1}
          />
        </div>
        
        <AnimatePresence>
          {(isFocused || text) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between items-center mt-2 overflow-hidden"
            >
              <span className="text-xs text-gray-400">
                Ctrl + Enter 快速发送
              </span>
              <div className="flex gap-3">
                {onCancel && (
                  <button 
                    onClick={onCancel}
                    className="px-4 py-1.5 text-sm text-gray-500 hover:text-brand-primary transition-colors"
                  >
                    取消
                  </button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className={`
                    px-6 py-1.5 rounded text-sm font-medium transition-colors shadow-sm
                    ${text.trim() 
                      ? 'bg-brand-primary text-white hover:bg-brand-primary-hover' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  {buttonText}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentInput;
