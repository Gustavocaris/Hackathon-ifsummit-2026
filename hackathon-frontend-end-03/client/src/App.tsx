import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";
import { useAuthStore, initializeAuth } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Reservas from "@/pages/Reservas";
import Estoque from "@/pages/Estoque";
import Agenda from "@/pages/Agenda";
import Notificacoes from "@/pages/Notificacoes";
import Aprovacoes from "@/pages/Aprovacoes";
import Unauthorized from "@/pages/Unauthorized";
import Admin from "@/pages/Admin";

function Router() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/unauthorized" component={Unauthorized} />

      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/reservas">
        <ProtectedRoute>
          <Reservas />
        </ProtectedRoute>
      </Route>

      <Route path="/estoque">
        <ProtectedRoute>
          <Estoque />
        </ProtectedRoute>
      </Route>

      <Route path="/agenda">
        <ProtectedRoute>
          <Agenda />
        </ProtectedRoute>
      </Route>

      <Route path="/notificacoes">
        <ProtectedRoute>
          <Notificacoes />
        </ProtectedRoute>
      </Route>

      <Route path="/aprovacoes">
        <ProtectedRoute requiredRoles={['tecnico']}>
          <Aprovacoes />
        </ProtectedRoute>
      </Route>

      <Route path="/usuarios">
        <ProtectedRoute requiredRoles={['admin']}>
          <Admin />
        </ProtectedRoute>
      </Route>

      {/* Redirect root: calendário para autenticados, login para visitantes */}
      <Route path="/">
        {isAuthenticated ? (
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        ) : (
          <Login />
        )}
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();
  const { fetchAll, initialized } = useDataStore();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Fetch all data when authenticated
  useEffect(() => {
    if (isAuthenticated && !initialized) {
      fetchAll();
    }
  }, [isAuthenticated, initialized, fetchAll]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
