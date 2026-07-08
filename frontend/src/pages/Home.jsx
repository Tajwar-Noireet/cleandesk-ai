import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import AnimatedSection from '../components/AnimatedSection';
import {
  InboxIcon,
  MessageIcon,
  UserIcon,
  ClockIcon,
  ShieldIcon,
  CheckIcon,
  AlertIcon,
  CalendarIcon,
  ArrowRightIcon,
  StatusDotIcon
} from '../components/Icons';
import { fadeUp, staggerContainer } from '../utils/motionPresets';

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'regular',
    label: 'Regular cleaning',
    description: 'Weekly or fortnightly domestic clean. Dusting, vacuuming, kitchen and bathroom.',
    price: '£40',
    duration: '2 hours',
    tag: 'Most popular'
  },
  {
    id: 'deep',
    label: 'Deep cleaning',
    description: 'Full in-depth clean including baseboards, behind appliances, and windows.',
    price: '£90',
    duration: '4 hours',
    tag: null
  },
  {
    id: 'move-out',
    label: 'Move-out cleaning',
    description: 'End-of-tenancy clean to satisfy landlord inventories.',
    price: '£120',
    duration: '5 hours',
    tag: 'End of tenancy'
  },
  {
    id: 'office',
    label: 'Office cleaning',
    description: 'Commercial spaces, meeting rooms, kitchen, and communal areas.',
    price: 'Custom quote',
    duration: 'Variable',
    tag: 'Commercial'
  },
  {
    id: 'carpet',
    label: 'Carpet cleaning',
    description: 'Hot-water extraction deep clean for carpets and rugs.',
    price: '£35/room',
    duration: '1.5 hrs',
    tag: null
  }
];

// ─── Trust Metrics ────────────────────────────────────────────────────────────
const TRUST_METRICS = [
  { value: '98%', label: 'Customer satisfaction' },
  { value: '2 hrs', label: 'Average response time' },
  { value: 'Insured', label: 'All cleaners vetted' },
  { value: 'Eco', label: 'Eco-friendly products' }
];

// ─── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: '01',
    title: 'Choose your service',
    description: 'Pick from regular, deep, move-out, office, or carpet cleaning. No account required.'
  },
  {
    number: '02',
    title: 'Submit your request',
    description: 'Fill in your address, date preference, and any notes. Takes under 60 seconds.'
  },
  {
    number: '03',
    title: 'We confirm within 2 hours',
    description: 'Our team reviews, assigns a vetted cleaner, and confirms your booking by email.'
  },
  {
    number: '04',
    title: 'Track your booking',
    description: 'Create a free customer account to track status, reschedule, or chat with our team.'
  }
];

