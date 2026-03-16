import React, { useRef } from "react";
import { motion, useInView } from "motion/react";

const FOOTER_IMAGE_PATHS = [
  "/assets/footer/f1.webp",
  "/assets/footer/2.avif",
  "/assets/footer/3.webp",
  "/assets/footer/4.jpg",
];

/* ── Scattered image positions ── */
const IMAGE_POSITIONS = [
  { top: "6%",  left: "2%",   width: "clamp(110px,15vw,240px)", aspectRatio: "4/5", rotate: "-4deg"  },
  { top: "4%",  right: "3%",  width: "clamp(100px,13vw,210px)", aspectRatio: "3/4", rotate: "5deg"   },
  { top: "52%", left: "1%",   width: "clamp(100px,13vw,200px)", aspectRatio: "3/4", rotate: "3deg"   },
  { top: "55%", right: "2%",  width: "clamp(90px,11vw,180px)",  aspectRatio: "4/3", rotate: "-6deg"  },
  { top: "28%", left: "14%",  width: "clamp(80px,9vw,150px)",   aspectRatio: "1",   rotate: "8deg"   },
  { top: "30%", right: "14%", width: "clamp(80px,9vw,150px)",   aspectRatio: "1",   rotate: "-5deg"  },
];

/* ── App store badge SVGs (inline, no external URLs) ── */
const AppStoreBadge = () => (
  <motion.a
    href="#"
    aria-label="Download on the App Store"
    className="flex items-center gap-2.5 px-5 py-3 rounded-xl cursor-pointer"
    style={{ backgroundColor: "#2a1a0e", border: "1px solid rgba(201,168,124,0.3)" }}
    whileHover={{ scale: 1.04, backgroundColor: "#3d2510" }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.2 }}
  >
    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="#f0e8de">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
    <div className="text-left">
      <p className="text-[10px] leading-none" style={{ color: "rgba(240,232,222,0.6)" }}>Download on the</p>
      <p className="text-sm font-bold leading-tight mt-0.5" style={{ color: "#f0e8de" }}>App Store</p>
    </div>
  </motion.a>
);

const PlayStoreBadge = () => (
  <motion.a
    href="#"
    aria-label="Get it on Google Play"
    className="flex items-center gap-2.5 px-5 py-3 rounded-xl cursor-pointer"
    style={{ backgroundColor: "#2a1a0e", border: "1px solid rgba(201,168,124,0.3)" }}
    whileHover={{ scale: 1.04, backgroundColor: "#3d2510" }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.2 }}
  >
    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="#f0e8de">
      <path d="M3.18 23.76c.3.17.64.22.99.14l12.12-6.98-2.54-2.54-10.57 9.38zM.5 1.08C.18 1.42 0 1.96 0 2.67v18.66c0 .71.18 1.25.5 1.59l.08.07 10.46-10.46v-.25L.58 1.01.5 1.08zM20.37 10.37l-2.95-1.7-2.85 2.85 2.85 2.84 2.97-1.71c.85-.49.85-1.29-.02-1.78zM3.18.24L15.75 7.6l-2.54 2.54L3.18.38.18.08 3.18.24z"/>
    </svg>
    <div className="text-left">
      <p className="text-[10px] leading-none" style={{ color: "rgba(240,232,222,0.6)" }}>Get it on</p>
      <p className="text-sm font-bold leading-tight mt-0.5" style={{ color: "#f0e8de" }}>Google Play</p>
    </div>
  </motion.a>
);

/* ── Floating stat chip ── */
const FloatChip = ({ children, delay, className }) => (
  <motion.div
    className={`absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg z-20 ${className}`}
    style={{ backgroundColor: "#f5f0e8", border: "1px solid #ddd5c8" }}
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    animate={{ y: [0, -5, 0] }}
    // Note: whileInView overrides animate on first mount; subsequent float handled via CSS
  >
    {children}
  </motion.div>
);

