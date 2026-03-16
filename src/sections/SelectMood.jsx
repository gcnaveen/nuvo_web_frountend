import React, { useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const MOODS = [
  {
    id: "haldi",
    type: "Haldi",
    name: "Golden Glow Gala",
    desc: "A sunlit celebration drenched in turmeric and tradition — where joy radiates from every corner.",
    image: "/assets/moods/haldi.jpg",
    accent: "#c9a87c",
  },
  {
    id: "mehendi",
    type: "Mehendi",
    name: "Mehendi Opulence",
    desc: "Intricate patterns, lush florals, and an evening that weaves heritage into every detail.",
    image: "/assets/moods/mehendi.jpg",
    accent: "#7a5c40",
  },
  {
    id: "carnival",
    type: "Carnival",
    name: "Regal Revelry",
    desc: "Bold, electric, and unapologetically festive — a carnival staged with regal precision.",
    image: "/assets/moods/carnival.jpg",
    accent: "#2a1a0e",
  },
  {
    id: "entertainment",
    type: "Entertainment",
    name: "Lumière Leisure",
    desc: "Where lights, laughter, and leisure converge into an experience of effortless glamour.",
    image: "/assets/moods/entertainment.jpg",
    accent: "#7a5c40",
  },
  {
    id: "south-wedding",
    type: "South Indian Wedding",
    name: "Kalyana Vaibhogam",
    desc: "Sacred rituals elevated by impeccable grace — honouring every moment with cultural reverence.",
    image: "/assets/moods/south-wedding.jpg",
    accent: "#c9a87c",
  },
  {
    id: "north-wedding",
    type: "North Indian Wedding",
    name: "The Grand Baraat",
    desc: "Opulent processions, exuberant celebrations, and hosts who keep the magic flowing all night.",
    image: "/assets/moods/north-wedding.jpg",
    accent: "#2a1a0e",
  },
  {
    id: "corporate",
    type: "Corporate Event",
    name: "The Executive Soirée",
    desc: "Refined, purposeful, and polished — staffing that upholds your brand at the highest level.",
    image: "/assets/moods/corporate.jpg",
    accent: "#3d2510",
  },
  {
    id: "launch",
    type: "Launch Event",
    name: "The Debut Affair",
    desc: "First impressions are everything — our hosts ensure yours is nothing short of unforgettable.",
    image: "/assets/moods/launch.jpg",
    accent: "#7a5c40",
  },
];

/* ── Individual card ── */
const MoodCard = ({ mood, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      ref={ref}
      className="shrink-0 flex flex-col cursor-pointer group"
      style={{ width: "clamp(240px, 28vw, 340px)" }}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${mood.name}`}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden rounded-sm"
        style={{ aspectRatio: "3/4" }}
      >
        {/* Fallback bg if image missing */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#e8e0d4" }}
        />
        <motion.img
          src={mood.image}
          alt={mood.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Gradient scrim */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(42,26,14,0.55) 0%, transparent 50%)",
          }}
        />

        {/* Type pill — top left */}
        {/* <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-sm"
          style={{ backgroundColor: "rgba(245,240,232,0.9)" }}
        >
          <p
            className="text-[10px] tracking-[0.18em] uppercase text-[#2a1a0e]"
          >
            {mood.type}
          </p>
        </div> */}

        {/* Index number — bottom right */}
        <div className="absolute bottom-3 right-3">
          <p
            className="text-3xl font-black leading-none"
            style={{
              color: "rgba(245,240,232,0.25)",
              letterSpacing: "-0.04em",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Text block below image */}
      <div className="pt-4 pb-2 px-1 flex flex-col gap-1.5">
        <h3
          className="font-black uppercase leading-tight text-[#2a1a0e]"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            letterSpacing: "-0.015em",
          }}
        >
          {mood.name}
        </h3>
        <p
          className="text-xs sm:text-sm leading-relaxed text-[#5a3d22]/70"
        >
          {mood.desc}
        </p>
      </div>

      {/* Bottom border that grows on hover */}
      <motion.div
        className="h-px mt-2"
        style={{ backgroundColor: "#2a1a0e" }}
        animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.article>
  );
};

/* ── Scroll track ── */
const SelectMood = () => {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <div className="relative mt-10 sm:mt-14">

      {/* Arrow buttons */}
      {["left", "right"].map((dir) => (
        <motion.button
          key={dir}
          type="button"
          onClick={() => scroll(dir === "right" ? 1 : -1)}
          className={`absolute top-[38%] z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full cursor-pointer focus:outline-none
            ${dir === "left" ? "left-3" : "right-3"}`}
          style={{ backgroundColor: "#2a1a0e", color: "#f0e8de" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          aria-label={`Scroll ${dir}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </motion.button>
      ))}

      {/* Scroll track */}
      <div
        ref={trackRef}
        className="flex gap-5 sm:gap-7 overflow-x-auto pb-12 sm:pb-16 px-4 sm:px-8 lg:px-16 xl:px-24 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Hide scrollbar in webkit */}
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

        {MOODS.map((mood, i) => (
          <MoodCard key={mood.id} mood={mood} index={i} />
        ))}

        {/* End spacer */}
        <div className="shrink-0 w-4 sm:w-8 lg:w-16 xl:w-24" aria-hidden="true" />
      </div>

      {/* Scroll progress indicator */}
      <div
        className="absolute bottom-4 left-4 sm:left-8 lg:left-16 xl:left-24 right-4 sm:right-8 lg:right-16 xl:right-24 h-px"
        style={{ backgroundColor: "#ddd5c8" }}
      >
        <motion.div
          className="h-full origin-left"
          style={{ backgroundColor: "#2a1a0e", scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Scroll hint — mobile */}
      <p
        className="md:hidden text-center text-xs tracking-widest uppercase text-[#7a5c40]/60 pb-2"
      >
        Swipe to explore →
      </p>

    </div>
  );
};

export default SelectMood;