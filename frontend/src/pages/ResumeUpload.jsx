import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Zap,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge } from '../components/ui';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    validateAndSetFile(f);
  };

  const validateAndSetFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setStatus(null);
      setMessage('');
    } else if (f) {
      setFile(null);
      setStatus('error');
      setMessage('Rejected: Only machine-readable PDF manifests are accepted.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus('processing');
    setMessage('Parsing professional identity matrix...');

    const fd = new FormData();
    fd.append('resume', file);
    try {
      await api.post('/resume/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser(); // Refresh hasResume status
      setStatus('success');
      setMessage('Analysis complete. Neural mapping integrated.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Neural Uplink failed. Verify source integrity.');
      setIsUploading(false);
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    validateAndSetFile(f);
  };

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-up">
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Badge icon={Cpu}>Neural Intelligence Engine</Badge>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
          Neural <span className="text-gradient">Analysis</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', fontWeight: 500, maxWidth: '600px', lineHeight: 1.6 }}>
          Connect your professional DNA to our high-performance AI engine. We extract deep skill markers and map your trajectory into the next career tier.
        </p>
      </div>

      <GlassCard style={{ padding: '3.5rem', position: 'relative', overflow: 'hidden' }} hover={false}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.03, pointerEvents: 'none' }}>
          <Fingerprint size={320} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <label
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              borderRadius: '28px',
              border: `2px dashed ${file ? 'var(--primary)' : 'rgba(255,255,255,0.06)'}`,
              backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255,255,255,0.01)',
              padding: '5rem 2rem',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} />
            {status === 'processing' && <div className="scanning-line" />}

            {file ? (
              <div style={{ animation: 'fadeUp 0.4s', textAlign: 'center' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 2rem', position: 'relative' }}>
                  <FileText size={42} />
                  <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', backgroundColor: '#10b981', borderRadius: '50%', padding: '4px', border: '4px solid #0f172a' }}>
                    <CheckCircle2 size={16} color="white" />
                  </div>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>{file.name}</h3>
                <Badge variant="success">Manifest Entity Detected</Badge>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', margin: '0 auto 2rem' }}>
                  <Upload size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>Initialize Data Ingest</h3>
                <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>Drag professional manifest or click to browse</p>
              </div>
            )}
          </label>

          {status && status !== 'processing' && (
            <div style={{ marginTop: '2rem', padding: '1.25rem', borderRadius: '18px', border: `1px solid ${status === 'error' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`, backgroundColor: status === 'error' ? 'rgba(244, 63, 94, 0.05)' : 'rgba(16, 185, 129, 0.05)', color: status === 'error' ? '#f43f5e' : '#10b981', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>
              {status === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span>{message}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '3.5rem' }}>
            <Button variant="ghost" fullWidth onClick={() => { setFile(null); setStatus(null); }}>Discard</Button>
            <Button variant="primary" fullWidth loading={status === 'processing'} disabled={!file} onClick={handleUpload} icon={Zap}>
              Initialize Analysis
            </Button>
          </div>
        </div>
      </GlassCard>

      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <GuidelineItem icon={<ShieldCheck size={20} />} title="Encrypted Uplink" desc="AES-256 secure tunnel for all manifest data." />
        <GuidelineItem icon={<Cpu size={20} />} title="Machine Readable" desc="Optimized for direct PDF text extraction." />
        <GuidelineItem icon={<Zap size={20} />} title="Neural Mapping" desc="Real-time industry benchmark sync." />
      </div>
    </div>
  );
};

const GuidelineItem = ({ icon, title, desc }) => (
  <GlassCard style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>{icon}</div>
    <div>
      <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>{title}</h4>
      <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{desc}</p>
    </div>
  </GlassCard>
);

export default ResumeUpload;
