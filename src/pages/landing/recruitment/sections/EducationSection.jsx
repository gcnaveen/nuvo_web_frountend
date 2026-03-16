import React from "react";
import { Form, Input, Radio, Row, Col, Card } from "antd";
import { Controller } from "react-hook-form";
import SectionDivider from "./SectionDivider";

const EducationSection = ({ control, errors }) => (
  <Card className="mb-6">
    <SectionDivider orientation="left">Education</SectionDivider>
    <Row gutter={16}>
      <Col span={12}>
        <Controller
          name="student"
          control={control}
          rules={{ required: "Please indicate whether you are currently a student." }}
          render={({ field }) => (
            <Form.Item
              label="Are you currently a student?"
              validateStatus={errors.student ? "error" : ""}
              help={errors.student?.message}
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
          name="school"
          control={control}
          rules={{ required: "Please enter your school or university name." }}
          render={({ field }) => (
            <Form.Item
              label="School or university"
              validateStatus={errors.school ? "error" : ""}
              help={errors.school?.message}
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
          name="degree"
          control={control}
          rules={{ required: "Please enter your highest education degree or qualification." }}
          render={({ field }) => (
            <Form.Item
              label="Highest education degree or qualification"
              validateStatus={errors.degree ? "error" : ""}
              help={errors.degree?.message}
              required
            >
              <Input {...field} />
            </Form.Item>
          )}
        />
      </Col>
    </Row>
  </Card>
);

export default EducationSection;
