import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Director's Cut</h3>
            <p className="text-muted-foreground text-sm">
              Professional AI-powered tools for the next generation of filmmakers and content creators.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/studio" className="text-muted-foreground hover:text-primary transition-colors text-sm">Studio</Link></li>
              <li><Link to="/guides" className="text-muted-foreground hover:text-primary transition-colors text-sm">Guides</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm">Pricing</Link></li>
              <li><Link to="/api" className="text-muted-foreground hover:text-primary transition-colors text-sm">API</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</Link></li>
              <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors text-sm">Help Center</Link></li>
              <li><Link to="/status" className="text-muted-foreground hover:text-primary transition-colors text-sm">Status</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">About</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors text-sm">Careers</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm mb-4 md:mb-0">
              © 2024 Director's Cut. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link to="/instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.35-1.052-2.35-2.35 0-1.297 1.053-2.35 2.35-2.35 1.298 0 2.351 1.053 2.351 2.35 0 1.298-1.053 2.35-2.351 2.35zm7.718 0c-1.297 0-2.35-1.052-2.35-2.35 0-1.297 1.053-2.35 2.35-2.35 1.298 0 2.351 1.053 2.351 2.35 0 1.298-1.053 2.35-2.351 2.35z" />
                </svg>
              </Link>
              <Link to="/youtube" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;