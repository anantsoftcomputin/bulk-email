import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Mail, Send, BarChart3, Users, Layers, Shield, Zap, MousePointerClick,
  Eye, ArrowRight, ChevronRight, Check, Star, Globe, Lock, RefreshCw,
  Smartphone, Server, FileText, Target, TrendingUp, Clock, CheckCircle2,
  Inbox, LayoutGrid, Palette, Code2, MonitorSmartphone, CloudCog
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle'); // idle | sending | sent | error

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If already logged in, go directly to dashboard
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
    <div className="landing-root">
      {/* ═══════════════ CSS ═══════════════ */}
      <style>{`
        .landing-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #111827; overflow-x: hidden; line-height: 1.6;
        }
        .landing-root *, .landing-root *::before, .landing-root *::after { box-sizing: border-box; }
        .landing-root a { text-decoration: none; color: inherit; }

        /* ── Utilities ── */
        .lp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .lp-section { padding: 100px 0; }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px;
          border-radius: 100px; font-size: 13px; font-weight: 600;
        }
        .lp-badge-light { background: rgba(6, 182, 212, 0.1); color: #0891b2; }
        .lp-badge-dark { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.95); }
        .lp-gradient-text {
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .lp-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px;
          border-radius: 14px; font-weight: 700; font-size: 16px; border: none; cursor: pointer;
          transition: all 0.3s ease; font-family: inherit;
        }
        .lp-btn-primary {
          background: linear-gradient(135deg, #f59e0b, #fb923c); color: #ffffff;
          box-shadow: 0 4px 24px rgba(251, 146, 60, 0.4);
        }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(251, 146, 60, 0.5); }
        .lp-btn-white {
          background: #ffffff; color: #0891b2;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .lp-btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.15); color: #0e7490; }
        .lp-btn-outline {
          background: transparent; color: #06b6d4; border: 2px solid #06b6d4;
        }
        .lp-btn-outline:hover { background: #06b6d4; color: #fff; }
        .lp-btn-outline-white {
          background: rgba(255,255,255,0.1); color: #ffffff; border: 2px solid rgba(255,255,255,0.4);
        }
        .lp-btn-outline-white:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.6); }
        .lp-btn-sm { padding: 10px 24px; font-size: 14px; border-radius: 10px; }

        /* ── Animations ── */
        @keyframes lp-fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes lp-gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes lp-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .lp-fade-up { opacity: 0; transform: translateY(30px); transition: all 0.7s cubic-bezier(0.16,1,0.3,1); }
        .lp-fade-up.lp-visible { opacity: 1; transform: translateY(0); }
        .lp-float { animation: lp-float 6s ease-in-out infinite; }

        /* ── Nav ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 16px 0; transition: all 0.3s ease;
        }
        .lp-nav.lp-scrolled {
          background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 12px 0;
        }
        .lp-nav .lp-container { display: flex; align-items: center; justify-content: space-between; }
        .lp-nav-logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
        .lp-nav-links { display: flex; align-items: center; gap: 32px; }
        .lp-nav-links a { font-size: 14px; font-weight: 600; color: #6b7280; transition: color 0.2s; }
        .lp-nav-links a:hover { color: #06b6d4; }

        /* ── HERO ── */
        .lp-hero {
          position: relative; padding: 160px 0 120px; overflow: hidden;
          background: linear-gradient(135deg, #0f172a 0%, #164e63 50%, #0e2b3d 100%);
          color: #fff;
        }
        .lp-hero::before {
          content: ''; position: absolute; top: -20%; right: -10%; width: 700px; height: 700px;
          border-radius: 50%; background: radial-gradient(circle, rgba(6,182,212,0.25), transparent 70%);
        }
        .lp-hero::after {
          content: ''; position: absolute; bottom: -20%; left: -10%; width: 500px; height: 500px;
          border-radius: 50%; background: radial-gradient(circle, rgba(251,146,60,0.15), transparent 70%);
        }
        .lp-hero .lp-container { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .lp-hero h1 { font-size: 56px; font-weight: 900; line-height: 1.08; letter-spacing: -1.5px; margin-bottom: 24px; }
        .lp-hero-sub { font-size: 18px; color: rgba(255,255,255,0.65); line-height: 1.7; margin-bottom: 36px; max-width: 520px; }
        .lp-hero-buttons { display: flex; gap: 16px; flex-wrap: wrap; }

        /* Hero card */
        .lp-hero-card {
          background: rgba(255,255,255,0.06); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 32px;
        }
        .lp-hero-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .lp-hero-card-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-hero-stat-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .lp-hero-stat {
          flex: 1; padding: 16px 12px; border-radius: 16px; text-align: center;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
        }
        .lp-hero-stat-value { font-size: 26px; font-weight: 800; }
        .lp-hero-stat-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.5px; margin-top: 4px; opacity: 0.5;
        }
        .lp-hero-bars { display: flex; align-items: flex-end; gap: 6px; height: 72px; }
        .lp-hero-bar {
          flex: 1; border-radius: 6px 6px 3px 3px; min-height: 6px;
          transition: height 1s ease;
        }

        /* Floating badges */
        .lp-float-badge {
          position: absolute; padding: 12px 18px; border-radius: 14px; display: flex;
          align-items: center; gap: 8px; font-size: 13px; font-weight: 700;
          background: rgba(255,255,255,0.08); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* ── Trust ── */
        .lp-trust {
          padding: 48px 0; background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .lp-trust p { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 28px; text-align: center; }
        .lp-trust-logos { display: flex; justify-content: center; align-items: center; gap: 48px; flex-wrap: wrap; }
        .lp-trust-logo { font-size: 18px; font-weight: 800; color: #94a3b8; letter-spacing: -0.5px; }

        /* ── Features (light gray bg) ── */
        .lp-features { background: #f8fafc; }
        .lp-features-header { max-width: 640px; margin: 0 auto 64px; text-align: center; }
        .lp-features-header h2 { font-size: 42px; font-weight: 900; letter-spacing: -1px; margin-bottom: 16px; line-height: 1.15; }
        .lp-features-header p { font-size: 18px; color: #6b7280; }
        .lp-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .lp-feature-card {
          padding: 32px; border-radius: 20px; background: #fff;
          border: 1px solid #e5e7eb; transition: all 0.3s ease; position: relative;
        }
        .lp-feature-card:hover { border-color: transparent; box-shadow: 0 12px 40px rgba(0,0,0,0.08); transform: translateY(-4px); }
        .lp-feature-icon {
          width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px;
        }
        .lp-feature-card h3 { font-size: 17px; font-weight: 800; margin-bottom: 8px; }
        .lp-feature-card p { font-size: 14px; color: #6b7280; line-height: 1.7; }

        .lp-features-cta {
          text-align: center; margin-top: 56px; padding: 40px; border-radius: 24px;
          background: linear-gradient(135deg, #ecfeff, #f0fdfa, #fef3c7);
          border: 1px solid #cffafe;
        }
        .lp-features-cta h3 { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
        .lp-features-cta p { font-size: 15px; color: #6b7280; margin-bottom: 20px; }

        /* ── Steps (dark section) ── */
        .lp-steps-section {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          color: #fff;
        }
        .lp-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: 64px; }
        .lp-step { text-align: center; position: relative; }
        .lp-step-number {
          width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 900; margin: 0 auto 20px;
          background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff;
          box-shadow: 0 4px 20px rgba(6,182,212,0.4);
        }
        .lp-step h3 { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
        .lp-step p { font-size: 14px; color: rgba(255,255,255,0.5); max-width: 220px; margin: 0 auto; }
        .lp-step-cta { margin-top: 56px; text-align: center; }

        /* ── Tracking (white) ── */
        .lp-tracking { background: #fff; }
        .lp-tracking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .lp-tracking-content h2 { font-size: 42px; font-weight: 900; letter-spacing: -1px; margin-bottom: 16px; line-height: 1.15; }
        .lp-tracking-content > p { font-size: 18px; color: #6b7280; margin-bottom: 36px; }
        .lp-tracking-item { display: flex; gap: 16px; margin-bottom: 24px; }
        .lp-tracking-item-icon {
          width: 44px; height: 44px; min-width: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-tracking-item h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .lp-tracking-item p { font-size: 14px; color: #6b7280; }

        .lp-tracking-visual {
          background: linear-gradient(135deg, #ecfeff, #fef3c7); border-radius: 24px;
          padding: 36px; border: 1px solid #cffafe;
        }
        .lp-tracking-card {
          background: #fff; border-radius: 16px; padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04); margin-bottom: 14px;
          border: 1px solid #f3f4f6;
        }
        .lp-tracking-card:last-child { margin-bottom: 0; }
        .lp-tracking-row { display: flex; align-items: center; justify-content: space-between; }
        .lp-tracking-label { font-size: 13px; font-weight: 600; color: #6b7280; }
        .lp-tracking-value { font-size: 20px; font-weight: 800; }
        .lp-tracking-bar { height: 8px; border-radius: 8px; background: #f3f4f6; margin-top: 10px; overflow: hidden; }
        .lp-tracking-bar-fill { height: 100%; border-radius: 8px; }
        .lp-tracking-cta { margin-top: 24px; text-align: center; }

        /* ── Builder (light gray) ── */
        .lp-builder { background: #f8fafc; }
        .lp-builder-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .lp-builder-visual { order: -1; }
        .lp-builder-mock {
          background: #fff; border-radius: 20px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;
        }
        .lp-builder-toolbar {
          padding: 14px 20px; background: #f8fafc; border-bottom: 1px solid #e5e7eb;
          display: flex; gap: 10px;
        }
        .lp-builder-tool {
          width: 36px; height: 36px; border-radius: 10px; background: #fff;
          border: 1px solid #cffafe; display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: #0891b2;
        }
        .lp-builder-canvas { padding: 28px; }
        .lp-builder-block {
          padding: 18px; border: 2px dashed #e5e7eb; border-radius: 12px;
          margin-bottom: 10px; text-align: center; font-size: 13px; color: #9ca3af; font-weight: 600;
        }
        .lp-builder-block.active { border-color: #06b6d4; background: rgba(6,182,212,0.08); color: #0891b2; }

        /* ── Stats (gradient dark) ── */
        .lp-stats {
          background: linear-gradient(135deg, #06b6d4, #0891b2, #0e7490);
          background-size: 200% 200%; animation: lp-gradient-shift 8s ease infinite;
          color: #fff;
        }
        .lp-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center; }
        .lp-stat-number { font-size: 52px; font-weight: 900; letter-spacing: -2px; line-height: 1; }
        .lp-stat-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }

        /* ── Security (white) ── */
        .lp-security { background: #fff; }
        .lp-security-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
        .lp-security-card {
          padding: 32px; border-radius: 20px; text-align: center;
          background: linear-gradient(180deg, #f8fafc, #fff);
          border: 1px solid #e5e7eb;
        }
        .lp-security-card .lp-sec-icon {
          width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 16px;
        }
        .lp-security-card h3 { font-size: 17px; font-weight: 800; margin-bottom: 8px; }
        .lp-security-card p { font-size: 14px; color: #6b7280; }

        /* ── Enquiry (dark) ── */
        .lp-enquiry {
          background: linear-gradient(135deg, #0f172a, #164e63); color: #fff;
          position: relative; overflow: hidden;
        }
        .lp-enquiry::before {
          content: ''; position: absolute; top: -30%; right: -15%; width: 600px; height: 600px;
          border-radius: 50%; background: radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%);
        }
        .lp-enquiry .lp-container { position: relative; z-index: 1; }
        .lp-enquiry-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .lp-enquiry-content h2 { font-size: 42px; font-weight: 900; letter-spacing: -1px; margin-bottom: 16px; line-height: 1.15; }
        .lp-enquiry-content > p { font-size: 18px; color: rgba(255,255,255,0.5); margin-bottom: 32px; }
        .lp-enquiry-benefit { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.8); }
        .lp-enquiry-benefit .lp-check {
          width: 28px; height: 28px; min-width: 28px; border-radius: 8px;
          background: rgba(16,185,129,0.15); display: flex; align-items: center; justify-content: center;
        }

        .lp-form {
          background: rgba(255,255,255,0.05); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 36px;
        }
        .lp-form h3 { font-size: 22px; font-weight: 800; margin-bottom: 24px; }
        .lp-form-group { margin-bottom: 16px; }
        .lp-form-group label { display: block; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
        .lp-form-group input, .lp-form-group textarea {
          width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06); color: #fff; font-size: 15px; font-family: inherit;
          outline: none; transition: border-color 0.2s;
        }
        .lp-form-group input::placeholder, .lp-form-group textarea::placeholder { color: rgba(255,255,255,0.25); }
        .lp-form-group input:focus, .lp-form-group textarea:focus { border-color: #6366f1; }
        .lp-form-group textarea { resize: vertical; min-height: 100px; }
        .lp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .lp-form-success {
          text-align: center; padding: 24px; background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2); border-radius: 16px; margin-top: 12px;
        }

        /* ── CTA Banner ── */
        .lp-cta-banner {
          background: linear-gradient(135deg, #f8fafc, #eff6ff, #f5f3ff);
          border-top: 1px solid #e0e7ff; border-bottom: 1px solid #e0e7ff;
        }
        .lp-cta-banner .lp-container {
          display: flex; align-items: center; justify-content: space-between; gap: 40px;
        }
        .lp-cta-banner h3 { font-size: 24px; font-weight: 800; }
        .lp-cta-banner p { font-size: 15px; color: #6b7280; margin-top: 4px; }

        /* ── Final CTA ── */
        .lp-final-cta {
          background: linear-gradient(135deg, #06b6d4, #0891b2, #0e7490);
          background-size: 200% 200%; animation: lp-gradient-shift 8s ease infinite;
          color: #fff; text-align: center;
        }
        .lp-final-cta h2 { font-size: 48px; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 16px; }
        .lp-final-cta p { font-size: 18px; opacity: 0.7; max-width: 560px; margin: 0 auto 40px; }

        /* ── Footer ── */
        .lp-footer { background: #0f172a; color: rgba(255,255,255,0.5); padding: 60px 0 32px; }
        .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .lp-footer-brand h3 { font-size: 22px; font-weight: 900; margin-bottom: 12px; }
        .lp-footer-brand p { font-size: 14px; line-height: 1.7; max-width: 300px; }
        .lp-footer-col h4 { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .lp-footer-col a { display: block; font-size: 14px; margin-bottom: 10px; transition: color 0.2s; }
        .lp-footer-col a:hover { color: #fff; }
        .lp-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px;
          display: flex; justify-content: space-between; font-size: 13px;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .lp-hero .lp-container { grid-template-columns: 1fr; text-align: center; }
          .lp-hero-sub { margin: 0 auto 36px; }
          .lp-hero-buttons { justify-content: center; }
          .lp-hero .lp-hero-visual { max-width: 480px; margin: 40px auto 0; }
          .lp-float-badge { display: none; }
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-steps { grid-template-columns: repeat(2, 1fr); }
          .lp-tracking-grid, .lp-builder-grid, .lp-enquiry-grid { grid-template-columns: 1fr; gap: 48px; }
          .lp-builder-visual { order: 0; }
          .lp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .lp-footer-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-cta-banner .lp-container { flex-direction: column; text-align: center; }
        }
        @media (max-width: 640px) {
          .lp-hero h1 { font-size: 36px; }
          .lp-hero { padding: 120px 0 80px; }
          .lp-section { padding: 72px 0; }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-features-header h2, .lp-tracking-content h2, .lp-enquiry-content h2 { font-size: 30px; }
          .lp-stats-grid { grid-template-columns: 1fr 1fr; }
          .lp-stat-number { font-size: 38px; }
          .lp-security-grid { grid-template-columns: 1fr; }
          .lp-final-cta h2 { font-size: 30px; }
          .lp-steps { grid-template-columns: 1fr; }
          .lp-footer-grid { grid-template-columns: 1fr; }
          .lp-footer-bottom { flex-direction: column; gap: 8px; }
          .lp-nav-links { display: none; }
          .lp-form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav className={`lp-nav ${scrolled ? 'lp-scrolled' : ''}`}>
        <div className="lp-container">
          <div className="lp-nav-logo"><span className="lp-gradient-text">MailForge</span></div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#tracking">Tracking</a>
            <a href="#builder">Builder</a>
            <a href="#enquiry">Contact</a>
            <Link to="/login" className="lp-btn lp-btn-primary lp-btn-sm">Get Started <ArrowRight size={16} /></Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO — Dark ═══ */}
      <section className="lp-hero">
        <div className="lp-container">
          <HeroContent />
          <HeroVisual />
        </div>
      </section>

      {/* ═══ TRUST — Light gray ═══ */}
      <section className="lp-trust">
        <div className="lp-container">
          <p>Works with every SMTP provider</p>
          <div className="lp-trust-logos">
            {['Gmail', 'SendGrid', 'Amazon SES', 'Mailgun', 'Postmark', 'Custom SMTP'].map(n => (
              <span key={n} className="lp-trust-logo">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — Light gray bg ═══ */}
      <section className="lp-features lp-section" id="features">
        <div className="lp-container">
          <FadeUp className="lp-features-header">
            <span className="lp-badge lp-badge-light">✨ Features</span>
            <h2 style={{ marginTop: 16 }}>Everything you need to<br /><span className="lp-gradient-text">own your email</span></h2>
            <p>A complete toolkit — from contact management to real-time analytics.</p>
          </FadeUp>
          <FeaturesGrid />
          <FadeUp className="lp-features-cta">
            <h3>Ready to see it in action?</h3>
            <p>Create your free account and send your first campaign in minutes.</p>
            <Link to="/register" className="lp-btn lp-btn-primary lp-btn-sm">
              Start Free <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Dark ═══ */}
      <section className="lp-steps-section lp-section" id="how-it-works">
        <div className="lp-container">
          <FadeUp style={{ textAlign: 'center' }}>
            <span className="lp-badge lp-badge-dark">🔄 How It Works</span>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1, marginTop: 16 }}>
              Four steps to <span style={{ color: '#22d3ee' }}>campaign success</span>
            </h2>
          </FadeUp>
          <StepsGrid />
          <div className="lp-step-cta">
            <Link to="/register" className="lp-btn lp-btn-white">
              <Zap size={18} /> Start Your First Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS — Gradient purple ═══ */}
      <section className="lp-stats lp-section">
        <div className="lp-container">
          <div className="lp-stats-grid">
            {[
              { val: '99.8%', label: 'Uptime' },
              { val: '50K+', label: 'Emails / Hour' },
              { val: '100%', label: 'Data Isolation' },
              { val: '<1s', label: 'Tracking Latency' },
            ].map(s => (
              <FadeUp key={s.label} style={{ textAlign: 'center' }}>
                <div className="lp-stat-number">{s.val}</div>
                <div className="lp-stat-label">{s.label}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRACKING — White ═══ */}
      <section className="lp-tracking lp-section" id="tracking">
        <div className="lp-container">
          <div className="lp-tracking-grid">
            <TrackingContent />
            <TrackingVisual />
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER — Gradient light ═══ */}
      <section className="lp-cta-banner lp-section" style={{ padding: '48px 0' }}>
        <div className="lp-container">
          <div>
            <h3>Want detailed tracking for every email?</h3>
            <p>Open pixels and click redirects are built in. Zero configuration required.</p>
          </div>
          <Link to="/register" className="lp-btn lp-btn-primary lp-btn-sm" style={{ whiteSpace: 'nowrap' }}>
            Try It Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ═══ BUILDER — Light gray ═══ */}
      <section className="lp-builder lp-section" id="builder">
        <div className="lp-container">
          <div className="lp-builder-grid">
            <BuilderContent />
            <BuilderVisual />
          </div>
        </div>
      </section>

      {/* ═══ SECURITY — White ═══ */}
      <section className="lp-security lp-section" id="security">
        <div className="lp-container">
          <FadeUp style={{ textAlign: 'center' }}>
            <span className="lp-badge lp-badge-light">🔐 Security & Infrastructure</span>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1, marginTop: 16 }}>
              Enterprise-grade.<br /><span className="lp-gradient-text">Cloud-powered.</span>
            </h2>
          </FadeUp>
          <SecurityGrid />
        </div>
      </section>

      {/* ═══ CTA BANNER 2 — Gradient light ═══ */}
      <section className="lp-cta-banner lp-section" style={{ padding: '48px 0' }}>
        <div className="lp-container">
          <div>
            <h3>Questions? Need a custom setup?</h3>
            <p>Drop us a message and we'll get back to you within 24 hours.</p>
          </div>
          <a href="#enquiry" className="lp-btn lp-btn-outline lp-btn-sm" style={{ whiteSpace: 'nowrap' }}>
            Contact Us <ChevronRight size={16} />
          </a>
        </div>
      </section>

      {/* ═══ ENQUIRY — Dark ═══ */}
      <section className="lp-enquiry lp-section" id="enquiry">
        <div className="lp-container">
          <div className="lp-enquiry-grid">
            <FadeUp className="lp-enquiry-content">
              <span className="lp-badge lp-badge-dark">💬 Get In Touch</span>
              <h2 style={{ marginTop: 16 }}>Have questions?<br /><span style={{ color: '#818cf8' }}>We'd love to hear from you.</span></h2>
              <p>Whether you need a demo, have a feature request, or want to discuss enterprise pricing — reach out.</p>
              {[
                'Free account setup assistance',
                'Dedicated onboarding for teams',
                'Custom SMTP configuration help',
                'Priority support for enterprise',
              ].map(b => (
                <div key={b} className="lp-enquiry-benefit">
                  <span className="lp-check"><Check size={16} color="#10b981" /></span>
                  {b}
                </div>
              ))}
            </FadeUp>

            <FadeUp>
              <form className="lp-form" onSubmit={handleEnquiry}>
                <h3>Send us a message</h3>
                <div className="lp-form-row">
                  <div className="lp-form-group">
                    <label>Full Name</label>
                    <input
                      type="text" placeholder="John Doe" required
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="lp-form-group">
                    <label>Email</label>
                    <input
                      type="email" placeholder="john@company.com" required
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="lp-form-group">
                  <label>Company (optional)</label>
                  <input
                    type="text" placeholder="Acme Inc."
                    value={formData.company}
                    onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                  />
                </div>
                <div className="lp-form-group">
                  <label>Message</label>
                  <textarea
                    placeholder="Tell us what you need..." required
                    value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  />
                </div>
                <button
                  type="submit"
                  className="lp-btn lp-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? (
                    <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                  ) : (
                    <><Send size={18} /> Send Message</>
                  )}
                </button>
                {formStatus === 'sent' && (
                  <div className="lp-form-success">
                    <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontWeight: 700 }}>Message sent!</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>We'll get back to you within 24 hours.</div>
                  </div>
                )}
                {formStatus === 'error' && (
                  <div className="lp-form-success" style={{ background: 'rgba(244,63,94,0.1)', borderColor: 'rgba(244,63,94,0.2)' }}>
                    <div style={{ fontWeight: 700, color: '#f43f5e' }}>Failed to send. Please try again.</div>
                  </div>
                )}
              </form>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="lp-final-cta lp-section">
        <div className="lp-container">
          <FadeUp>
            <h2>Ready to transform your<br />email campaigns?</h2>
            <p>Set up in minutes. Send your first campaign today. No credit card required.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="lp-btn lp-btn-white">
                <Zap size={18} /> Get Started — Free
              </Link>
              <a href="#enquiry" className="lp-btn lp-btn-outline-white">
                Talk to Sales <ArrowRight size={16} />
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <h3><span className="lp-gradient-text">MailForge</span></h3>
              <p>The enterprise bulk email platform with real-time tracking, visual builder, and cloud infrastructure.</p>
            </div>
            <div className="lp-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#tracking">Tracking</a>
              <a href="#builder">Email Builder</a>
              <a href="#security">Security</a>
            </div>
            <div className="lp-footer-col">
              <h4>Platform</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
              <a href="#enquiry">Contact</a>
            </div>
            <div className="lp-footer-col">
              <h4>SMTP Providers</h4>
              <a href="#">Gmail / Google</a>
              <a href="#">Amazon SES</a>
              <a href="#">SendGrid</a>
              <a href="#">Mailgun</a>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 MailForge. All rights reserved.</span>
            <span>Built with React, Firebase & Netlify</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ═══════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════ */

// Intersection Observer fade-up wrapper
const FadeUp = ({ children, className = '', style = {} }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`lp-fade-up ${visible ? 'lp-visible' : ''} ${className}`} style={style}>{children}</div>;
};

const HeroContent = () => (
  <div style={{ animation: 'lp-fadeUp 0.8s ease forwards' }}>
    <span className="lp-badge lp-badge-dark">🚀 Enterprise-Grade Email Platform</span>
    <h1 style={{ marginTop: 20 }}>
      Send smarter.<br />
      <span style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Track everything.
      </span>
    </h1>
    <p className="lp-hero-sub">
      The all-in-one platform to create, send, and optimize bulk email campaigns.
      Real-time open &amp; click tracking, drag-and-drop builder, and cloud-powered
      infrastructure — all from one dashboard.
    </p>
    <div className="lp-hero-buttons">
      <Link to="/register" className="lp-btn lp-btn-primary">
        <Zap size={18} /> Start Free
      </Link>
      <a href="#features" className="lp-btn lp-btn-outline-white">See Features</a>
    </div>
  </div>
);

const HeroVisual = () => {
  const bars = [40, 65, 50, 80, 70, 95, 55, 75, 60, 90, 85, 70];
  const colors = ['#06b6d4', '#0891b2', '#f59e0b', '#fb923c'];
  return (
    <div className="lp-hero-visual" style={{ position: 'relative' }}>
      <div className="lp-hero-card lp-float">
        <div className="lp-hero-card-header">
          <div className="lp-hero-card-dot" style={{ background: '#ef4444' }} />
          <div className="lp-hero-card-dot" style={{ background: '#f59e0b' }} />
          <div className="lp-hero-card-dot" style={{ background: '#10b981' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>Campaign Dashboard</span>
        </div>
        <div className="lp-hero-stat-row">
          <div className="lp-hero-stat">
            <div className="lp-hero-stat-value" style={{ color: '#22d3ee' }}>12.4K</div>
            <div className="lp-hero-stat-label">Sent</div>
          </div>
          <div className="lp-hero-stat">
            <div className="lp-hero-stat-value" style={{ color: '#34d399' }}>68.2%</div>
            <div className="lp-hero-stat-label">Open Rate</div>
          </div>
          <div className="lp-hero-stat">
            <div className="lp-hero-stat-value" style={{ color: '#fbbf24' }}>24.7%</div>
            <div className="lp-hero-stat-label">Click Rate</div>
          </div>
        </div>
        <div className="lp-hero-bars">
          {bars.map((h, i) => (
            <div key={i} className="lp-hero-bar" style={{
              height: `${h}%`,
              background: `linear-gradient(180deg, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]}60)`,
            }} />
          ))}
        </div>
      </div>
      <div className="lp-float-badge lp-float" style={{ top: -10, right: -20, animationDelay: '1s' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ color: '#34d399' }}>+2,847 opens today</span>
      </div>
      <div className="lp-float-badge lp-float" style={{ bottom: -10, left: -20, animationDelay: '2s' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
        <span style={{ color: '#22d3ee' }}>98.6% delivered</span>
      </div>
    </div>
  );
};

const features = [
  { icon: <Users size={22} />, bg: '#ecfeff', color: '#0891b2', title: 'Contact Management', desc: 'Import via CSV/Excel, tag, filter, and segment. Bulk actions, status tracking, and group-level organization.' },
  { icon: <Target size={22} />, bg: '#f0fdf4', color: '#059669', title: 'Smart Groups', desc: 'Create unlimited groups and target specific audiences. View per-group engagement stats for precision.' },
  { icon: <Palette size={22} />, bg: '#faf5ff', color: '#7c3aed', title: 'Drag & Drop Builder', desc: 'Visual email editor with content blocks, inline CSS, and live preview. Works on every device and client.' },
  { icon: <Send size={22} />, bg: '#fffbeb', color: '#d97706', title: 'Campaign Wizard', desc: 'Step-by-step: choose template, set audience, schedule delivery. Send now or queue for later.' },
  { icon: <Inbox size={22} />, bg: '#fef2f2', color: '#dc2626', title: 'Queue & Delivery', desc: 'Enterprise queue with rate limiting, auto-retry, priority scheduling, and stuck-email recovery.' },
  { icon: <BarChart3 size={22} />, bg: '#f0fdf4', color: '#059669', title: 'Real-Time Analytics', desc: 'Live dashboards with open/click rates, delivery metrics, charts, and contact growth trends.' },
  { icon: <Eye size={22} />, bg: '#ecfeff', color: '#0891b2', title: 'Open & Click Tracking', desc: 'Invisible pixel for opens, link redirect for clicks. Per-recipient, per-campaign — real-time.' },
  { icon: <Server size={22} />, bg: '#faf5ff', color: '#7c3aed', title: 'Multi-SMTP Support', desc: 'Connect multiple SMTP providers, one-click test, TLS/SSL. Gmail, SES, SendGrid, or custom.' },
  { icon: <CloudCog size={22} />, bg: '#f0fdf4', color: '#059669', title: 'Cloud Infrastructure', desc: 'Firebase backend — data syncs across devices, per-user isolation, and automatic backup.' },
];

const FeaturesGrid = () => (
  <div className="lp-features-grid">
    {features.map((f, i) => (
      <FadeUp key={i}>
        <div className="lp-feature-card">
          <div className="lp-feature-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      </FadeUp>
    ))}
  </div>
);

const StepsGrid = () => (
  <div className="lp-steps">
    {[
      { n: 1, title: 'Import Contacts', desc: 'Upload CSV or add manually. Tag, group, and segment your audience.' },
      { n: 2, title: 'Design Email', desc: 'Use the drag-and-drop builder or paste your own HTML template.' },
      { n: 3, title: 'Send Campaign', desc: 'Select audience, configure SMTP, hit send — or schedule it.' },
      { n: 4, title: 'Track Results', desc: 'Watch opens, clicks, and deliveries in real-time analytics.' },
    ].map(s => (
      <FadeUp key={s.n} className="lp-step">
        <div className="lp-step-number">{s.n}</div>
        <h3>{s.title}</h3>
        <p>{s.desc}</p>
      </FadeUp>
    ))}
  </div>
);

const TrackingContent = () => (
  <FadeUp className="lp-tracking-content">
    <span className="lp-badge lp-badge-light">📈 Email Tracking</span>
    <h2 style={{ marginTop: 16 }}>Know exactly who opened,<br /><span className="lp-gradient-text">clicked, and engaged</span></h2>
    <p>Every email is automatically instrumented with tracking. No setup needed.</p>
    {[
      { icon: <Eye size={20} />, bg: '#f0fdf4', color: '#059669', title: 'Open Tracking', desc: 'Invisible 1×1 pixel fires when the recipient opens your email.' },
      { icon: <MousePointerClick size={20} />, bg: '#ecfeff', color: '#0891b2', title: 'Click Tracking', desc: 'All links automatically wrapped. Original URL preserved, click recorded.' },
      { icon: <Zap size={20} />, bg: '#fffbeb', color: '#d97706', title: 'Real-Time Stats', desc: 'Campaign stats update instantly. See opens and clicks the moment they happen.' },
    ].map(t => (
      <div key={t.title} className="lp-tracking-item">
        <div className="lp-tracking-item-icon" style={{ background: t.bg, color: t.color }}>{t.icon}</div>
        <div>
          <h4>{t.title}</h4>
          <p>{t.desc}</p>
        </div>
      </div>
    ))}
    <Link to="/register" className="lp-btn lp-btn-primary lp-btn-sm" style={{ marginTop: 12 }}>
      Try Tracking Free <ArrowRight size={16} />
    </Link>
  </FadeUp>
);

const TrackingVisual = () => (
  <FadeUp className="lp-tracking-visual">
    {[
      { label: 'Open Rate', value: '68.2%', color: '#059669', grad: 'linear-gradient(90deg,#059669,#10b981)', w: 68 },
      { label: 'Click Rate', value: '24.7%', color: '#0891b2', grad: 'linear-gradient(90deg,#0891b2,#06b6d4)', w: 25 },
      { label: 'Delivery Rate', value: '98.6%', color: '#d97706', grad: 'linear-gradient(90deg,#d97706,#f59e0b)', w: 98 },
    ].map(t => (
      <div key={t.label} className="lp-tracking-card">
        <div className="lp-tracking-row">
          <span className="lp-tracking-label">{t.label}</span>
          <span className="lp-tracking-value" style={{ color: t.color }}>{t.value}</span>
        </div>
        <div className="lp-tracking-bar">
          <div className="lp-tracking-bar-fill" style={{ width: `${t.w}%`, background: t.grad }} />
        </div>
      </div>
    ))}
    <div className="lp-tracking-cta">
      <a href="#enquiry" style={{ fontSize: 14, fontWeight: 700, color: '#0891b2', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        Want a demo? Contact us <ChevronRight size={14} />
      </a>
    </div>
  </FadeUp>
);

const BuilderContent = () => (
  <FadeUp>
    <span className="lp-badge lp-badge-light">🎨 Email Builder</span>
    <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1, marginTop: 16, lineHeight: 1.15 }}>
      Drag. Drop.<br /><span className="lp-gradient-text">Send beautiful emails.</span>
    </h2>
    <p style={{ fontSize: 18, color: '#6b7280', margin: '16px 0 36px', lineHeight: 1.7 }}>
      Create professional, responsive emails with no coding. Every email renders with inline CSS for
      maximum compatibility across all clients.
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
      {['📝 Text', '🖼️ Images', '🔘 Buttons', '📊 Columns', '➖ Dividers', '📐 Spacers'].map(b => (
        <span key={b} style={{ display: 'inline-flex', padding: '8px 14px', background: '#f1f5f9', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#475569' }}>{b}</span>
      ))}
    </div>
    <Link to="/register" className="lp-btn lp-btn-primary lp-btn-sm">
      Try the Builder <ArrowRight size={16} />
    </Link>
  </FadeUp>
);

const BuilderVisual = () => (
  <FadeUp className="lp-builder-visual">
    <div className="lp-builder-mock">
      <div className="lp-builder-toolbar">
        {[<FileText size={16} />, <LayoutGrid size={16} />, <Palette size={16} />, <Code2 size={16} />, <MonitorSmartphone size={16} />].map((ic, i) => (
          <div key={i} className="lp-builder-tool">{ic}</div>
        ))}
      </div>
      <div className="lp-builder-canvas">
        {[
          { text: '📌 Heading Block', active: true },
          { text: '📝 Text — "Hi {{first_name}}, check out our latest..."', active: false },
          { text: '🖼️ Image — hero-banner.png', active: false },
          { text: '🔘 Button — "Shop Now →"', active: true },
          { text: '➖ Divider', active: false },
          { text: '📝 Footer — Unsubscribe | View in browser', active: false },
        ].map((b, i) => (
          <div key={i} className={`lp-builder-block ${b.active ? 'active' : ''}`}>{b.text}</div>
        ))}
      </div>
    </div>
  </FadeUp>
);

const securityItems = [
  { icon: <Lock size={24} />, bg: '#ecfeff', color: '#0891b2', title: 'Firebase Authentication', desc: 'Email/password and Google OAuth. Secure token-based sessions.' },
  { icon: <Shield size={24} />, bg: '#f0fdf4', color: '#059669', title: 'Per-User Data Isolation', desc: 'Contacts, campaigns, analytics in isolated Firestore paths.' },
  { icon: <Globe size={24} />, bg: '#faf5ff', color: '#7c3aed', title: 'Cross-Device Sync', desc: 'Log in anywhere. Your data is always up to date.' },
  { icon: <Zap size={24} />, bg: '#fffbeb', color: '#d97706', title: 'Serverless Functions', desc: 'Tracking on Netlify Functions. Zero servers, infinite scale.' },
  { icon: <RefreshCw size={24} />, bg: '#fef2f2', color: '#dc2626', title: 'Automatic Backups', desc: 'Firestore handles replication and backup automatically.' },
  { icon: <Smartphone size={24} />, bg: '#f0fdf4', color: '#059669', title: 'Responsive Design', desc: 'Full-featured on desktop, tablet, and mobile.' },
];

const SecurityGrid = () => (
  <div className="lp-security-grid">
    {securityItems.map((s, i) => (
      <FadeUp key={i}>
        <div className="lp-security-card">
          <div className="lp-sec-icon" style={{ background: s.bg, color: s.color, width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{s.icon}</div>
          <h3>{s.title}</h3>
          <p>{s.desc}</p>
        </div>
      </FadeUp>
    ))}
  </div>
);

export default LandingPage;
