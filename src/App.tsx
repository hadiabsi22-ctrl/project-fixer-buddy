import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Reviews from "./pages/Reviews";
import ReviewDetail from "./pages/ReviewDetail";
import Theories from "./pages/Theories";
import TheoryDetail from "./pages/TheoryDetail";
import Search from "./pages/Search";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import FAQ from "./pages/FAQ";
import AmineAuth from "./pages/AmineAuth";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Dashboard from "./pages/admin/Dashboard";
import ReviewsList from "./pages/admin/ReviewsList";
import ReviewForm from "./pages/admin/ReviewForm";
import TheoriesList from "./pages/admin/TheoriesList";
import TheoryForm from "./pages/admin/TheoryForm";
import NewsList from "./pages/admin/NewsList";
import NewsForm from "./pages/admin/NewsForm";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import ArticlesList from "./pages/admin/ArticlesList";
import ArticleForm from "./pages/admin/ArticleForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/reviews/:slug" element={<ReviewDetail />} />
              <Route path="/theories" element={<Theories />} />
              <Route path="/theories/:slug" element={<TheoryDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsDetail />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/faq" element={<FAQ />} />
              
              {/* Admin Auth - Secret Route */}
              <Route path="/amine-auth" element={<AmineAuth />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/reviews" element={<ReviewsList />} />
              <Route path="/admin/reviews/new" element={<ReviewForm />} />
              <Route path="/admin/reviews/:id" element={<ReviewForm />} />
              <Route path="/admin/theories" element={<TheoriesList />} />
              <Route path="/admin/theories/new" element={<TheoryForm />} />
              <Route path="/admin/theories/:id" element={<TheoryForm />} />
              <Route path="/admin/news" element={<NewsList />} />
              <Route path="/admin/news/new" element={<NewsForm />} />
              <Route path="/admin/news/:id" element={<NewsForm />} />
              <Route path="/admin/articles" element={<ArticlesList />} />
              <Route path="/admin/articles/new" element={<ArticleForm />} />
              <Route path="/admin/articles/:id" element={<ArticleForm />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
