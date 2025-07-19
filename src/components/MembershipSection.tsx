import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'; // Also import sub-components
import { Check } from 'lucide-react';

const MembershipSection = () => {
  const memberships = [
    {
      name: 'Associate Director',
      price: '$49',
      period: '/month',
      description: 'Perfect for indie filmmakers and content creators getting started',
      features: [
        'Basic Script Analysis',
        'Character Development Tools',
        'Scene Planning Assistant',
        '10 Projects/Month',
        'Email Support',
        'Basic Templates'
      ],
      highlighted: false
    },
    {
      name: 'Director',
      price: '$149',
      period: '/month',
      description: 'For professional directors and production companies',
      features: [
        'Advanced Script Analysis',
        'Full Character Development Suite',
        'Advanced Scene Planning',
        'Unlimited Projects',
        'Priority Support',
        'Premium Templates',
        'Budget Estimation Tools',
        'Crew Management'
      ],
      highlighted: true
    },
    {
      name: 'Executive Director',
      price: '$349',
      period: '/month',
      description: 'Complete studio-grade solution for large productions',
      features: [
        'All Director Features',
        'Custom AI Model Training',
        'White-label Solutions',
        'Dedicated Account Manager',
        'Advanced Analytics',
        'API Access',
        'Custom Integrations',
        '24/7 Phone Support'
      ],
      highlighted: false
    }
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Membership
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your production needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {memberships.map((membership) => (
            <Card 
              key={membership.name}
              className={`relative bg-gradient-card border-border p-8 h-full flex flex-col transition-all duration-500 ${
                membership.highlighted 
                  ? 'border-primary shadow-spotlight scale-105 md:scale-110' 
                  : 'hover:border-primary/50 hover:shadow-depth'
              }`}
            >
              {membership.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {membership.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {membership.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-primary">
                    {membership.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {membership.period}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 mb-8">
                <ul className="space-y-4">
                  {membership.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                variant={membership.highlighted ? 'default' : 'outline'}
                size="lg"
                className={`w-full transition-all duration-300 ${
                  membership.highlighted 
                    ? 'shadow-spotlight' 
                    : 'hover:shadow-depth'
                }`}
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;