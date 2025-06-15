
import { Github, Twitter, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full py-8 md:py-12 mt-12 md:mt-20">
      <div className="container px-4 md:px-6 lg:px-8">
        <div className="glass glass-hover rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 md:gap-3">
                <img 
                  src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png" 
                  alt="PROMPTO TRADING Logo" 
                  className="w-5 h-5 md:w-6 md:h-6 object-contain"
                />
                <h3 className="font-medium text-base md:text-lg">PROMPTO TRADING</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering traders with advanced crypto trading solutions.
              </p>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                   <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-sm text-muted-foreground story-link">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/wallet" className="text-sm text-muted-foreground story-link">
                    My Wallet
                  </Link>
                </li>
                <li>
                  <Link to="/trading" className="text-sm text-muted-foreground story-link">
                    Trading
                  </Link>
                </li>
                <li>
                  <Link to="/trading" className="text-sm text-muted-foreground story-link">
                    Markets
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground story-link">
                    Trading Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground story-link">
                    Market Analysis
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground story-link">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground story-link">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <Link to="/admin/login" className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} PROMPTO TRADING. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
