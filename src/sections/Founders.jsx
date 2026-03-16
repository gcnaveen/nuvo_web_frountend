import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { WHATSAPP_URL } from "../constants/links";

const FOUNDER_IMG = "/assets/founder.png";

/* ── Reusable scroll reveal ── */
const Reveal = ({ children, delay = 0, className = "", from = "bottom" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const initial =
    from === "left"
      ? { opacity: 0, x: -32 }
      : from === "right"
        ? { opacity: 0, x: 32 }
        : { opacity: 0, y: 28 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ── Animated line divider ── */
const AnimLine = ({ delay = 0, vertical = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={vertical ? "w-px self-stretch" : "h-px w-full"}
      style={{ backgroundColor: "#ddd5c8" }}
      initial={{
        scaleX: vertical ? 1 : 0,
        scaleY: vertical ? 0 : 1,
        originX: 0,
        originY: 0,
      }}
      animate={inView ? { scaleX: 1, scaleY: 1 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
};

const QUALITIES = [
  {
    name: "Anika",
    role: "Content & Storytelling",
    trait: "Curates captivating visual experiences",
  },
  {
    name: "Rini",
    role: "Precision & Composure",
    trait: "Corporate-grade execution for VIP events",
  },
];

const SERVICES = [
  "MICE Events",
  "Luxury Weddings",
  "Fashion Launches",
  "Brand Activations",
  "HNI Gatherings",
  "Hospitality Collaborations",
];

const Founders = () => {
  return (
    <section
      id="founders"
      className="w-full bg-[#f5f0e8] py-20 sm:py-28 px-4 sm:px-8 lg:px-16 xl:px-24 overflow-hidden"
      aria-labelledby="founders-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Section label ── */}
        <Reveal delay={0}>
          <p className="text-xs tracking-[0.28em] uppercase text-[#7a5c40] mb-2">
            Founder&apos;s Spotlight
          </p>
        </Reveal>

        {/* ── Heading row ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10 sm:mb-14">
          <Reveal delay={0.08} from="left">
            <h2
              id="founders-heading"
              className="text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-none text-[#2a1a0e]"
              style={{
                letterSpacing: "-0.025em",
              }}
            >
              MEET THE
              <br />
              <span
                className="text-4xl sm:text-5xl md:text-6xl font-light tracking-widest"
                style={{
                  color: "#7a5c40",
                  letterSpacing: "0.1em",
                }}
              >
                Sisters
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.18} from="right" className="lg:max-w-sm">
            <p className="text-sm sm:text-base leading-relaxed text-[#5a3d22]/80">
              From Bengaluru&apos;s dynamic landscape, two women set out to
              redefine what luxury event staffing could feel like.
            </p>
          </Reveal>
        </div>

        <AnimLine delay={0.22} />

        {/* ── MAIN BENTO GRID ── */}
        <div className="mt-px grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 grid-rows-auto gap-px bg-[#ddd5c8]">
          {/* ── IMAGE cell — spans 5 cols, 2 rows on lg ── */}
          <motion.div
            className="lg:col-span-5 lg:row-span-2 relative overflow-hidden bg-[#e8e0d4]"
            style={{ minHeight: "360px" }}
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={FOUNDER_IMG}
              alt="Anika and Rini, founders of NUVÓ"
              className="w-full h-full object-cover object-top"
              style={{ minHeight: "360px" }}
            />
            {/* Gradient scrim at bottom */}
            <div
              className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(42,26,14,0.7) 0%, transparent 100%)",
              }}
            />
            {/* Names overlay */}
            <div className="absolute bottom-0 left-0 p-5 sm:p-6">
              <p className="text-white/90 text-lg font-semibold leading-tight">
                Anika &amp; Rini
              </p>
              <p className="text-white/60 text-xs tracking-widest uppercase mt-0.5">
                Co-Founders, NUVÓ
              </p>
            </div>
          </motion.div>

          {/* ── LEAD STORY cell — spans 7 cols ── */}
          <Reveal
            delay={0.15}
            className="lg:col-span-7 bg-[#f5f0e8] p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <p className="text-base sm:text-lg leading-relaxed text-[#3d2510]">
              Dissatisfied with luxury events undermined by inconsistent
              staffing and a lack of cultural refinement,{" "}
              <em>Anika and Rini </em> founded NUVÓ to set a new standard —
              sophisticated hosts and hostesses who blend tradition with
              contemporary elegance.
            </p>
            <div className="flex gap-6 sm:gap-10">
              {QUALITIES.map((q, i) => (
                <motion.div
                  key={q.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.55,
                    delay: 0.25 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <p
                    className="text-lg sm:text-xl font-black text-[#2a1a0e] leading-none"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {q.name}
                  </p>
                  <p className="text-xs tracking-widest uppercase text-[#7a5c40] mt-1">
                    {q.role}
                  </p>
                  <p className="text-xs sm:text-sm text-[#5a3d22]/70 mt-2 max-w-[160px]">
                    {q.trait}
                  </p>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* ── ANIKA story cell ── */}
          <Reveal
            delay={0.2}
            className="lg:col-span-4 bg-[#f5f0e8] p-5 sm:p-6 flex flex-col gap-3"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-[#7a5c40]">
              Anika
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-[#3d2510]">
              A background in content creation sharpened her eye for experience
              curation. Her expertise in visual storytelling guides our
              hostesses in delivering polished, memorable interactions.
            </p>
          </Reveal>

          {/* ── RINI story cell ── */}
          <Reveal
            delay={0.27}
            className="lg:col-span-3 bg-[#2a1a0e] p-5 sm:p-6 flex flex-col gap-3"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-[#c9a87c]">
              Rini
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-[#f0e8de]/80">
              A corporate fraud analyst background forged impeccable precision.
              She ensures our hosts execute with flawless timing and manage
              discerning VIP guests with ease.
            </p>
          </Reveal>

          {/* ── SERVICES cell — full width ── */}
          <Reveal
            delay={0.3}
            className="md:col-span-2 lg:col-span-12 bg-[#f5f0e8] p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8"
          >
            <p className="text-xs tracking-[0.22em] uppercase text-[#7a5c40] shrink-0">
              We serve
            </p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s, i) => (
                <motion.span
                  key={s}
                  className="px-3 py-1 text-xs sm:text-sm border border-[#2a1a0e]/30 text-[#2a1a0e] rounded-full cursor-default"
                  initial={{ opacity: 0, scale: 0.88 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.35 + i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{
                    backgroundColor: "#2a1a0e",
                    color: "#f5f0e8",
                    borderColor: "#2a1a0e",
                    transition: { duration: 0.2 },
                  }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </Reveal>

          {/* ── CTA cell ── */}
          <motion.div
            className="md:col-span-2 lg:col-span-12 bg-[#2a1a0e] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.65,
              delay: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <p
              className="text-xl sm:text-2xl md:text-3xl text-[#f0e8de] leading-snug max-w-lg"
              style={{
                fontStyle: "italic",
              }}
            >
              &ldquo;Ready to staff your next triumph? Let&apos;s collaborate
              and create magic.&rdquo;
            </p>
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-3 px-6 py-3 border border-[#c9a87c] text-[#c9a87c] text-xs tracking-[0.22em] uppercase cursor-pointer"
              whileHover={{ backgroundColor: "#c9a87c", color: "#2a1a0e" }}
              transition={{ duration: 0.25 }}
            >
              Let&apos;s Connect
              <motion.span
                className="inline-block"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.25 }}
              >
                →
              </motion.span>
            </motion.a>
          </motion.div>
        </div>
        {/* end bento grid */}
      </div>
    </section>
  );
};

export default Founders;
