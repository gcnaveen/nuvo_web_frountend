import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const MENU_ITEMS = [
  { label: "Home", href: "/", isRoute: true },
  { label: "About us", href: "#about", isRoute: false },
  { label: "Founders Spotlight", href: "#founders", isRoute: false },
  { label: "Join our Team", href: "/joinourteam", isRoute: true },
  { label: "Get the app", href: "#get-app", isRoute: false },
];

/* ── Animation variants ── */

const overlay = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

const panel = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    clipPath: "inset(0 0 100% 0)",
    transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
  },
};

const list = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.28 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

/* ── Animated underline link ── */
const NavLink = ({ href, children, onClick, isRoute }) => {
  const content = (
    <>
      <motion.span
        className="block font-semibold tracking-tight leading-tight"
        variants={{
          rest: { y: 0 },
          hovered: { y: -2, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
        }}
        style={{
          fontSize: "clamp(1.5rem, 4.2vw, 3rem)",
          letterSpacing: "-0.02em",
          color: "inherit",
        }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute left-0 bottom-0 block h-[2px] rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
        variants={{
          rest: { scaleX: 0, originX: 0 },
          hovered: {
            scaleX: 1,
            originX: 0,
            transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
          },
        }}
      />
    </>
  );
  if (isRoute) {
    return (
      <Link to={href} onClick={onClick}>
        <motion.span
          className="relative inline-block py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded"
          style={{ color: "rgba(255,255,255,0.92)" }}
          variants={{ rest: {}, hovered: {} }}
          whileHover="hovered"
          initial="rest"
          animate="rest"
        >
          {content}
        </motion.span>
      </Link>
    );
  }
  return (
  <motion.a
    href={href}
    onClick={onClick}
    className="relative inline-block py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded"
    style={{ color: "rgba(255,255,255,0.92)" }}
    variants={{ rest: {}, hovered: {} }}
    whileHover="hovered"
    initial="rest"
    animate="rest"
  >
    {/* Label */}
    <motion.span
      className="block font-semibold tracking-tight leading-tight"
      variants={{
        rest: { y: 0 },
        hovered: { y: -2, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
      }}
      
      style={{
        fontSize: "clamp(1.5rem, 4.2vw, 3rem)",
        letterSpacing: "-0.02em",
        color: "inherit",
      }}
    >
      {children}
    </motion.span>

    {/* Animated underline */}
    <motion.span
      className="absolute left-0 bottom-0 block h-[2px] rounded-full"
      style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
      variants={{
        rest: { scaleX: 0, originX: 0 },
        hovered: {
          scaleX: 1,
          originX: 0,
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    />
  </motion.a>
  );
};

/**
 * Full-page overlay menu — dark cinematic backdrop, staggered links,
 * animated underline on hover, smooth open/close transitions.
 */
const Menu = ({ isOpen, onClose }) => {
  const closeRef = useRef(null);

  /* lock scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* trap focus to close button on open */
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(10,8,8,0.3)", backdropFilter: "blur(4px)" }}
            variants={overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            style={{
              background:
                "linear-gradient(135deg, rgba(14,11,11,0.97) 0%, rgba(24,18,14,0.99) 100%)",
            }}
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-modal="true"
            aria-label="Navigation menu"
            role="dialog"
          >
            {/* Subtle grain texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
                opacity: 0.4,
              }}
              aria-hidden="true"
            />

            {/* Close button */}
            <div className="absolute top-0 right-0 p-4 sm:p-6 z-10">
              <motion.button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="p-2 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                style={{ color: "rgba(255,255,255,0.85)" }}
                aria-label="Close menu"
                initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                transition={{ delay: 0.25, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.1, color: "#ffffff" }}
                whileTap={{ scale: 0.92 }}
              >
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Nav links — left-aligned, vertically centred */}
            <nav
              className="flex-1 flex items-center px-8 sm:px-14 md:px-20 lg:px-28 py-20"
              aria-label="Main navigation"
            >
              <motion.ul
                className="flex flex-col gap-3 sm:gap-4 md:gap-5"
                variants={list}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {MENU_ITEMS.map(({ label, href, isRoute }) => (
                  <motion.li key={label} variants={listItem}>
                    <NavLink href={href} onClick={onClose} isRoute={isRoute}>
                      {label}
                    </NavLink>
                  </motion.li>
                ))}
              </motion.ul>
            </nav>

            {/* Bottom footer strip */}
            <motion.div
              className="px-8 sm:px-14 md:px-20 lg:px-28 pb-8 sm:pb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <p
                className="text-xs sm:text-sm tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                NUVÓ Hosting Agency
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Menu;


