'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileText, Users, Shield, Zap, Code, Eye, Share2, Timer, CheckCircle, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Redirect old shared links from root to /app
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('share');
    if (shareToken) {
      router.replace(`/u?share=${encodeURIComponent(shareToken)}`);
    }
  }, [router]);

  const features = [
    {
      icon: FileText,
      title: "Smart Documentation Creator",
      description: "Create beautiful README files with our intuitive three-panel editor",
      color: "text-blue-500"
    },
    {
      icon: Share2,
      title: "Secure Sharing System",
      description: "Share documentation with controlled access - view-only or edit permissions",
      color: "text-green-500"
    },
    {
      icon: Code,
      title: "Live Syntax Highlighting",
      description: "Real-time markdown editing with syntax highlighting and instant preview",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage multiple projects and team members with granular access controls",
      color: "text-orange-500"
    },
    {
      icon: Shield,
      title: "File-Based Storage",
      description: "Reliable JSON file storage system with automatic backups and cross-browser sync",
      color: "text-red-500"
    },
    {
      icon: Zap,
      title: "Offline-First Design",
      description: "Works seamlessly offline with localStorage fallback and hybrid architecture",
      color: "text-yellow-500"
    }
  ];

  const benefits = [
    "Centralized project documentation management",
    "Instant sharing with stakeholder access control",
    "Professional README creation in minutes",
    "Team collaboration with version control",
    "Mobile-responsive documentation platform",
    "Export capabilities for external use"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Technical Lead",
      company: "TechFlow Solutions",
      content: "Doc0 transformed how we manage project documentation. The sharing system is game-changing.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager",
      company: "InnovateHub",
      content: "Finally, a documentation platform that doesn't get in the way. Clean, fast, and incredibly intuitive.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "DevOps Engineer",
      company: "CloudScale Inc",
      content: "The offline-first approach saved us countless times. Reliable documentation platform we can trust.",
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    router.push('/app');
  };

  const handleViewDemo = () => {
    // TODO: Implement demo functionality
    console.log('Demo clicked');
  };

  const handleScheduleDemo = () => {
    // TODO: Implement demo scheduling
    console.log('Schedule demo clicked');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <Badge variant="secondary" className="mb-8 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              Trusted by 500+ Development Teams
            </Badge>
            
            <h1 id="hero-heading" className="text-5xl md:text-7xl tracking-tight mb-8 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              Doc0
            </h1>
            
            <p className="text-2xl md:text-3xl mb-6">
              Documentation Made
              <span className="block text-green-600">Effortless</span>
            </p>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Create, manage, and share professional project documentation with 
              Doc0&apos;s intuitive platform. From README files to comprehensive 
              project docs, streamline your entire documentation workflow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-8 py-6 text-lg group"
                aria-label="Get started with Doc0 for free"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
              
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg" onClick={handleViewDemo} aria-label="View Doc0 demo">
                <Eye className="mr-2 w-5 h-5" aria-hidden="true" />
                View Demo
              </Button>
            </div>
            
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto" role="region" aria-label="Platform statistics">
              <div className="text-center">
                <div className="text-3xl text-primary" aria-label="500 plus active projects">500+</div>
                <div className="text-muted-foreground">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-primary" aria-label="10 thousand plus documentation pages">10K+</div>
                <div className="text-muted-foreground">Documentation Pages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-primary" aria-label="99.9 percent uptime">99.9%</div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 id="features-heading" className="text-4xl md:text-5xl mb-6">
              Everything You Need for
              <br />
              <span className="text-primary">Professional Documentation</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline your documentation workflow 
              and enhance team collaboration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/50 backdrop-blur"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                role="listitem"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                    hoveredFeature === index ? 'from-primary to-purple-600' : 'from-muted to-muted-foreground/20'
                  } flex items-center justify-center mb-6 transition-all duration-300`}>
                    <feature.icon className={`w-8 h-8 ${
                      hoveredFeature === index ? 'text-white' : feature.color
                    } transition-colors duration-300`} aria-hidden="true" />
                  </div>
                  
                  <h3 className="text-xl mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24" aria-labelledby="benefits-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 id="benefits-heading" className="text-4xl mb-8">
                Why Choose
                <br />
                <span className="text-primary">Doc0?</span>
              </h2>
              
              <div className="space-y-4" role="list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3" role="listitem">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" aria-hidden="true" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="mt-8 px-8 py-6 text-lg group"
                aria-label="Start creating documentation now"
              >
                Start Creating Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-2xl p-8">
                <div className="bg-card rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <Badge>Live Preview</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-8 bg-primary/20 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="testimonials-heading" className="text-4xl mb-6">
              Loved by <span className="text-primary">Development Teams</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users are saying about Doc0
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur border-0" role="listitem">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </blockquote>
                  
                  <footer>
                    <cite className="not-italic">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </cite>
                  </footer>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-4xl md:text-5xl mb-6">
            Ready to Transform Your
            <br />
            <span className="text-primary">Documentation Workflow?</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join hundreds of development teams who trust Doc0 for their 
            documentation needs. Start creating professional docs today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="px-8 py-6 text-lg group"
              aria-label="Get started with Doc0 for free"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
            
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg" onClick={handleScheduleDemo} aria-label="Schedule a demo of Doc0">
              <Timer className="mr-2 w-5 h-5" aria-hidden="true" />
              Schedule Demo
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-8">
            No credit card required • Free forever plan • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl mb-4">Doc0</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                The ultimate documentation platform for modern development teams. 
                Create, manage, and share professional project documentation effortlessly.
              </p>
              <div className="flex space-x-4">
                <Badge variant="secondary">Documentation Platform</Badge>
                <Badge variant="secondary">Team Collaboration</Badge>
              </div>
            </div>
            
            <nav aria-labelledby="product-links">
              <h4 id="product-links" className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </nav>
            
            <nav aria-labelledby="company-links">
              <h4 id="company-links" className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </nav>
          </div>
          
          <div className="border-t border-border pt-8 mt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Doc0. All rights reserved. Built with <span aria-label="love">❤️</span> for developers.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}