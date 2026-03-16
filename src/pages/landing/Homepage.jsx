import React from 'react';
import Header from '../../landing_components/Header';
import Footer from '../../landing_components/Footer';
import Hero from '../../sections/Hero';
import GetApp from '../../sections/GetApp';
import About from '../../sections/About';
import Founders from '../../sections/Founders';
import WhatCWDFyou from '../../sections/WhatCWDFyou';
import '../../landing.css';

const Homepage = () => {
  return (
    // nuvo-landing scope: activates CSS vars + Tailwind classes without
    // polluting the Bootstrap admin styles
    <div className="nuvo-landing min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Founders />
        <WhatCWDFyou />
        <GetApp />
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;

