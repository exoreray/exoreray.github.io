import { motion } from 'framer-motion';

const Chapter = ({ children, id, className = "" }) => {
  return (
    <section
      id={id}
      className={`relative w-full min-h-screen flex items-center justify-center ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </section>
  );
};

export default Chapter;
