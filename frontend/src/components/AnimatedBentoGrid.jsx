import React from 'react';
import { motion } from 'motion/react';
import { staggerContainer } from '../utils/motionPresets';
import MagicBento from './MagicBento';

const AnimatedBentoGrid = ({ cards, ...props }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={staggerContainer}
      style={{ width: '100%' }}
    >
      <MagicBento cards={cards} {...props} />
    </motion.div>
  );
};

export default AnimatedBentoGrid;
