import React from "react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

/* ── Reusable animated wrapper ── */
const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ── Animated word reveal (letter by letter) ── */
const SplitReveal = ({ text, delay = 0, className = "", style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-block", ...style }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.45,
            delay: delay + i * 0.03,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

/* ── Pillar card (replaces stat cells) ── */
const PillarCell = ({ icon, title, body, dark = false, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={`relative flex flex-col justify-between p-5 sm:p-6 border ${
        dark
          ? "bg-[#2a1a0e] border-[#2a1a0e] text-[#f0e8de]"
          : "bg-[#f5f0e8] border-[#ddd5c8] text-[#2a1a0e]"
      }`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top: decorative icon / glyph */}
      <span
        className="text-2xl sm:text-3xl leading-none select-none"
        aria-hidden="true"
        style={{ opacity: dark ? 0.6 : 0.45 }}
      >
        {icon}
      </span>

      {/* Bottom: text */}
      <div className="mt-4">
        <p
          className="text-lg sm:text-xl font-black leading-tight tracking-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </p>
        <p
          className="mt-1 text-xs sm:text-sm leading-snug"
          style={{ opacity: dark ? 0.65 : 0.6 }}
        >
          {body}
        </p>
      </div>
    </motion.div>
  );
};

/* ── Traits pill list ── */
const TRAITS = [
  "Dynamism",
  "Patience",
  "Initiative",
  "Experience",
  "Efficiency",
  "Multilingualism",
  "Protocol",
  "Etiquette",
  "Savoir-vivre",
  "A Radiant Smile",
];

/* ── Main About section ── */
const About = () => {
  return (
    <section
      className="w-full bg-[#f5f0e8] py-20 sm:py-28 px-4 sm:px-8 lg:px-16 xl:px-24 overflow-hidden"
      id="about"
      aria-labelledby="about-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── TOP ROW: heading + body columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16 sm:mb-20">
          {/* Left — display heading */}
          <Reveal delay={0}>
            <p
              className="text-xs tracking-[0.25em] uppercase mb-3 text-[#7a5c40]"
            >
              At
            </p>
            <h2
              id="about-heading"
              className="text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-none tracking-tight text-[#2a1a0e]"
              style={{ letterSpacing: "-0.02em" }}
            >
              <SplitReveal text="NUVÓ" delay={0.1} />
              <br />
              <span
                className="text-3xl sm:text-4xl md:text-5xl font-light tracking-widest"
                style={{ color: "#7a5c40", letterSpacing: "0.12em" }}
              >
                Hosting Agency
              </span>
            </h2>

            {/* Decorative rule */}
            <motion.div
              className="mt-6 h-px bg-[#2a1a0e]/20"
              initial={{ scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.9,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </Reveal>

          {/* Right — lead paragraph */}
          <Reveal delay={0.15} className="flex flex-col justify-end">
            <p
              className="text-base sm:text-lg leading-relaxed text-[#3d2510]"
            >
              We believe an event is more than a schedule — it&apos;s a feeling.
              Through solid structure and seamless logistics, NUVÓ places
              exceptional hosts and hostesses at events and functions{" "}
              <em>across India and abroad</em>, turning every gathering into an
              experience people carry with them.
            </p>

            <p
              className="mt-4 text-sm sm:text-base leading-relaxed text-[#5a3d22]/80"
            >
              As a professional staffing agency, NUVÓ guarantees high-quality
              service for weddings, gala dinners, seminars, congresses,
              exhibitions, product launches, fashion shows, and more — wherever
              excellence is non-negotiable.
            </p>
          </Reveal>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-auto gap-px bg-[#ddd5c8]">
          {/* Cell 1 — wide traits card */}
          <Reveal
            delay={0.05}
            className="col-span-2 row-span-1 bg-[#f5f0e8] p-5 sm:p-7 flex flex-col gap-5"
          >
            <p
              className="text-xs tracking-[0.2em] uppercase text-[#7a5c40]"
            >
              What sets our staff apart
            </p>
            <div className="flex flex-wrap gap-2">
              {TRAITS.map((trait, i) => (
                <motion.span
                  key={trait}
                  className="px-3 py-1 text-xs sm:text-sm border border-[#2a1a0e]/30 text-[#2a1a0e] rounded-full"
                  initial={{ opacity: 0, scale: 0.88 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1 + i * 0.045,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{
                    backgroundColor: "#2a1a0e",
                    color: "#f5f0e8",
                    borderColor: "#2a1a0e",
                    transition: { duration: 0.2 },
                  }}
                >
                  {trait}
                </motion.span>
              ))}
            </div>
          </Reveal>

          {/* Cell 2 — Pillar: Curated */}
          <PillarCell
            icon="✦"
            title="Curated Talent"
            body="Every professional is handpicked, trained, and prepared to represent your brand with grace."
            delay={0.1}
          />

          {/* Cell 3 — Pillar: Zero Compromise */}
          <PillarCell
            icon="◈"
            title="Zero Compromise"
            body="From briefing to last bow, we hold our staff to the highest standard — always."
            delay={0.18}
          />

          {/* Cell 4 — quote card (dark) spans 2 cols */}
          <motion.div
            className="col-span-2 bg-[#2a1a0e] p-6 sm:p-8 flex flex-col justify-between"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-lg sm:text-xl md:text-2xl leading-snug text-[#f0e8de]"
              style={{ fontStyle: "italic" }}
            >
              &ldquo;With NUVÓ, you receive reliable professionals ready to
              elevate your occasions with poise and precision — whether in India
              or abroad.&rdquo;
            </p>
          </motion.div>

          {/* Cell 5 — Pillar: Every Occasion */}
          <PillarCell
            icon="◎"
            title="Every Occasion"
            body="Weddings, galas, launches, shows — we bring the right energy to every format and scale."
            delay={0.28}
          />

          {/* Cell 6 — India & abroad tag */}
          <motion.div
            className="bg-[#f5f0e8] border-0 p-5 sm:p-6 flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-xs tracking-[0.18em] uppercase text-[#7a5c40]"
            >
              Presence
            </p>
            <div className="mt-4">
              <p
                className="text-2xl sm:text-3xl font-black text-[#2a1a0e] leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                India
                <br />
                &amp; Abroad
              </p>
            </div>
          </motion.div>
        </div>
        {/* end grid */}
      </div>
    </section>
  );
};

export default About;
