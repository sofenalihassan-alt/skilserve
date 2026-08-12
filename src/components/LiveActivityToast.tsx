import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

const categories = [
  "Plumber", "Electrician", "Carpenter", "Painter",
  "Cleaner", "HVAC Technician", "Landscaper", "Handyman",
];

const cities = [
  "Bhakkar", "Lahore", "Islamabad", "Karachi", "Faisalabad",
  "Rawalpindi", "Multan", "Peshawar", "Quetta", "Sialkot",
];

const timeLabels = [
  "just now", "2 mins ago", "5 mins ago", "8 mins ago", "10 mins ago", "12 mins ago",
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const LiveActivityToast = () => {
  const [activity, setActivity] = useState<{ text: string; id: number } | null>(null);

  const generate = useCallback(() => {
    const text = `${pick(categories)} booked in ${pick(cities)} ${pick(timeLabels)}`;
    setActivity({ text, id: Date.now() });
    // Auto-hide after 4s
    setTimeout(() => setActivity(null), 4000);
  }, []);

  useEffect(() => {
    // First one after 5s
    const initial = setTimeout(generate, 5000);
    // Then every 8-12s
    const interval = setInterval(generate, 8000 + Math.random() * 4000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [generate]);

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <AnimatePresence>
        {activity && (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mx-auto mb-4 flex w-full max-w-2xl items-center gap-3 rounded-xl border border-border/60 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 shrink-0">
              <Zap className="h-4 w-4 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-foreground leading-snug">
              {activity.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
