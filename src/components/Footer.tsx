
import { Github, Twitter, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full py-12 mt-20">
      <div className="container px-4">
        <div className="glass glass-hover rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">CryptoTrade</h3>
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
                  <Link to="/admin-login" className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} CryptoTrade. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
