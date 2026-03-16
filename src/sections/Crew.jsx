import React, { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { WHATSAPP_URL } from "../constants/links";

const TIERS = [
  {
    id: "diamond",
    name: "Diamond",
    tagline: "Beyond Bespoke",
    special: true,
    quote:
      "Diamond personnel are curated on a bespoke basis and priced exclusively upon consultation.",
    traits: [],
    accent: "#e8d5b0",
    bg: "#2a1a0e",
    text: "#f0e8de",
    border: "rgba(201,168,124,0.5)",
    icon: "◆",
  },
  {
    id: "platinum",
    name: "Platinum",
    tagline: "The Pinnacle Standard",
    special: false,
    quote: null,
    traits: [
      "Exceptionally groomed",
      "Fluent English, etiquette & protocol trained",
      "Luxury weddings / HNI / international brand exposure",
      "Calm, confident, high-presence individuals",
    ],
    accent: "#b8c4cc",
    bg: "#f5f0e8",
    text: "#2a1a0e",
    border: "#ddd5c8",
    icon: "◈",
  },
  {
    id: "gold",
    name: "Gold",
    tagline: "Polished Excellence",
    special: false,
    quote: null,
    traits: [
      "Strong grooming & communication",
      "Experienced in premium weddings & curated events",
      "Graceful, polished presence",
    ],
    accent: "#c9a87c",
    bg: "#f5f0e8",
    text: "#2a1a0e",
    border: "#ddd5c8",
    icon: "◉",
  },
  {
    id: "silver",
    name: "Silver",
    tagline: "Refined & Reliable",
    special: false,
    quote: null,
    traits: [
      "Well-trained & presentable",
      "Functional multilingual",
      "Professional hospitality behaviour",
    ],
    accent: "#9aada0",
    bg: "#f5f0e8",
    text: "#2a1a0e",
    border: "#ddd5c8",
    icon: "◇",
  },
  {
    id: "bronze",
    name: "Bronze",
    tagline: "Dependable Foundation",
    special: false,
    quote: null,
    traits: [
      "Basic grooming & training",
      "Task-oriented roles",
      "Reliable manpower",
    ],
    accent: "#a07850",
    bg: "#f5f0e8",
    text: "#2a1a0e",
    border: "#ddd5c8",
    icon: "○",
  },
];

/* ── Reusable reveal ── */
const Reveal = ({ children, delay = 0, className = "", from = "bottom" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const initial =
    from === "left" ? { opacity: 0, x: -28 }
    : from === "right" ? { opacity: 0, x: 28 }
    : { opacity: 0, y: 24 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ── Diamond card (full-width dark) ── */
const DiamondCard = ({ tier, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className="col-span-1 md:col-span-2 lg:col-span-3 relative overflow-hidden"
      style={{ backgroundColor: tier.bg, border: `1px solid ${tier.border}` }}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background texture lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(201,168,124,0.3) 0px, rgba(201,168,124,0.3) 1px, transparent 1px, transparent 40px)",
        }}
      />

      <div className="relative p-7 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
        {/* Icon + name */}
        <div className="shrink-0 flex flex-col items-start gap-2">
          <span
            className="text-4xl sm:text-5xl"
            style={{ color: tier.accent }}
            aria-hidden="true"
          >
            {tier.icon}
          </span>
          <div>
            <p
              className="text-[10px] tracking-[0.28em] uppercase"
              style={{ color: "rgba(240,232,222,0.5)" }}
            >
              {tier.tagline}
            </p>
            <h3
              className="text-3xl sm:text-4xl font-black uppercase leading-none"
              style={{
                color: tier.accent,
                letterSpacing: "-0.02em",
              }}
            >
              {tier.name}
            </h3>
          </div>
        </div>

        {/* Divider */}
        <div
          className="hidden sm:block w-px self-stretch"
          style={{ backgroundColor: "rgba(201,168,124,0.2)" }}
        />

        {/* Quote */}
        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{
            color: "rgba(240,232,222,0.75)",
            fontStyle: "italic",
          }}
        >
          &ldquo;{tier.quote}&rdquo;
        </p>

        {/* CTA */}
        <motion.a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-start sm:self-center inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.18em] uppercase cursor-pointer"
          style={{
            border: `1px solid ${tier.accent}`,
            color: tier.accent,
            }}
          whileHover={{ backgroundColor: tier.accent, color: tier.bg }}
          transition={{ duration: 0.22 }}
        >
          Enquire
          <span aria-hidden="true">→</span>
        </motion.a>
      </div>
    </motion.div>
  );
};

