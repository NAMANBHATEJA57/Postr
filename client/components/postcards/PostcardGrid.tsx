import { motion } from "framer-motion";
import type { ApiPostcardResponse } from "@/types/postcard";
import PostcardCard from "./PostcardCard";

interface PostcardGridProps {
  emptyTitle: string;
  emptyCopy: string;
  postcards: ApiPostcardResponse[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function PostcardGrid({ emptyTitle, emptyCopy, postcards }: PostcardGridProps) {
  if (!postcards.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#d8cbc0] bg-white/60 px-8 py-16 text-center">
        <h2 className="font-serif text-[2rem] text-[#1a1a1a]">{emptyTitle}</h2>
        <p className="mx-auto mt-3 max-w-[420px] font-sans text-[15px] leading-7 text-[#63574e]">
          {emptyCopy}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {postcards.map((postcard) => (
        <motion.div key={postcard.id} variants={itemVariants}>
          <PostcardCard postcard={postcard} />
        </motion.div>
      ))}
    </motion.div>
  );
}
