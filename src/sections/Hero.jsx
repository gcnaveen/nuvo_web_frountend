import React from "react";
import { motion } from "motion/react";

const HERO_BG = "/assets/nuvo-bg-hero.png";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const headlineItem = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const subItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Hero section — full-bleed cinematic bg, dark overlay, NUVÓ-style layout.
 * Header is absolute/transparent so the hero fills the full viewport.
 * No paddingTop needed — content is vertically centred naturally.
 */
const Hero = ({
  tagline = "Because every event has a feeling.",
  headline = ["WE CREATE", "THE MOMENT", "YOU REMEMBER"],
  descriptor = "NUVÓ hosts and hostesses bring energy, etiquette, and elegance—\nturning gatherings into experiences.",
}) => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-labelledby="hero-heading"
    >
      {/* ── Background image ── */}
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt=""
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
          draggable="false"
        />
        {/* Dark cinematic overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,8,8,0.55) 0%, rgba(10,8,8,0.38) 50%, rgba(10,8,8,0.62) 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* ── Content wrapper — fills full height, no top offset needed ── */}
      <div
        className="relative z-10 flex flex-col justify-between w-full"
        style={{ minHeight: "100svh" }}
      >
        {/* Main text block — left-aligned, vertically centred */}
        <motion.div
          className="flex-1 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-20 pt-24 sm:pt-28 pb-4"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Tagline */}
          <motion.p
            variants={subItem}
            className="mb-3 text-sm sm:text-base md:text-lg font-light tracking-wide"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            {tagline}
          </motion.p>

          {/* Staggered headline lines */}
          <div aria-label={headline.join(" ")} id="hero-heading">
            {headline.map((line, i) => (
              <motion.div key={i} variants={headlineItem}>
                <span
                  className="block font-black uppercase leading-none tracking-tight"
                  style={{
                    color: "rgba(255,255,255,0.97)",
                    fontSize: "clamp(2rem, 6vw, 5rem)",
                    letterSpacing: "-0.01em",
                    paddingLeft: `${i * 2.2}rem`,
                    textShadow: "0 2px 24px rgba(0,0,0,0.45)",
                  }}
                >
                  {line}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom descriptor — right-aligned */}
        <motion.div
          className="px-6 sm:px-10 md:px-16 lg:px-20 pb-10 sm:pb-14 flex justify-end"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={subItem}
            className="text-right max-w-sm sm:max-w-md text-sm sm:text-base md:text-lg leading-relaxed"
            style={{
              color: "rgba(255,255,255,0.90)",
              fontStyle: "italic",
              textShadow: "0 1px 12px rgba(0,0,0,0.5)",
              whiteSpace: "pre-line",
            }}
          >
            {descriptor}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;