import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = () => {
  // State to handle sidebar toggle (mobile view)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div id="app">
      {/* 1. Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div id="main">
        {/* Header / Burger Button */}
        <header className="mb-3">
          <a className="burger-btn d-block d-xl-none" onClick={toggleSidebar}>
            <i className="bi bi-justify fs-3"></i>
          </a>
        </header>

        {/* 3. The Page Content (Dynamic) */}
        {/* <Outlet /> acts as a placeholder. The Router replaces this with the Dashboard or Events page */}
        <Outlet />

        {/* 4. Footer Component */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
