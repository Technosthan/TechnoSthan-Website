import React from "react";
import PageContentRenderer from "./PageContentRenderer";

const DynamicPageSections = ({ route, position }) => {
  return <PageContentRenderer route={route} position={position} />;
};

export default DynamicPageSections;
