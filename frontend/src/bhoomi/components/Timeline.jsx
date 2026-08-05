import React from "react";
import { ProcessStep } from "./Cards";

const Timeline = ({ items = [] }) => {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <ProcessStep key={item} step={item} index={index} />
      ))}
    </div>
  );
};

export default Timeline;