/* ── Standard tier card ── */
const TierCard = ({ tier, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col overflow-hidden"
      style={{
        backgroundColor: hovered ? "#2a1a0e" : tier.bg,
        border: `1px solid ${tier.border}`,
        transition: "background-color 0.35s ease",
      }}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: tier.accent }} />

      <div className="p-5 sm:p-7 flex flex-col gap-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[10px] tracking-[0.22em] uppercase mb-1"
              style={{
                color: hovered ? "rgba(240,232,222,0.5)" : "#7a5c40",
                transition: "color 0.35s",
              }}
            >
              {tier.tagline}
            </p>
            <h3
              className="text-2xl sm:text-3xl font-black uppercase leading-none"
              style={{
                color: hovered ? tier.accent : "#2a1a0e",
                letterSpacing: "-0.02em",
                transition: "color 0.35s",
              }}
            >
              {tier.name}
            </h3>
          </div>
          <span
            className="text-2xl opacity-40 mt-1"
            style={{ color: tier.accent }}
            aria-hidden="true"
          >
            {tier.icon}
          </span>
        </div>

        {/* Divider */}
        <motion.div
          className="h-px w-full"
          style={{ backgroundColor: hovered ? "rgba(201,168,124,0.2)" : "#ddd5c8" }}
        />

        {/* Profile traits */}
        <div className="flex flex-col gap-2.5 flex-1">
          <p
            className="text-[10px] tracking-[0.22em] uppercase"
            style={{
              color: hovered ? "rgba(240,232,222,0.4)" : "#7a5c40",
              transition: "color 0.35s",
            }}
          >
            Profile
          </p>
          <ul className="flex flex-col gap-2">
            {tier.traits.map((trait, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-snug"
                style={{
                  color: hovered ? "rgba(240,232,222,0.8)" : "#3d2510",
                  transition: "color 0.35s",
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.08 + i * 0.06 }}
              >
                <span
                  className="mt-[5px] w-1 h-1 rounded-full shrink-0"
                  style={{ backgroundColor: tier.accent }}
                  aria-hidden="true"
                />
                {trait}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Bottom CTA */}
        <motion.a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase cursor-pointer"
          style={{
            color: hovered ? tier.accent : "#7a5c40",
            transition: "color 0.35s",
          }}
          whileHover={{ gap: "10px" }}
          transition={{ duration: 0.2 }}
        >
          Book this tier
          <span aria-hidden="true">→</span>
        </motion.a>
      </div>
    </motion.div>
  );
};

/* ── Main Crew section ── */
const Crew = () => {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: "-60px" });

  return (
    <section
      id="crew"
      className="w-full bg-[#f5f0e8] py-20 sm:py-28 px-4 sm:px-8 lg:px-16 xl:px-24 overflow-hidden"
      aria-labelledby="crew-heading"
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div
          ref={headRef}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10 sm:mb-14"
        >
          <div>
            <motion.p
              className="text-xs tracking-[0.28em] uppercase text-[#7a5c40] mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              Our Talent Tiers
            </motion.p>
            <motion.h2
              id="crew-heading"
              className="font-black uppercase leading-none text-[#2a1a0e]"
              style={{
                fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)",
                letterSpacing: "-0.025em",
              }}
              initial={{ opacity: 0, x: -28 }}
              animate={headInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              Curate
              <br />
              <span
                className="font-light tracking-widest"
                style={{
                  color: "#7a5c40",
                  fontSize: "0.65em",
                  letterSpacing: "0.1em",
                }}
              >
                Your Crew
              </span>
            </motion.h2>
          </div>

          <motion.p
            className="text-sm sm:text-base leading-relaxed text-[#5a3d22]/75 max-w-xs lg:text-right"
            initial={{ opacity: 0, y: 14 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            Five tiers of excellence — choose the calibre that matches your event's ambition.
          </motion.p>
        </div>

        {/* Thin rule */}
        <motion.div
          className="h-px mb-8 sm:mb-12"
          style={{ backgroundColor: "#ddd5c8" }}
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* ── Bento grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#ddd5c8]">

          {/* Diamond — full width */}
          <DiamondCard tier={TIERS[0]} index={0} />

          {/* Platinum, Gold, Silver */}
          {TIERS.slice(1, 4).map((tier, i) => (
            <TierCard key={tier.id} tier={tier} index={i} />
          ))}

          {/* Bronze */}
          <TierCard tier={TIERS[4]} index={3} />

          {/* Quote card — spans columns 2 and 3 of row 3 */}
          <motion.div
            className="relative flex flex-col justify-between overflow-hidden p-5 sm:p-7 col-span-1 md:col-span-1 lg:col-span-2"
            style={{ backgroundColor: "#2a1a0e" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Diagonal texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(201,168,124,0.3) 0px, rgba(201,168,124,0.3) 1px, transparent 1px, transparent 40px)",
              }}
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-5 h-full justify-between">
              {/* Icon */}
              <span
                className="text-3xl opacity-50"
                style={{ color: "#c9a87c" }}
                aria-hidden="true"
              >
                ✦
              </span>

              {/* Text */}
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{
                  color: "rgba(240,232,222,0.75)",
                  fontStyle: "italic",
                }}
              >
                All tiers are available for events across India and abroad.
                Pricing is provided upon inquiry based on event scale and duration.
              </p>

              {/* CTA */}
              <motion.a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.18em] uppercase cursor-pointer"
                style={{
                  border: "1px solid rgba(201,168,124,0.6)",
                  color: "#c9a87c",
                  }}
                whileHover={{ backgroundColor: "#c9a87c", color: "#2a1a0e" }}
                transition={{ duration: 0.22 }}
              >
                Get a Quote →
              </motion.a>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default Crew;