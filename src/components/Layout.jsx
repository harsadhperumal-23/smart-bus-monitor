import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import KpiStrip from "./KpiStrip";

export default function Layout() {
  return (
    <div
      id="app-layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#161616',
        color: '#ffffff',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {/* Top Navigation Bar */}
      <div style={{ flexShrink: 0, zIndex: 50 }}>
        <Header />
      </div>

      {/* KPI Strip — live fleet metrics */}
      <div style={{ flexShrink: 0, zIndex: 40 }}>
        <KpiStrip />
      </div>

      {/* Main content */}
      <main
        id="main-content"
        role="main"
        aria-label="Main content"
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          background: '#161616',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
