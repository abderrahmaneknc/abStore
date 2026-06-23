import { motion } from 'framer-motion';

export default function Skeleton({ className = '', style = {} }) {
  return (
    <motion.div
      className={`bg-gray-200 rounded-md ${className}`}
      style={style}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
