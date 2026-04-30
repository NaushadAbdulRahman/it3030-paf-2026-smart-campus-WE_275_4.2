import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard      from './pages/Dashboard';
import TicketList     from './pages/TicketList';
import TicketDetail   from './pages/TicketDetail';
import CreateTicket   from './pages/CreateTicket';
import Analytics      from './pages/Analytics';
import Workload       from './pages/Workload';
import OverdueTickets from './pages/OverdueTickets';
import './index.css';

export default function App() {
  return (
      <BrowserRouter>
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
        <Routes>
          <Route path="/"                    element={<Dashboard />} />
          <Route path="/tickets"             element={<TicketList />} />
          <Route path="/tickets/new"         element={<CreateTicket />} />
          <Route path="/tickets/overdue"     element={<OverdueTickets />} />
          <Route path="/tickets/:id"         element={<TicketDetail />} />
          <Route path="/analytics"           element={<Analytics />} />
          <Route path="/workload"            element={<Workload />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
  );
}