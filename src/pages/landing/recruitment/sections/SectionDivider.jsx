import React from "react";
import { Divider } from "antd";

/**
 * Consistent section heading for form blocks (left/right friendly).
 */
const SectionDivider = ({ children, orientation = "left" }) => (
  <Divider
    className="section-divider"
    orientation={orientation}
    style={{
      color: "var(--color-deep-espresso)",
      borderColor: "var(--color-rich-earth)",
      fontWeight: 600,
    }}
  >
    {children}
  </Divider>
);

export default SectionDivider;