const GetApp = ({
  images,
  iphoneSrc,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const imageSources = images ?? FOOTER_IMAGE_PATHS;
  const phoneSrc = iphoneSrc ?? "/assets/footer/phone.png";

  return (
    <section
      id="get-app"
      className="relative overflow-hidden flex items-center justify-center px-4 py-24 sm:py-32"
      style={{ backgroundColor: "#f5f0e8", minHeight: "min(100vh, 900px)" }}
      aria-labelledby="getapp-heading"
    >

      {/* ── Background decorative line grid ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage: "linear-gradient(rgba(42,26,14,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(42,26,14,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Scattered photos – md and up ── */}
      {IMAGE_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:block overflow-hidden shadow-xl"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            width: pos.width,
            aspectRatio: pos.aspectRatio,
            rotate: pos.rotate,
            borderRadius: "8px",
            zIndex: 1,
          }}
          initial={{ opacity: 0, scale: 0.88, rotate: pos.rotate }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.img
            src={imageSources[i % imageSources.length]}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.4 }}
          />
          {/* subtle overlay */}
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(42,26,14,0.08)" }} />
        </motion.div>
      ))}

      {/* ── Floating chips ── */}
      <FloatChip delay={0.5} className="top-[18%] left-[22%]">
        <span className="text-lg" aria-hidden="true">✦</span>
        <span className="text-xs font-semibold text-[#2a1a0e]" >200+ Events Staffed</span>
      </FloatChip>
      <FloatChip delay={0.62} className="top-[22%] right-[20%]">
        <span className="text-lg" aria-hidden="true">★</span>
        <span className="text-xs font-semibold text-[#2a1a0e]" >5-Star Rated Agency</span>
      </FloatChip>
      <FloatChip delay={0.74} className="bottom-[24%] left-[20%]">
        <span className="text-base" aria-hidden="true">⚡</span>
        <span className="text-xs font-semibold text-[#2a1a0e]" >Book in Minutes</span>
      </FloatChip>

      {/* ── Center content ── */}
      <div ref={ref} className="relative z-10 flex flex-col items-center text-center max-w-lg px-2">

        {/* Label */}
        <motion.p
          className="text-xs tracking-[0.28em] uppercase text-[#7a5c40] mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Now on iOS &amp; Android
        </motion.p>

        {/* Heading */}
        <motion.h2
          id="getapp-heading"
          className="font-black uppercase leading-none text-[#2a1a0e] mb-3"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            letterSpacing: "-0.025em",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          Book Elite
          <br />
          <span
            className="font-light tracking-widest"
            style={{
              color: "#7a5c40",
              fontSize: "0.65em",
              letterSpacing: "0.1em",
            }}
          >
            Hosts &amp; Hostesses
          </span>
        </motion.h2>

        {/* Subline */}
        <motion.p
          className="text-sm sm:text-base leading-relaxed text-[#5a3d22]/80 mb-8 max-w-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
        >
          Browse vetted professionals, match them to your event brief, and
          confirm your NUVÓ team in minutes — wherever you are in India or abroad.
        </motion.p>

        {/* iPhone mockup */}
        <motion.div
          className="relative mb-8"
          style={{ width: "clamp(140px, 28vw, 220px)" }}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.85, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow behind phone */}
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: "#c9a87c", transform: "scale(1.2) translateY(10%)" }}
            aria-hidden="true"
          />
          <motion.img
            src={phoneSrc}
            alt="NUVÓ app on iPhone"
            className="relative w-full h-auto drop-shadow-2xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Store badges */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
        >
          <AppStoreBadge />
          <PlayStoreBadge />
        </motion.div>

        {/* Fine print */}
        <motion.p
          className="mt-4 text-[11px] tracking-wide text-[#7a5c40]/60"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.56 }}
        >
          Free to download &nbsp;·&nbsp; Available across India
        </motion.p>

      </div>
    </section>
  );
};

export default GetApp;