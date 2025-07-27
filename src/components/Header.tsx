"use client";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { cn } from '../lib/utils'; // Corrected path
import { UserCircle, Gem } from 'lucide-react';

// This is a mock user for demonstration. In a real app, this would come from your authentication system.
const mockUser = {
  isLoggedIn: true,
  email: 'user@example.com',
  plan: 'Token-Based', // or 'Monthly', 'Annual'
  tokens: 450,
};

const Header = () => {
  const location = useLocation();
  const [user, setUser] = useState(mockUser);
  
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
          
          {/* Kept your existing main navigation */}
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
          
          {/* --- MODIFICATION: Added the new user auth and token display section --- */}
          <div className="flex items-center gap-4">
            {user.isLoggedIn ? (
              <>
                {user.plan === 'Token-Based' && (
                  <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm">
                    <Gem className="w-4 h-4 text-yellow-400" />
                    <span>{user.tokens} Tokens</span>
                  </div>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    <UserCircle className="w-8 h-8" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <p className="text-sm text-muted-foreground px-2 py-1">{user.email}</p>
                    <p className="text-sm font-semibold px-2 py-1">{user.plan} Plan</p>
                    <Button variant="outline" className="w-full mt-2">Buy More Tokens</Button>
                    <Button variant="ghost" className="w-full mt-1" onClick={() => setUser({ ...mockUser, isLoggedIn: false })}>
                      Logout
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                 <Button variant="ghost">Login</Button>
                 <Button>Sign Up</Button>
              </div>
            )}
          </div>
          
          <div className="md:hidden">
            {/* This mobile menu would also need to be updated with login state */}
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
