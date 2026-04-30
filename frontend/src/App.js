import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage      from './pages/LoginPage';
import Dashboard      from './pages/Dashboard';
import TicketList     from './pages/TicketList';
import TicketDetail   from './pages/TicketDetail';
import CreateTicket   from './pages/CreateTicket';
import Analytics      from './pages/Analytics';
import Workload       from './pages/Workload';
import OverdueTickets from './pages/OverdueTickets';
import UserManagement from './pages/UserManagement';
import ResourceList   from './pages/ResourceList';
import ResourceForm   from './pages/ResourceForm';
import BookingList    from './pages/BookingList';
import BookingForm    from './pages/BookingForm';
import AdminBookings  from './pages/AdminBookings';
import './index.css';

// React Router v7 future flags
const routerFutureFlags = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
};

/**
 * Protects routes — redirects to /login if not authenticated.
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--bg-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div className="spinner" style={{ width: 36, height: 36 }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

/**
 * Public-only route — redirects to / if already authenticated.
 */
function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--bg-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div className="spinner" style={{ width: 36, height: 36 }} />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/oauth2/callback" element={<PublicRoute><LoginPage /></PublicRoute>} />

            {/* Protected */}
            <Route path="/"                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tickets"             element={<ProtectedRoute><TicketList /></ProtectedRoute>} />
            <Route path="/tickets/new"         element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
            <Route path="/tickets/overdue"     element={<ProtectedRoute><OverdueTickets /></ProtectedRoute>} />
            <Route path="/tickets/:id"         element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
            <Route path="/analytics"           element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/workload"            element={<ProtectedRoute><Workload /></ProtectedRoute>} />
            <Route path="/users"               element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/resources"           element={<ProtectedRoute><ResourceList /></ProtectedRoute>} />
            <Route path="/resources/new"       element={<ProtectedRoute><ResourceForm /></ProtectedRoute>} />
            <Route path="/resources/:id/edit"  element={<ProtectedRoute><ResourceForm /></ProtectedRoute>} />
            <Route path="/bookings"            element={<ProtectedRoute><BookingList /></ProtectedRoute>} />
            <Route path="/bookings/new"        element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
            <Route path="/admin/bookings"      element={<ProtectedRoute><AdminBookings /></ProtectedRoute>} />
            <Route path="*"                    element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter future={routerFutureFlags}>
            <AuthProvider>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-dim)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.85rem',
                            borderRadius: '10px',
                        },
                        success: { iconTheme: { primary: '#00d4aa', secondary: '#080c14' } },
                        error:   { iconTheme: { primary: '#ff5757', secondary: '#080c14' } },
                    }}
                />
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}