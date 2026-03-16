import React, { useState } from "react";
import { motion } from "motion/react";
import Menu from "./Menu";

const LOGO_SRC = "/assets/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 lg:px-10 py-5 sm:py-7"
        role="banner"
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <a
            href="#"
            className="flex items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 rounded"
            aria-label="Nuvo - Home"
          >
            <motion.img
              src={LOGO_SRC}
              alt="Nuvo"
              className="h-16 sm:h-20 md:h-24 w-auto"
              whileHover={{ opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            />
          </a>

          {/* Menu trigger */}
          <motion.button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 py-2 px-3 md:px-4 text-white"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {/* Hamburger — mobile only */}
            <span className="flex flex-col justify-center gap-[5px] w-10 h-10 p-2 md:hidden">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block h-[2px] rounded-full bg-current"
                  style={{
                    width: i === 2 ? "75%" : "100%",
                    marginLeft: i === 2 ? "auto" : "0",
                  }}
                />
              ))}
            </span>

            {/* "MENU" text — md and up */}
            <span className="hidden md:inline text-sm font-semibold tracking-[0.2em] uppercase">
              MENU
            </span>
          </motion.button>

        </div>
      </header>

      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Header;