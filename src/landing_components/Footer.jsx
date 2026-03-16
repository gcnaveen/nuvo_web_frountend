import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "motion/react";
import { WHATSAPP_URL, INSTAGRAM_URL } from "../constants/links";

const LOGO_SRC = "/assets/logo.png";

const NAV_LINKS = [
  { label: "Home", href: "/", isRoute: true },
  { label: "About Us", href: "#about", isRoute: false },
  { label: "Services", href: "#services", isRoute: false },
  { label: "Founders", href: "#founders", isRoute: false },
  { label: "Join our Team", href: "/recruitment", isRoute: true },
  { label: "Get the App", href: "#get-app", isRoute: false },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: INSTAGRAM_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: WHATSAPP_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

const Reveal = ({ children, delay = 0, className = "", from = "bottom" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const initial =
    from === "left"
      ? { opacity: 0, x: -24 }
      : from === "right"
        ? { opacity: 0, x: 24 }
        : { opacity: 0, y: 20 };
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

const Footer = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <footer
      className="w-full overflow-hidden"
      style={{ backgroundColor: "#2a1a0e" }}
      role="contentinfo"
    >
      {/* ── Top dark CTA band ── */}
      <div
        ref={ref}
        className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 pt-16 sm:pt-20 pb-12 sm:pb-16"
      >
        <div className="max-w-7xl mx-auto">
          {/* Big closing statement */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16 mb-14 sm:mb-16">
            <div className="max-w-xl">
              <motion.p
                className="text-xs tracking-[0.28em] uppercase mb-3"
                style={{ color: "rgba(201,168,124,0.7)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.05 }}
              >
                Bengaluru · India &amp; Abroad
              </motion.p>

              <motion.h2
                className="font-black uppercase leading-none"
                style={{
                  fontSize: "clamp(2.8rem, 7vw, 6rem)",
                  letterSpacing: "-0.025em",
                  color: "#f0e8de",
                }}
                initial={{ opacity: 0, x: -28 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                Let&apos;s Create
                <br />
                <span
                  className="font-light tracking-widest"
                  style={{
                    color: "#c9a87c",
                    fontSize: "0.6em",
                    letterSpacing: "0.1em",
                  }}
                >
                  Magic Together
                </span>
              </motion.h2>
            </div>

            {/* Right: social + CTA */}
            <motion.div
              className="flex flex-col gap-5"
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.24,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Social buttons */}
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium tracking-[0.15em] uppercase cursor-pointer"
                    style={{
                      border: "1px solid rgba(201,168,124,0.35)",
                      color: "rgba(240,232,222,0.75)",
                    }}
                    whileHover={{
                      borderColor: "#c9a87c",
                      color: "#c9a87c",
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    {s.icon}
                    {s.label}
                  </motion.a>
                ))}
              </div>

              {/* Primary CTA */}
              <motion.a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm tracking-[0.2em] uppercase font-semibold cursor-pointer cta-button"
                style={{
                  backgroundColor: "#c9a87c",
                  color: "#2a1a0e",
                }}
                whileHover={{ backgroundColor: "#e8d5b0" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.22 }}
              >
                Book NUVÓ for Your Event →
              </motion.a>
            </motion.div>
          </div>

          {/* ── Animated divider ── */}
          <motion.div
            className="h-px w-full"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* ── Nav grid ── */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {NAV_LINKS.map((link, i) => {
              const motionProps = {
                initial: { opacity: 0, y: 10 },
                animate: inView ? { opacity: 1, y: 0 } : {},
                transition: { duration: 0.5, delay: 0.38 + i * 0.06 },
                whileHover: { color: "#c9a87c" },
                className: "text-xs sm:text-sm font-medium tracking-wide py-1 cursor-pointer",
                style: { color: "rgba(240,232,222,0.45)" },
              };
              return link.isRoute ? (
                <Link key={link.label} to={link.href}>
                  <motion.span {...motionProps}>{link.label}</motion.span>
                </Link>
              ) : (
                <motion.a key={link.label} href={link.href} {...motionProps}>
                  {link.label}
                </motion.a>
              );
            })}
          </div>

          {/* ── Bottom strip ── */}
          <motion.div
            className="mt-10 sm:mt-12 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {/* Logo */}
            <a href="#" aria-label="NUVÓ - Home" className="cursor-pointer">
              <motion.img
                src={LOGO_SRC}
                alt="NUVÓ"
                className="h-10 sm:h-12 w-auto"
                whileHover={{ opacity: 0.75 }}
                transition={{ duration: 0.2 }}
              />
            </a>

            {/* Copyright + credit */}
            <div className="flex flex-col sm:items-end gap-1">
              <p
                className="text-xs"
                style={{ color: "rgba(240,232,222,0.3)" }}
              >
                © {new Date().getFullYear()} NUVÓ Hosting Agency. All rights
                reserved.
              </p>
              <p
                className="text-xs"
                style={{ color: "rgba(201,168,124,0.4)" }}
              >
                Designed &amp; developed by{" "}
                <motion.a
                  href="https://www.naviinfo.tech/"
                  className="cursor-pointer"
                  style={{ color: "rgba(201,168,124,0.65)" }}
                  whileHover={{ color: "#c9a87c" }}
                  transition={{ duration: 0.2 }}
                >
                  Navi Infotech
                </motion.a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
