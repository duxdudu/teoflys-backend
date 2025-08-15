const mongoose = require("mongoose");
const Gallery = require("../models/Gallery");
const Testimonial = require("../models/Testimonial");
require("dotenv").config();

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/teofly-gallery",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    // Seed Gallery Items
    const galleryItems = [
      {
        title: "Wedding Photography",
        description: "Beautiful wedding moments captured with artistic vision",
        category: "wedding",
        imageUrl:
          "https://res.cloudinary.com/dbeyo8yzw/image/upload/v1/teofly-gallery/wedding-1",
        tags: ["wedding", "romance", "celebration"],
        isPublished: true,
      },
      {
        title: "Portrait Session",
        description: "Professional portrait photography showcasing personality",
        category: "portrait",
        imageUrl:
          "https://res.cloudinary.com/dbeyo8yzw/image/upload/v1/teofly-gallery/portrait-1",
        tags: ["portrait", "professional", "personality"],
        isPublished: true,
      },
      {
        title: "Landscape Beauty",
        description:
          "Stunning landscape photography capturing nature's majesty",
        category: "landscape",
        imageUrl:
          "https://res.cloudinary.com/dbeyo8yzw/image/upload/v1/teofly-gallery/landscape-1",
        tags: ["landscape", "nature", "beauty"],
        isPublished: true,
      },
      {
        title: "Food Photography",
        description: "Delicious food captured in its most appetizing form",
        category: "food",
        imageUrl:
          "https://res.cloudinary.com/dbeyo8yzw/image/upload/v1/teofly-gallery/food-1",
        tags: ["food", "culinary", "appetizing"],
        isPublished: true,
      },
      {
        title: "Event Coverage",
        description: "Comprehensive event photography for special occasions",
        category: "events",
        imageUrl:
          "https://res.cloudinary.com/dbeyo8yzw/image/upload/v1/teofly-gallery/event-1",
        tags: ["events", "celebration", "special"],
        isPublished: true,
      },
    ];

    // Clear existing gallery items
    await Gallery.deleteMany({});
    console.log("Cleared existing gallery items");

    // Insert new gallery items
    const insertedGallery = await Gallery.insertMany(galleryItems);
    console.log(`Inserted ${insertedGallery.length} gallery items`);

    // Seed Testimonials
    const testimonials = [
      {
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        message:
          "Teofly captured our wedding day perfectly! The photos are absolutely stunning and we couldn't be happier.",
        rating: 5,
        category: "wedding",
        isApproved: true,
        isPublished: true,
      },
      {
        name: "Michael Chen",
        email: "m.chen@email.com",
        message:
          "Professional, creative, and amazing results. Our family portraits turned out better than we could have imagined.",
        rating: 5,
        category: "portrait",
        isApproved: true,
        isPublished: true,
      },
      {
        name: "Emily Rodriguez",
        email: "emily.r@email.com",
        message:
          "The landscape photography workshop was incredible. I learned so much and the locations were breathtaking.",
        rating: 5,
        category: "landscape",
        isApproved: true,
        isPublished: true,
      },
      {
        name: "David Thompson",
        email: "d.thompson@email.com",
        message:
          "Outstanding food photography for our restaurant. The images really showcase our dishes beautifully.",
        rating: 5,
        category: "food",
        isApproved: true,
        isPublished: true,
      },
    ];

    // Clear existing testimonials
    await Testimonial.deleteMany({});
    console.log("Cleared existing testimonials");

    // Insert new testimonials
    const insertedTestimonials = await Testimonial.insertMany(testimonials);
    console.log(`Inserted ${insertedTestimonials.length} testimonials`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the seeding
if (require.main === module) {
  seedData();
}

module.exports = seedData;
