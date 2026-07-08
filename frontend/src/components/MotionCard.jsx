import React from 'react';
import { motion } from 'motion/react';
import { hoverLift, tapScale } from '../utils/motionPresets';

const MotionCard = ({
  children,
  className = '',
  style = {},
  onClick,
  layoutId,
  animateOnHover = true,
  animateOnTap = true,
  ...props
}) => {
  const isClickable = typeof onClick === 'function';

  const handleKeyDown = (e) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <motion.div
      className={`motion-card ${className} ${isClickable ? 'clickable-motion-card' : ''}`}
      style={style}
      layoutId={layoutId}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      whileHover={animateOnHover ? hoverLift : undefined}
      whileTap={animateOnTap ? tapScale : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;
