import { useEffect, useState } from "react";
import "./testimonials.css";

import { getTestimonials } from "../../../api/testimonials.api";

const Testimonials = () => {
const [testimonials, setTestimonials] = useState([]);



useEffect(() => {
const fetchTestimonials = async () => {
try {
const response = await getTestimonials();

console.log("FULL RESPONSE:", response);
console.log("DATA:", response.data);
    

    setTestimonials(response.data?.data || []);
  } catch (error) {
    console.error(error);
    setTestimonials([]);
  }
};

fetchTestimonials();


}, []);

return ( <section className="testimonials-section"> <div className="about-container">


    <h2>What Our Clients Say</h2>

    <div className="testimonials-grid">

      {testimonials.length > 0 ? (
        testimonials.map((item) => (
          <div
            key={item.id}
            className="glass-card testimonial-card"
          >
            <p>"{item.feedback}"</p>

            <h3>{item.clientName}</h3>

            <span>{item.company}</span>
          </div>
        ))
      ) : (
        <p>No Testimonials Found</p>
      )}

    </div>

  </div>
</section>


);
};

export default Testimonials;