// ─── Owner Sidebar ─────────────────────────────────────────────────────────────
const OwnerSidePanel = () => (
  <div style={{
    borderTop: '1px solid var(--color-border)',
    padding: '1.5rem 2rem',
    background: '#F9F9FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.75rem'
  }}>
    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
      Are you a business owner?{' '}
      <Link to="/dashboard" style={{ color: '#0A0A0A', fontWeight: '600', textDecoration: 'none' }}>
        Open owner dashboard →
      </Link>
    </span>
    <Link to="/demo" style={{ fontSize: '0.8rem', color: '#6B7280', textDecoration: 'none' }}>
      Try the live AI demo
    </Link>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);

  const handleBookService = (serviceId) => {
    const svc = SERVICES.find(s => s.id === serviceId);
    if (!svc) return;
    navigate(`/book?service=${encodeURIComponent(svc.label)}`);
  };

  return (
    <div className="home-shell" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <AnimatedSection
        id="hero"
        className="scroll-section"
        style={{ padding: '5rem 0 3.5rem' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box' }}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '680px' }}
          >
            <motion.span
              variants={fadeUp}
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#6B7280',
                marginBottom: '1rem'
              }}
            >
              SparkleHome Cleaning · Greater London
            </motion.span>

            <motion.h1
              variants={fadeUp}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: '700',
                color: '#0A0A0A',
                margin: '0 0 1.25rem',
                lineHeight: '1.1',
                letterSpacing: '-0.03em'
              }}
            >
              Book a professional<br />cleaning service.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{
                fontSize: '1rem',
                color: '#6B7280',
                lineHeight: '1.6',
                margin: '0 0 2rem',
                maxWidth: '520px'
              }}
            >
              Vetted, insured cleaners across Greater London. Request a quote in under 60 seconds.
              No account needed to get started.
            </motion.p>

            <motion.div
              variants={fadeUp}
              style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
            >
              <Link
                to="/book"
                className="btn-primary btn-large font-semibold"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                Request a clean <ArrowRightIcon size={15} />
              </Link>
              <Link
                to="/customer/login"
                className="btn-secondary btn-large"
                style={{ textDecoration: 'none' }}
              >
                Track my booking
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', backgroundColor: '#FAFAFA', padding: '1.25rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {TRUST_METRICS.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0A0A0A' }}>{m.value}</span>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES GRID ─────────────────────────────────────────────────── */}
      <AnimatedSection
        id="services"
        className="scroll-section"
        style={{ padding: '5rem 0' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#9CA3AF',
              marginBottom: '0.5rem'
            }}>
              Services
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '700', color: '#0A0A0A', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
              Choose your cleaning service
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>
              All services include eco-friendly products and insured, vetted professionals.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {SERVICES.map(svc => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                  cursor: 'default'
                }}
                className="service-hover-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0A0A0A', margin: 0, lineHeight: '1.2' }}>
                    {svc.label}
                  </h3>
                  {svc.tag && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: '#0A0A0A',
                      color: '#FFFFFF',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {svc.tag}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: '1.5', flexGrow: 1 }}>
                  {svc.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0A0A0A' }}>{svc.price}</span>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{svc.duration}</span>
                  </div>
                  <button
                    onClick={() => handleBookService(svc.id)}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    Book <ArrowRightIcon size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <AnimatedSection
        id="how-it-works"
        className="scroll-section"
        style={{ padding: '5rem 0', backgroundColor: '#F9F9FA', borderTop: '1px solid var(--color-border)' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '3rem' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#9CA3AF',
              marginBottom: '0.5rem'
            }}>
              How it works
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '700', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
              Booking in four steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <span style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: '#E5E7EB',
                  letterSpacing: '-0.04em',
                  lineHeight: 1
                }}>
                  {step.number}
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0A0A0A', margin: 0 }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── WORKSPACE SWITCH (owner/customer) ─────────────────────────────── */}
      <AnimatedSection
        id="workspace-switch"
        className="scroll-section"
        style={{ padding: '5rem 0', borderTop: '1px solid var(--color-border)' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#9CA3AF',
              marginBottom: '0.5rem'
            }}>
              Workspaces
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '700', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
              Choose your workspace
            </h2>
          </div>

          <div className="workspace-grid-equal">
            <div className="workspace-card-equal">
              <div>
                <h3>Customer portal</h3>
                <p>
                  Track your enquiry, view booking status, read conversation history, and request changes.
                </p>
              </div>
              <Link
                to="/customer/login"
                className="btn-primary font-semibold"
                style={{ textAlign: 'center', display: 'block', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}
              >
                Track my booking
              </Link>
            </div>

            <div className="workspace-card-equal">
              <div>
                <h3>Owner workspace</h3>
                <p>
                  Manage services, FAQs, leads, conversations, review queues, and customer operations.
                </p>
              </div>
              <Link
                to="/dashboard"
                className="btn-secondary font-semibold"
                style={{ textAlign: 'center', display: 'block', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}
              >
                Owner dashboard
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <AnimatedSection
        id="cta"
        className="scroll-section"
        style={{ padding: '5rem 0', backgroundColor: '#0A0A0A' }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box', textAlign: 'center' }}>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2
              variants={fadeUp}
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: '700',
                color: '#FFFFFF',
                margin: '0 0 1rem',
                letterSpacing: '-0.02em',
                lineHeight: '1.1'
              }}
            >
              Ready for a spotless home?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: '0 0 2rem', lineHeight: '1.6' }}
            >
              Request your clean in under 60 seconds. No account, no payment required upfront.
            </motion.p>
            <motion.div
              variants={fadeUp}
              style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link
                to="/book"
                style={{
                  background: '#FFFFFF',
                  color: '#0A0A0A',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                Book a clean <ArrowRightIcon size={14} />
              </Link>
              <Link
                to="/customer/login"
                style={{
                  background: 'transparent',
                  color: '#D1D5DB',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  border: '1px solid #374151'
                }}
              >
                Track existing booking
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '2rem 0', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Logo size={16} dark={false} showText={true} />
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/demo" style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'none' }}>Live demo</Link>
            <Link to="/customer/login" style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'none' }}>Customer portal</Link>
            <Link to="/login" style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'none' }}>Owner login</Link>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#D1D5DB' }}>© {new Date().getFullYear()} CleanDesk</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
