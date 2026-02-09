import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Mail, Send, BarChart3, Users, Zap, Shield, Target, TrendingUp,
  CheckCircle2, ArrowRight, Star, Globe, Sparkles, Rocket,
  Clock, Eye, MousePointerClick, Layers, Code2, LayoutGrid,
  Database, Lock, RefreshCw, Inbox, FileText, Award
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    try {
      const res = await fetch('/.netlify/functions/enquiry-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, submittedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Failed');
      setFormStatus('sent');
      setFormData({ name: '', email: '', company: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float { 
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .float-animation { animation: float 6s ease-in-out infinite; }
        .fade-in { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in-visible { opacity: 1; transform: translateY(0); }
        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-effect shadow-lg py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Bulke</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-purple-600 transition font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition font-medium">How It Works</a>
            <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition font-medium">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-700 hover:text-purple-600 font-medium transition">
              Sign In
            </Link>
            <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 gradient-animate" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-animation" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-animation" style={{ animationDelay: '2s' }} />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-semibold text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Email Marketing Made Simple</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Send Bulk Emails
              <br />
              <span className="text-gradient">That Actually Get Read</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create stunning email campaigns, track every open and click, and grow your business with powerful analytics. 
              All in one beautiful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                Start Free Trial
                <Rocket className="w-5 h-5" />
              </Link>
              <a href="#demo" className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-purple-600 hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                Watch Demo
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Send, value: '10M+', label: 'Emails Delivered' },
              { icon: Users, value: '50K+', label: 'Happy Users' },
              { icon: TrendingUp, value: '98%', label: 'Delivery Rate' }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <stat.icon className="w-10 h-10 text-purple-600 mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Everything You Need to <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make email marketing effortless and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: LayoutGrid, 
                title: 'Drag & Drop Builder', 
                desc: 'Create beautiful emails without coding. Intuitive visual editor with pre-built templates.',
                color: 'from-purple-500 to-purple-600'
              },
              { 
                icon: BarChart3, 
                title: 'Real-Time Analytics', 
                desc: 'Track opens, clicks, and conversions in real-time with detailed insights.',
                color: 'from-blue-500 to-blue-600'
              },
              { 
                icon: Users, 
                title: 'Contact Management', 
                desc: 'Organize contacts into groups, import from CSV, and segment your audience.',
                color: 'from-pink-500 to-pink-600'
              },
              { 
                icon: Target, 
                title: 'Advanced Targeting', 
                desc: 'Send personalized campaigns to the right people at the right time.',
                color: 'from-indigo-500 to-indigo-600'
              },
              { 
                icon: Zap, 
                title: 'Lightning Fast', 
                desc: 'Send thousands of emails per hour with our optimized delivery system.',
                color: 'from-yellow-500 to-orange-600'
              },
              { 
                icon: Shield, 
                title: 'Secure & Compliant', 
                desc: 'Enterprise-grade security with automatic unsubscribe handling and GDPR compliance.',
                color: 'from-green-500 to-green-600'
              }
            ].map((feature, i) => (
              <div key={i} className="fade-in bg-gray-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Launch Your Campaign in <span className="text-gradient">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600">From contacts to conversions in minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                step: '01', 
                icon: Database, 
                title: 'Import Contacts', 
                desc: 'Upload your contact list via CSV or add them manually. Organize into groups for targeted campaigns.'
              },
              { 
                step: '02', 
                icon: Layers, 
                title: 'Design Your Email', 
                desc: 'Use our drag-and-drop builder or choose from professional templates. Customize every detail.'
              },
              { 
                step: '03', 
                icon: Rocket, 
                title: 'Send & Track', 
                desc: 'Hit send and watch real-time analytics roll in. See who opens, clicks, and converts.'
              }
            ].map((item, i) => (
              <div key={i} className="fade-in text-center relative" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-2xl">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <span className="text-lg font-black text-purple-600">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Loved by <span className="text-gradient">Thousands</span>
            </h2>
            <p className="text-xl text-gray-600">See what our customers have to say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Marketing Director @ TechCorp',
                avatar: 'SJ',
                text: 'Bulke transformed our email campaigns. The analytics are incredible and we\'ve seen a 3x increase in engagement!',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'Founder @ StartupHub',
                avatar: 'MC',
                text: 'Finally, an email tool that\'s both powerful and easy to use. The drag-and-drop builder saves us hours every week.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Growth Manager @ SaaS Inc',
                avatar: 'ER',
                text: 'Best ROI we\'ve seen from any marketing tool. The real-time tracking helps us optimize campaigns on the fly.',
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="fade-in bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100 hover:shadow-xl transition-all duration-300" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 gradient-animate relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="fade-in">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Ready to Transform Your Email Marketing?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using Bulke to grow their audience and increase sales
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#demo" className="px-8 py-4 bg-transparent text-white rounded-xl font-bold text-lg border-2 border-white hover:bg-white hover:text-purple-600 transition-all duration-300 flex items-center gap-2">
                Schedule Demo
              </a>
            </div>
            <p className="text-purple-200 mt-6 text-sm">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600">Have questions? We'd love to hear from you</p>
          </div>
          <form onSubmit={handleEnquiry} className="fade-in space-y-6 bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition"
              />
            </div>
            <input
              type="text"
              placeholder="Company (Optional)"
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition"
            />
            <textarea
              placeholder="Your Message"
              required
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition resize-none"
            />
            <button
              type="submit"
              disabled={formStatus === 'sending'}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {formStatus === 'sending' && 'Sending...'}
              {formStatus === 'sent' && (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Message Sent!
                </>
              )}
              {formStatus === 'error' && 'Error - Try Again'}
              {formStatus === 'idle' && (
                <>
                  Send Message
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Bulke</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The modern email marketing platform for businesses of all sizes.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-purple-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Templates</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-purple-400 transition">About</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-purple-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Security</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bulke. All rights reserved. Made with ❤️ for email marketers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
