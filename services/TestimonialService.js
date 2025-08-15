const Testimonial = require("../models/Testimonial");

class TestimonialService {
  async getApprovedTestimonials() {
    return await Testimonial.find({
      isApproved: true,
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .select("name message rating category createdAt");
  }
}

module.exports = new TestimonialService();
