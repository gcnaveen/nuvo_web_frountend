import React from "react";

const Footer = () => {
  return (
    <footer>
      <div className="footer clearfix mb-0 text-muted">
        <div className="float-start">
          <p>2025 &copy; Navi infotech</p>
        </div>
        <div className="float-end">
          <p>
            Crafted for
            <span className="text-danger">
              {/* <i className="bi bi-heart"></i> */}
            </span>{" "}
            <a href="http://ahmadsaugi.com">Nuvo</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
