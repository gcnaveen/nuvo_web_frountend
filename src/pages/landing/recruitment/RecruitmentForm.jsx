// src/pages/landing/recruitment/RecruitmentForm.jsx
//
// Submits a single multipart/form-data POST to:
//   POST /users/api/register/staff/
//
// Images are sent as files[]: images[] — no separate upload step.
// All field names match what staff_registration.py reads via request.POST.get()

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, message, Result } from 'antd';
import { API_BASE_URL } from '../../../landing_config';
import UploadSection from './sections/UploadSection';
import PersonalInfoSection from './sections/PersonalInfoSection';
import DimensionsSection from './sections/DimensionsSection';
import EducationSection from './sections/EducationSection';
import LanguagesSection from './sections/LanguagesSection';
import ExperienceSection from './sections/ExperienceSection';

const RecruitmentForm = () => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({ mode: 'onSubmit' });

  // ── Image state (raw File objects — no pre-upload) ────────────
  const [imagesFileList, setImagesFileList] = useState([]);
  const [imagesUploading] = useState(false); // kept for UploadSection prop
  const [uploadedCount, setUploadedCount] = useState(0);

  // ── Other experience text ─────────────────────────────────────
  const [otherExperienceChecked, setOtherExperienceChecked] = useState(false);
  const [otherExperienceText, setOtherExperienceText] = useState('');

  // ── Submission state ──────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stageName, setStageName] = useState('');

  const [messageApi, contextHolder] = message.useMessage();
  const watchedExperienceAreas = watch('experienceAreas') || [];

  useEffect(() => {
    const isOther = watchedExperienceAreas.includes('other');
    setOtherExperienceChecked((prev) => (prev !== isOther ? isOther : prev));
  }, [watchedExperienceAreas]);

  useEffect(() => {
    if (!otherExperienceChecked) {
      setOtherExperienceText((prev) => (prev !== '' ? '' : prev));
      setTimeout(() => clearErrors('otherExperienceText'), 0);
    }
  }, [otherExperienceChecked, clearErrors]);

  // ── Image handler — just keep raw File objects, no pre-upload ─
  const handleImagesChange = useCallback(
    (newFileList) => {
      // Validate 2 MB limit client-side
      const valid = newFileList.filter((item) => {
        const file = item.originFileObj || item;
        if (file && file.size && file.size / 1024 / 1024 >= 2) {
          messageApi.error(
            `${file.name} exceeds 2 MB — please choose a smaller image.`,
          );
          return false;
        }
        return true;
      });
      setImagesFileList(valid.slice(0, 4));
      setUploadedCount(valid.slice(0, 4).length);
    },
    [messageApi],
  );

  // ── Submit ────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    // Validate images
    if (uploadedCount === 0) {
      messageApi.error('Please upload at least one image.');
      return;
    }
    // Validate "Other" experience text
    if (otherExperienceChecked && !otherExperienceText.trim()) {
      setError('otherExperienceText', {
        type: 'required',
        message: 'Please specify your other experience',
      });
      return;
    }
    clearErrors('otherExperienceText');

    // ── Build experience areas list ──────────────────────────────
    let experienceAreas = Array.isArray(data.experienceAreas)
      ? data.experienceAreas.map((e) => e.toLowerCase())
      : [];
    if (experienceAreas.includes('other') && otherExperienceText.trim()) {
      experienceAreas = experienceAreas.filter((e) => e !== 'other');
      experienceAreas.push(otherExperienceText.trim());
    } else {
      experienceAreas = experienceAreas.filter((e) => e !== 'other');
    }

    // ── Format date of birth ─────────────────────────────────────
    // dayjs object from antd DatePicker → "YYYY-MM-DD"
    let dob = '';
    if (data.dob) {
      if (typeof data.dob === 'object' && data.dob.format) {
        dob = data.dob.format('YYYY-MM-DD');
      } else if (typeof data.dob === 'string') {
        dob = data.dob;
      }
    }

    // ── Build FormData — field names match request.POST.get() ────
    const fd = new FormData();
    fd.append('email', data.email || '');
    fd.append('firstName', data.firstName || '');
    fd.append('lastName', data.lastName || '');
    fd.append('telephone', data.telephone || '');
    fd.append('cellPhone', data.cellPhone || '');
    fd.append('address', data.address || '');
    fd.append('city', data.city || '');
    fd.append('country', data.country || '');
    fd.append('placeOfBirth', data.placeOfBirth || '');
    fd.append('dob', dob);
    fd.append('status', data.status || ''); // marital status: single | married
    fd.append('weight', data.weight || '');
    fd.append('height', data.height || '');
    fd.append('shoeSize', data.shoeSize || '');
    fd.append('blazerSize', data.blazerSize || '');
    fd.append('trouserSize', data.trouserSize || '');
    fd.append('student', data.student === 'yes' ? 'yes' : 'no');
    fd.append('school', data.school || '');
    fd.append('degree', data.degree || '');

    // Languages (up to 4)
    for (let i = 1; i <= 4; i++) {
      if (data[`language${i}`]) {
        fd.append(`language${i}`, data[`language${i}`]);
        fd.append(`rate${i}`, data[`rate${i}`] || '');
      }
    }

    // Experience
    fd.append(
      'hostessExperience',
      data.hostessExperience === 'yes' ? 'yes' : 'no',
    );
    fd.append(
      'groupResponsible',
      data.groupResponsible === 'yes' ? 'yes' : 'no',
    );
    fd.append('agency', data.agency || '');
    fd.append('workType', data.workType || '');
    fd.append('holidayWork', data.holidayWork === 'yes' ? 'yes' : 'no');

    // Experience areas as individual values
    experienceAreas.forEach((area) => fd.append('experienceAreas', area));

    // Images as multipart files (key: "images")
    imagesFileList.forEach((item) => {
      const file = item.originFileObj || item;
      if (file instanceof File) fd.append('images', file);
    });

    // ── POST to backend ──────────────────────────────────────────
    setSubmitting(true);
    try {
      const base = (API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${base}/users/register/staff/`, {
        method: 'POST',
        body: fd,
        // Do NOT set Content-Type — browser sets it with boundary automatically
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        setStageName(json.data?.stage_name || '');
        setSubmitted(true);
        // Reset form
        reset();
        setImagesFileList([]);
        setUploadedCount(0);
        setOtherExperienceText('');
        setOtherExperienceChecked(false);
      } else {
        // Show backend error message
        messageApi.error(
          json.message || 'Submission failed. Please try again.',
        );
      }
    } catch (err) {
      messageApi.error(
        'Network error — please check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────
  if (submitted) {
    return (
      <Result
        status="success"
        title="Application Submitted!"
        subTitle={
          <div style={{ textAlign: 'center' }}>
            <p
              style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}
            >
              Your application is under review. Our team will reach out to you
              soon.
            </p>
            {stageName && (
              <div
                style={{
                  display: 'inline-block',
                  marginTop: 12,
                  padding: '10px 24px',
                  borderRadius: 10,
                  background: 'var(--color-warm-putty)',
                  border: '1.5px solid var(--color-soft-mushroom)',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--color-rich-earth)',
                    fontWeight: 600,
                  }}
                >
                  Your Stage Name
                </span>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: 'var(--color-deep-espresso)',
                    marginTop: 2,
                  }}
                >
                  {stageName}
                </div>
                <span
                  style={{ fontSize: 11, color: 'var(--color-rich-earth)' }}
                >
                  Remember this — the admin will refer to you by this name
                </span>
              </div>
            )}
          </div>
        }
        extra={[
          <Button
            key="another"
            type="default"
            onClick={() => setSubmitted(false)}
            style={{
              borderColor: 'var(--color-rich-earth)',
              color: 'var(--color-rich-earth)',
            }}
          >
            Submit Another Application
          </Button>,
        ]}
      />
    );
  }

  // ── Form ──────────────────────────────────────────────────────
  return (
    <>
      {contextHolder}
      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        style={{ maxWidth: 700, margin: '0 auto' }}
      >
        <UploadSection
          imagesFileList={imagesFileList}
          onImagesChange={handleImagesChange}
          imagesUploading={imagesUploading}
          uploadedCount={uploadedCount}
          required
        />

        <PersonalInfoSection
          control={control}
          errors={errors}
        />
        <DimensionsSection
          control={control}
          errors={errors}
        />
        <EducationSection
          control={control}
          errors={errors}
        />
        <LanguagesSection
          control={control}
          errors={errors}
        />
        <ExperienceSection
          control={control}
          errors={errors}
          otherExperienceChecked={otherExperienceChecked}
          otherExperienceText={otherExperienceText}
          onOtherExperienceTextChange={setOtherExperienceText}
        />

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={submitting}
            style={{
              height: 50,
              fontSize: 16,
              fontWeight: 600,
              background: 'var(--color-deep-espresso)',
              borderColor: 'var(--color-deep-espresso)',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Application'}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default RecruitmentForm;
