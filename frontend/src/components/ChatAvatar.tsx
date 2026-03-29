"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type ChatAvatarMode = "idle" | "listening" | "speaking";

type ChatAvatarProps = {
  size?: number;
  mode?: ChatAvatarMode;
  active?: boolean;
  hoverable?: boolean;
  className?: string;
};

const avatarSrc = process.env.NEXT_PUBLIC_CHATBOT_AVATAR || "/images/chatbot-founder.png";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function ChatAvatar({
  size = 64,
  mode = "idle",
  active = false,
  hoverable = true,
  className,
}: ChatAvatarProps) {
  const isSpeaking = mode === "speaking";

  return (
    <motion.div
      className={cn("relative isolate", className)}
      animate={{
        y: [0, -4, 0],
        rotate: isSpeaking ? [0, -1.2, 1.2, 0] : [0, -0.6, 0.6, 0],
        scale: active ? 1.02 : 1,
      }}
      transition={{
        duration: isSpeaking ? 1.1 : 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={hoverable ? { scale: 1.05 } : undefined}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-[-10%] rounded-full bg-cyan-300/25 blur-xl"
        animate={{ opacity: active ? [0.25, 0.65, 0.25] : [0.12, 0.28, 0.12] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative h-full w-full overflow-hidden rounded-full border-2 border-white/90 bg-white ring-1 ring-slate-200/80"
        animate={{
          boxShadow: isSpeaking
            ? [
                "0 16px 36px rgba(79,70,229,0.26)",
                "0 22px 52px rgba(34,211,238,0.32)",
                "0 16px 36px rgba(79,70,229,0.26)",
              ]
            : [
                "0 14px 30px rgba(79,70,229,0.18)",
                "0 18px 38px rgba(59,130,246,0.22)",
                "0 14px 30px rgba(79,70,229,0.18)",
              ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.85),transparent_38%),linear-gradient(180deg,rgba(238,246,255,0.65),rgba(219,234,254,0.45))]" />
        <Image
          src={avatarSrc}
          alt="LKD Classes assistant avatar"
          fill
          sizes={`${size}px`}
          className="object-cover object-center scale-[1.02]"
          priority={size >= 80}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-white/30"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.span
        className="absolute -right-0.5 -top-0.5 z-40 h-4 w-4 rounded-full border-2 border-white bg-emerald-500"
        animate={{ scale: [1, 1.14, 1], opacity: [0.82, 1, 0.82] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export type { ChatAvatarMode, ChatAvatarProps };
