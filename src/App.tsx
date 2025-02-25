
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./components/AuthProvider";
import MainLayout from "./components/Layout/MainLayout";
import Home from "./pages/Home";
import Daily from "./pages/Daily";
import Tags from "./pages/Tags";
import Favorites from "./pages/Favorites";
import Streak from "./pages/Streak";
import Profile from "./pages/Profile";
import Trash from "./pages/Trash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/app/*"
              element={
                <RequireAuth>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/daily" element={<Daily />} />
                      <Route path="/tags" element={<Tags />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/streak" element={<Streak />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/trash" element={<Trash />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </MainLayout>
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
