import Header from "@/components/Header";
import FeaturedContent from "@/components/FeaturedContent";
import ContentColumns from "@/components/ContentColumns";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <FeaturedContent />
        <ContentColumns />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
