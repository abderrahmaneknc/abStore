import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedCounter({ value, formatValue }) {
  const springValue = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  const displayValue = useTransform(springValue, (current) => {
    const rounded = Math.round(current);
    return formatValue ? formatValue(rounded) : rounded;
  });

  return (
    <motion.span>{displayValue}</motion.span>
  );
}
