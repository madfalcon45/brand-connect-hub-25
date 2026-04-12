import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import brandcampLogo from "@/assets/BC Full Logo Transparent.png";
const Index = () => (
  <div
    className="min-h-screen flex flex-col"
    style={{
      background:
        "linear-gradient(165deg, hsl(150, 55%, 88%) 0%, hsl(152, 48%, 72%) 28%, hsl(155, 52%, 48%) 58%, hsl(158, 58%, 28%) 100%)",
    }}
  >
    <div className="flex shrink-0 justify-center px-4 pt-10 pb-6 sm:pt-12 sm:pb-8">
      <img
        src={brandcampLogo}
        alt="BrandCamp"
        className="h-auto w-auto max-h-24 max-w-[min(100%,420px)] object-contain drop-shadow-sm sm:max-h-32 md:max-h-36"
      />
    </div>
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-16">
      <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
        <Button variant="hero" size="lg" className="w-full sm:flex-1 rounded-xl py-6 text-base shadow-md" asChild>
          <Link to="/signup?role=brand">
            Join as a Brand
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        <Button variant="hero-outline" size="lg" className="w-full sm:flex-1 rounded-xl bg-background/90 py-6 text-base shadow-md backdrop-blur-sm" asChild>
          <Link to="/signup?role=creator">
            Join as a Creator
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  </div>
);

export default Index;
