import React from "react";
import { Form, Input, Radio, Checkbox, Row, Col, Card } from "antd";
import { Controller } from "react-hook-form";
import SectionDivider from "./SectionDivider";

const { TextArea } = Input;

const EXPERIENCE_AREAS = [
  "Actor/Actress",
  "Barman/barmaid",
  "Group Management",
  "Modeling",
  "Sales/Marketing",
  "Waiter/Waitress",
];

const ExperienceSection = ({
  control,
  errors,
  otherExperienceChecked,
  otherExperienceText,
  onOtherExperienceTextChange,
}) => (
  <Card className="mb-6">
    <SectionDivider orientation="left">Work experience</SectionDivider>
    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
      Tell us about your relevant experience in hosting, events, or similar roles.
    </p>
    <Row gutter={16}>
      <Col span={12}>
        <Controller
          name="hostessExperience"
          control={control}
          rules={{ required: "Please indicate if you have worked as a host or hostess." }}
          render={({ field }) => (
            <Form.Item
              label="Have you worked as a host or hostess?"
              validateStatus={errors.hostessExperience ? "error" : ""}
              help={errors.hostessExperience?.message}
              required
            >
              <Radio.Group {...field}>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>
            </Form.Item>
          )}
        />
      </Col>
      <Col span={12}>
        <Controller
          name="groupResponsible"
          control={control}
          rules={{ required: "Please indicate if you have been responsible for leading a group." }}
          render={({ field }) => (
            <Form.Item
              label="Have you been responsible for leading a group?"
              validateStatus={errors.groupResponsible ? "error" : ""}
              help={errors.groupResponsible?.message}
              required
            >
              <Radio.Group {...field}>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>
            </Form.Item>
          )}
        />
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Controller
          name="agency"
          control={control}
          rules={{ required: "Please enter the name of the agency you have worked with." }}
          render={({ field }) => (
            <Form.Item
              label="Agency you have worked with"
              validateStatus={errors.agency ? "error" : ""}
              help={errors.agency?.message}
              required
            >
              <Input {...field} />
            </Form.Item>
          )}
        />
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Controller
          name="experienceAreas"
          control={control}
          rules={{ required: "Please select at least one area of experience." }}
          render={({ field }) => (
            <Form.Item
              label="Areas of experience"
              validateStatus={errors.experienceAreas ? "error" : ""}
              help={errors.experienceAreas?.message}
              required
            >
              <Checkbox.Group {...field}>
                <Row>
                  {EXPERIENCE_AREAS.map((label, i) => (
                    <Col span={12} key={i}>
                      <Checkbox value={label.toLowerCase()}>{label}</Checkbox>
                    </Col>
                  ))}
                  <Col span={12}>
                    <Checkbox value="other">Other</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          )}
        />
      </Col>
    </Row>

    {otherExperienceChecked && (
      <Row>
        <Col span={24}>
          <Form.Item
            label="Please specify your other experience"
            validateStatus={errors.otherExperienceText ? "error" : ""}
            help={errors.otherExperienceText?.message}
            required
          >
            <TextArea
              rows={3}
              value={otherExperienceText}
              onChange={(e) => onOtherExperienceTextChange(e.target.value)}
              placeholder="Describe your other relevant experience in a few sentences."
              maxLength={500}
            />
            <div style={{ color: "var(--color-rich-earth)", fontSize: 12, marginTop: 4 }}>
              {otherExperienceText.length}/500 characters
            </div>
          </Form.Item>
        </Col>
      </Row>
    )}

    <Row gutter={16}>
      <Col span={12}>
        <Controller
          name="workType"
          control={control}
          rules={{ required: "Please select your preferred work type." }}
          render={({ field }) => (
            <Form.Item
              label="Preferred work type"
              validateStatus={errors.workType ? "error" : ""}
              help={errors.workType?.message}
              required
            >
              <Radio.Group {...field}>
                <Radio value="full-time">Full-time</Radio>
                <Radio value="part-time">Part-time</Radio>
                <Radio value="both">Both</Radio>
              </Radio.Group>
            </Form.Item>
          )}
        />
      </Col>
      <Col span={12}>
        <Controller
          name="holidayWork"
          control={control}
          render={({ field }) => (
            <Form.Item label="Are you available for holiday or seasonal work?">
              <Radio.Group {...field}>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
              </Radio.Group>
            </Form.Item>
          )}
        />
      </Col>
    </Row>
  </Card>
);

export default ExperienceSection;
