import React from 'react';
import { Form, Select, Row, Col, Card } from 'antd';
import { Controller, useWatch } from 'react-hook-form';
import SectionDivider from './SectionDivider';

const { Option } = Select;

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Kannada',
  'Telugu',
  'Tamil',
  'Malayalam',
];
const RATE_OPTIONS = ['Basic', 'Conversational', 'Fluent', 'Native'];

// Single language row — proficiency required only when a language is selected
const LangRow = ({ index, control, errors }) => {
  // Watch the language field for THIS row to conditionally require proficiency
  const langValue = useWatch({ control, name: `language${index}` });
  const isRequired = index === 1; // only first row is always required
  const label = index === 1 ? 'Language 1 *' : `Language ${index} (optional)`;

  return (
    <Row
      gutter={8}
      align="middle"
    >
      <Col span={16}>
        <Controller
          name={`language${index}`}
          control={control}
          rules={
            isRequired
              ? { required: 'Please select at least one language.' }
              : {}
          }
          render={({ field }) => (
            <Form.Item
              label={label}
              validateStatus={errors[`language${index}`] ? 'error' : ''}
              help={errors[`language${index}`]?.message}
            >
              <Select
                {...field}
                allowClear
                showSearch
                placeholder="Select language"
                onChange={(val) => field.onChange(val)}
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <Option
                    key={lang}
                    value={lang}
                  >
                    {lang}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        />
      </Col>
      <Col span={8}>
        <Controller
          name={`rate${index}`}
          control={control}
          // Proficiency is required only when a language has been selected for this row
          rules={
            langValue
              ? { required: `Please select proficiency for language ${index}.` }
              : {}
          }
          render={({ field }) => (
            <Form.Item
              label={index === 1 ? 'Proficiency *' : 'Proficiency'}
              validateStatus={errors[`rate${index}`] ? 'error' : ''}
              help={errors[`rate${index}`]?.message}
            >
              <Select
                {...field}
                allowClear
                placeholder="Select level"
                disabled={!langValue} // greyed out until a language is picked
              >
                {RATE_OPTIONS.map((rate) => (
                  <Option
                    key={rate}
                    value={rate}
                  >
                    {rate}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        />
      </Col>
    </Row>
  );
};

const LanguagesSection = ({ control, errors }) => (
  <Card className="mb-6">
    <SectionDivider orientation="left">Languages</SectionDivider>
    <p
      style={{
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        marginBottom: 16,
        lineHeight: 1.5,
      }}
    >
      Select at least one language you speak. Add up to three more if applicable
      — proficiency is required for each selected language.
    </p>
    {[1, 2, 3, 4].map((i) => (
      <LangRow
        key={i}
        index={i}
        control={control}
        errors={errors}
      />
    ))}
  </Card>
);

export default LanguagesSection;

