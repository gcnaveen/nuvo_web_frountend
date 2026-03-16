import React from "react";
import { Form, Input, Select, Row, Col, Card } from "antd";
import { Controller } from "react-hook-form";
import SectionDivider from "./SectionDivider";

const { Option } = Select;

const DimensionsSection = ({ control, errors }) => (
  <Card className="mb-6">
    <SectionDivider orientation="left">Physical dimensions</SectionDivider>
    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
      Please provide your measurements so we can match you with the right attire and roles.
    </p>
    <Row gutter={16}>
      <Col span={12}>
        <Controller
          name="weight"
          control={control}
          rules={{ required: "Please enter your weight in kg." }}
          render={({ field }) => (
            <Form.Item
              label="Weight (kg)"
              validateStatus={errors.weight ? "error" : ""}
              help={errors.weight?.message}
              required
            >
              <Input type="number" {...field} />
            </Form.Item>
          )}
        />
      </Col>
      <Col span={12}>
        <Controller
          name="height"
          control={control}
          rules={{ required: "Please enter your height in cm." }}
          render={({ field }) => (
            <Form.Item
              label="Height (cm)"
              validateStatus={errors.height ? "error" : ""}
              help={errors.height?.message}
              required
            >
              <Input type="number" {...field} />
            </Form.Item>
          )}
        />
      </Col>
    </Row>
    <Row gutter={16}>
      <Col span={8}>
        <Controller
          name="shoeSize"
          control={control}
          rules={{ required: "Please select your shoe size." }}
          render={({ field }) => (
            <Form.Item
              label="Shoe size (UK)"
              validateStatus={errors.shoeSize ? "error" : ""}
              help={errors.shoeSize?.message}
              required
            >
              <Select {...field} placeholder="Select shoe size">
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                  <Option key={s} value={s}>{`UK ${s}`}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
        />
      </Col>
      <Col span={8}>
        <Controller
          name="blazerSize"
          control={control}
          rules={{ required: "Please select your blazer size." }}
          render={({ field }) => (
            <Form.Item
              label="Blazer size"
              validateStatus={errors.blazerSize ? "error" : ""}
              help={errors.blazerSize?.message}
              required
            >
              <Select {...field} placeholder="Select blazer size">
                {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
        />
      </Col>
      <Col span={8}>
        <Controller
          name="trouserSize"
          control={control}
          rules={{ required: "Please select your trouser or skirt size." }}
          render={({ field }) => (
            <Form.Item
              label="Trouser or skirt size"
              validateStatus={errors.trouserSize ? "error" : ""}
              help={errors.trouserSize?.message}
              required
            >
              <Select {...field} placeholder="Select size">
                {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
        />
      </Col>
    </Row>
  </Card>
);

export default DimensionsSection;
