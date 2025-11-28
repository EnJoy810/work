import { motion } from 'framer-motion';

const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  // 内联样式作为后备，确保样式一定生效
  const variantStyles = {
    primary: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)',
    },
    secondary: {
      backgroundColor: '#ffffff',
      color: '#0f172a',
      border: '2px solid #0f172a',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#0f172a',
      border: '1px solid #e2e8f0',
    },
    white: {
      backgroundColor: '#ffffff',
      color: '#0f172a',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    }
  };

  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
  };

  const baseStyle = {
    borderRadius: '9999px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s',
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={baseStyle}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
