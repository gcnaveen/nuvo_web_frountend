import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import SelectMood from "./SelectMood";
import Crew from "./Crew";

const WhatCWDFyou = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="services"
      className="w-full bg-[#f5f0e8] pt-20 sm:pt-28 overflow-hidden"
      aria-labelledby="wcdfy-heading"
    >
      {/* ── Header block ── */}
      <div
        ref={ref}
        className="px-4 sm:px-8 lg:px-16 xl:px-24 pb-10 sm:pb-14 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"
      >
        <div>
          <motion.p
            className="text-xs tracking-[0.28em] uppercase text-[#7a5c40] mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Our Services
          </motion.p>

          <motion.h2
            id="wcdfy-heading"
            className="font-black uppercase leading-none text-[#2a1a0e]"
            style={{
              fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)",
              letterSpacing: "-0.025em",
            }}
            initial={{ opacity: 0, x: -28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            What Can We
            <br />
            <span
              className="font-light tracking-widest"
              style={{
                color: "#7a5c40",
                fontSize: "0.65em",
                letterSpacing: "0.1em",
              }}
            >
              Do For You?
            </span>
          </motion.h2>
        </div>

        <motion.p
          className="text-sm sm:text-base leading-relaxed text-[#5a3d22]/75 max-w-xs lg:text-right"
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          Select your occasion — we'll match you with the perfect hosts and hostesses for the moment.
        </motion.p>
      </div>

      {/* Thin rule */}
      <motion.div
        className="mx-4 sm:mx-8 lg:mx-16 xl:mx-24 h-px"
        style={{ backgroundColor: "#ddd5c8" }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* ── Horizontal scroll carousel ── */}
      <SelectMood />
      <Crew/>
    </section>
  );
};

export default WhatCWDFyou;