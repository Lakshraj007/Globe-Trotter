import React, { useState } from "react";
import Navbar from "../ui/navbar";
import Drawer from "../ui/drawer";
import "./AppShell.css";

const AppShell = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="app-shell">

      {/* Global Navbar */}
      <header className="app-shell-header">
        <Navbar onMenuClick={openDrawer} />
      </header>

      {/* Mobile Hamburger Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title="Navigation"
        side="left"
      >
        <div className="mobile-drawer-links">
          <button type="button" onClick={closeDrawer}>
            Home
          </button>

          <button type="button" onClick={closeDrawer}>
            Trips
          </button>

          <button type="button" onClick={closeDrawer}>
            Destinations
          </button>

          <button type="button" onClick={closeDrawer}>
            Profile
          </button>
        </div>
      </Drawer>

      {/* Page Content */}
      <main className="app-shell-main">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="app-shell-bottom-nav"
        aria-label="Mobile navigation"
      >
        <button type="button" className="bottom-nav-item">
          <span className="bottom-nav-icon">🗺️</span>
          <span>Itinerary</span>
        </button>

        <button type="button" className="bottom-nav-item">
          <span className="bottom-nav-icon">💰</span>
          <span>Budget</span>
        </button>

        <button type="button" className="bottom-nav-item">
          <span className="bottom-nav-icon">📅</span>
          <span>Calendar</span>
        </button>
      </nav>

    </div>
  );
};

export default AppShell;