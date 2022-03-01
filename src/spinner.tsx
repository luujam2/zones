import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const SemiCircle = styled(motion.div)`
  width: 100px;
  height: 100px;
  border-top: 1.1em solid white;
  border-right: 1.1em solid white;
  border-bottom: 1.1em solid white;
  border-radius: 50%;
  border-left: 1.1em solid black;
`;

export default () => {
  return (
    <SemiCircle
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 1,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 0.2,
      }}
    />
  );
};
