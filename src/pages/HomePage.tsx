import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, Shield, Smartphone } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: 'Instant Approval',
      description: 'Get your loan approved within minutes, not days',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your data is protected with bank-level security',
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Apply directly from your phone, anytime, anywhere',
    },
    {
      icon: CheckCircle2,
      title: 'Flexible Terms',
      description: 'Choose a repayment plan that works for you',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
            Quick Loans at Your Fingertips
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get instant access to funds when you need them most. Simple application, fast approval, and flexible repayment options.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/eligibility')}
            className="bg-background text-primary hover:bg-background/90 font-semibold text-lg px-8 py-6 shadow-elevated"
          >
            Apply for a Loan Now
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-foreground">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Check your eligibility in just a few minutes. No hidden fees, no complicated paperwork.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/eligibility')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-6"
          >
            Check Eligibility
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 M-Pesa Loans. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
