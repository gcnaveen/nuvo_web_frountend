import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import RecruitmentForm from './RecruitmentForm';
import './recruitmentFormTheme.css';
import '../../../landing.css';

const RecruitmentFormPage = () => {
  const navigate = useNavigate();

  return (
    <div className="nuvo-landing recruitment-form-page min-h-screen overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors"
            style={{
              borderColor: 'var(--color-rich-earth)',
              color: 'var(--color-deep-espresso)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-warm-putty)';
              e.currentTarget.style.borderColor = 'var(--color-deep-espresso)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.borderColor = 'var(--color-rich-earth)';
            }}
          >
            <span aria-hidden>←</span> Back
          </button>
        </motion.div>

        <motion.h1
          className="text-center text-3xl sm:text-4xl font-bold mb-2"
          style={{ color: 'var(--color-deep-espresso)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Join Our{' '}
          <span style={{ color: 'var(--color-rich-earth)' }}>Team</span>
        </motion.h1>
        <motion.p
          className="text-center text-sm sm:text-base mb-8"
          style={{ color: 'var(--color-text-secondary)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Fill in your details and upload your images. We'll get back to you
          soon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <RecruitmentForm />
        </motion.div>
      </div>
    </div>
  );
};

export default RecruitmentFormPage;
