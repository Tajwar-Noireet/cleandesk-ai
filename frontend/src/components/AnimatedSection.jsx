import React from 'react';
import { motion } from 'motion/react';
import { fadeUp } from '../utils/motionPresets';

const AnimatedSection = ({
  children,
  className = '',
  id,
  delay = 0,
  viewportMargin = '-80px'
}) => {
  const customVariants = {
    ...fadeUp,
    visible: {
      ...fadeUp.visible,
      transition: {
        ...fadeUp.visible.transition,
        delay
      }
    }
  };

  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      variants={customVariants}
    >
      {children}
    </motion.section>
  );
};

export default AnimatedSection;
