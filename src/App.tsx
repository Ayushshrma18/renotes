
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./components/AuthProvider";
import { ThemeProvider } from "next-themes";
import MainLayout from "./components/Layout/MainLayout";
import Home from "./pages/Home";
import Tags from "./pages/Tags";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Vault from "./pages/Vault";
import Trash from "./pages/Trash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/app"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Home />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/app/"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Home />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/app/tags"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Tags />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/app/favorites"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Favorites />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/app/vault"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Vault />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/app/profile"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/app/settings"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Settings />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/app/trash"
                  element={
                    <RequireAuth>
                      <MainLayout>
                        <Trash />
                      </MainLayout>
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
