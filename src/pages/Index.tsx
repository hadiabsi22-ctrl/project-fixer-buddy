import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import FeaturedContent from "@/components/FeaturedContent";
import ContentColumns from "@/components/ContentColumns";
import Footer from "@/components/Footer";

const Index = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ReviewQeem",
    "alternateName": "ريفيو قيم",
    "url": "https://www.reviewqeem.online",
    "description": "موقع متخصص في مراجعات الألعاب، النظريات، الأخبار والمقالات المتعمقة في عالم ألعاب الفيديو",
    "inLanguage": "ar",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.reviewqeem.online/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>ReviewQeem | ريفيو قيم - مراجعات ألعاب، نظريات، أخبار ومقالات</title>
        <meta name="description" content="موقع متخصص في مراجعات ألعاب الفيديو، نظريات الألعاب، أحدث الأخبار والمقالات المتعمقة. اكتشف عالم الألعاب مع ReviewQeem." />
        <link rel="canonical" href="https://www.reviewqeem.online/" />
        <meta property="og:title" content="ReviewQeem | ريفيو قيم - مراجعات ألعاب، نظريات، أخبار ومقالات" />
        <meta property="og:description" content="موقع متخصص في مراجعات ألعاب الفيديو، نظريات الألعاب، أحدث الأخبار والمقالات المتعمقة." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.reviewqeem.online/" />
        <meta property="og:locale" content="ar_SA" />
        <meta property="og:site_name" content="ReviewQeem" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ReviewQeem | ريفيو قيم" />
        <meta name="twitter:description" content="موقع متخصص في مراجعات ألعاب الفيديو، نظريات الألعاب، أحدث الأخبار والمقالات المتعمقة." />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      
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
