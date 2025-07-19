import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();
  
  // Unique navigation items only
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Studio', path: '/studio' },
    { name: 'Guides', path: '/guides' },
    { name: 'FAQ', path: '/faq' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            Director's Cut
          </Link>
          
          {/* Single navigation section - no duplicates */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <Button
                key={`menu-${index}-${item.name}`}
                variant={location.pathname === item.path ? 'default' : 'secondary'}
                asChild
                className={cn(
                  'transition-all duration-300',
                  location.pathname === item.path && 'shadow-spotlight'
                )}
              >
                <Link to={item.path}>{item.name}</Link>
              </Button>
            ))}
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              Menu
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;