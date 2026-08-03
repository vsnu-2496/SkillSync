/**
 * Billing.jsx — SkillSync AI Subscription & Billing
 * ─────────────────────────────────────────────────────────────────────
 * Professional subscription tier overview.
 * Displays Free Plan (Current), Pro Plan (Coming Soon), and Enterprise Plan (Coming Soon).
 * No broken links or incomplete actions.
 */
import React from 'react';
import {
  CreditCard, CheckCircle2, Sparkles, Shield, Zap, Building2, Star, ArrowRight, Lock
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const Billing = () => {
  const { user } = useAuth();

  const PLANS = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      description: 'Essential placement readiness tools for students.',
      isCurrent: true,
      badge: 'Current Plan',
      badgeVariant: 'success',
      buttonText: 'Active Plan',
      buttonDisabled: true,
      features: [
        'Deterministic Resume Analysis',
        'AI Career Readiness Scoring',
        'Basic Career Mapping',
        'Company Explorer Access',
        'Standard Interview Question Bank',
        '1 Mock Interview / month'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Career Plan',
      price: '$19',
      period: 'per month',
      description: 'Advanced AI features, unlimited analyses, and deep company insights.',
      isCurrent: false,
      isPopular: true,
      badge: 'Coming Soon',
      badgeVariant: 'primary',
      buttonText: 'Coming Soon',
      buttonDisabled: true,
      features: [
        'Unlimited AI Resume Analyses',
        'Deep Gemini Flash 1.5 JDs Match',
        'Unlimited AI Mock Interviews',
        'Voice-to-Text Interview Scoring',
        'Personalized Priority Skill Roadmaps',
        'Export Detailed PDF Career Reports',
        '24/7 Priority Support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Campus Enterprise',
      price: 'Custom',
      period: 'per institution',
      description: 'Comprehensive placement analytics for colleges and universities.',
      isCurrent: false,
      badge: 'Coming Soon',
      badgeVariant: 'warning',
      buttonText: 'Coming Soon',
      buttonDisabled: true,
      features: [
        'Institutional Student Dashboard',
        'Batch Placement Readiness Analytics',
        'Custom Campus Company Curations',
        'Admin Cohort Management',
        'Dedicated Success Manager',
        'SLA & Custom Integration API'
      ]
    }
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Subscription"
        gradient="& Billing"
        subtitle="Manage your SkillSync AI plan, explore tier features, and upgrade your career intelligence."
        badge={<Badge variant="primary" icon={CreditCard}>Free Tier Active</Badge>}
      />

      {/* ── CURRENT SUBSCRIPTION STATUS BAR ── */}
      <GlassCard style={{ marginBottom: '2.5rem', border: '1px solid rgba(99, 102, 241, 0.2)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(168, 85, 247, 0.03))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Sparkles size={26} />
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Active Subscription</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', marginTop: '2px' }}>
                SkillSync AI Student Free Tier
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Account: {user?.email || 'Student Account'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Badge variant="success" icon={CheckCircle2}>Active Account</Badge>
          </div>
        </div>
      </GlassCard>

      {/* ── PLANS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {PLANS.map((plan) => (
          <GlassCard
            key={plan.id}
            style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              position: 'relative',
              border: plan.isPopular ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.04)',
              background: plan.isPopular ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.04), transparent)' : 'rgba(255,255,255,0.01)'
            }}
          >
            {plan.isPopular && (
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.35rem 1rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '0 0 0 14px' }}>
                Most Popular
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white' }}>{plan.name}</h3>
                <Badge variant={plan.badgeVariant}>{plan.badge}</Badge>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', minHeight: '40px' }}>{plan.description}</p>
            </div>

            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{plan.price}</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '0.5rem' }}>/ {plan.period}</span>
            </div>

            {/* Features List */}
            <div style={{ flex: 1, marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Included Features</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plan.features.map((feat, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <CheckCircle2 size={16} color={plan.isCurrent ? '#10b981' : '#6366f1'} style={{ flexShrink: 0 }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <button
              disabled={plan.buttonDisabled}
              style={{
                width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: 'none',
                background: plan.isCurrent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                color: plan.isCurrent ? '#10b981' : '#818cf8',
                fontWeight: 800, fontSize: '0.9rem', cursor: plan.buttonDisabled ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {!plan.isCurrent && <Lock size={15} />}
              <span>{plan.buttonText}</span>
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Billing;
