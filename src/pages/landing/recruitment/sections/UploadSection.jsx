import React from "react";
import { Form, Upload, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import SectionDivider from "./SectionDivider";

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGES = 4;

/**
 * Single upload section: "Upload your images" for all profiles (full-length, headshot, etc.).
 * Includes a short note about uploading complete images for all profiles.
 */
const UploadSection = ({
  imagesFileList,
  onImagesChange,
  imagesUploading,
  uploadedCount,
  required,
}) => {
  return (
    <Card className="mb-6">
      <SectionDivider orientation="left">Upload</SectionDivider>

      <p
        className="upload-heading"
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          color: "var(--color-deep-espresso)",
          marginBottom: 4,
        }}
      >
        Upload your images
      </p>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        Upload your images for all profiles (e.g. full-length, headshot) and ensure each image is
        complete and clear before submitting the form.
      </p>

      <Form.Item
        label=""
        validateStatus={required && uploadedCount === 0 ? "error" : ""}
        help={
          required && uploadedCount === 0
            ? "Please upload at least one image."
            : ""
        }
        required={required}
      >
        <Upload
          listType="picture-card"
          maxCount={MAX_IMAGES}
          fileList={imagesFileList}
          beforeUpload={() => false}
          onChange={({ fileList: newFileList }) =>
            onImagesChange(newFileList.slice(0, MAX_IMAGES))
          }
          showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
        >
          {imagesFileList.length >= MAX_IMAGES ? null : (
            <div style={{ textAlign: "center", color: "var(--color-rich-earth)" }}>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Add image</div>
            </div>
          )}
        </Upload>
        <small style={{ color: "var(--color-rich-earth)" }}>
          Up to {MAX_IMAGES} images, max {MAX_IMAGE_SIZE_MB}MB each. Upload complete images for all
          required profiles.
        </small>
      </Form.Item>
    </Card>
  );
};

export default UploadSection;
