import React from "react";
import { Helmet } from "react-helmet-async";
import PageContentRenderer from "../component/PageContentRenderer";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About TechnoSthan</title>
        <meta
          name="description"
          content="Learn more about TechnoSthan and our mission."
        />
      </Helmet>
      <section className="container" style={{ padding: "4rem 0" }}>
        <h1
          style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}
        >
          About TechnoSthan
        </h1>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#475569" }}>
          TechnoSthan creates premium digital products and services for
          ambitious businesses.
        </p>
      </section>
      <PageContentRenderer route="/about" />
    </>
  );
};

export default AboutPage;
