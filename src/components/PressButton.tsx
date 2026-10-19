import { motion, useReducedMotion } from 'framer-motion';
import { Button, type ButtonProps } from '@/components/ui/button';
import { forwardRef } from 'react';

const MotionButton = motion.create(Button);

export const PressButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const reducedMotion = useReducedMotion();
  return <MotionButton ref={ref} whileTap={reducedMotion || props.disabled ? undefined : { scale: 0.98 }} transition={{ type: 'spring', stiffness: 450, damping: 28 }} {...props} />;
});
PressButton.displayName = 'PressButton';