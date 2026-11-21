import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import SettingsModal from './components/common/SettingsModal';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import TrackPage from './pages/TrackPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import AuthorityPortalPage from './pages/AuthorityPortalPage';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <div className="flex h-screen bg-[#F5F8FC] dark:bg-slate-950 text-[#172B4D] dark:text-slate-100 overflow-hidden font-sans">
              
              {/* Left Navigation Sidebar */}
              <Sidebar
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
                isCollapsed={desktopCollapsed}
                onToggleCollapse={() => setDesktopCollapsed(!desktopCollapsed)}
                onOpenSettings={() => setSettingsOpen(true)}
              />

              {/* Main Content Pane */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <Navbar
                  onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
                  onOpenSettings={() => setSettingsOpen(true)}
                />

                {/* Scrollable View Area */}
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/report" element={<ReportPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/track" element={<TrackPage />} />
                    <Route path="/complaint/:trackingId" element={<ComplaintDetailPage />} />
                    <Route path="/authority" element={<AuthorityPortalPage />} />
                  </Routes>
                  <Footer />
                </main>
              </div>

              {/* Global Settings & Persona Modal */}
              <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
              />

            </div>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
