import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const BrandLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-card">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <div className="space-y-4">
            <div><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
            <div><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
            <Button variant="hero" className="w-full rounded-xl" onClick={() => navigate("/brand/dashboard")}>
              {isLogin ? "Log In" : "Sign Up"}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">{isLogin ? "Sign up" : "Log in"}</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandLogin;
