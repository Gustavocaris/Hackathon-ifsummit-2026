import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";
import { useAuthStore, initializeAuth } from "@/store/authStore";
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

      {/* Redirect root to login or dashboard */}
      <Route path="/">
        {isAuthenticated ? (
          <Dashboard />
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
  // Initialize auth from localStorage on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
