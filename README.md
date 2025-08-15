# Teofly Photography Gallery Backend

A Node.js/Express backend API for the Teofly Photography Gallery application.

## Features

- **User Authentication**: JWT-based authentication with admin roles
- **Gallery Management**: Upload, manage, and categorize photography work
- **Testimonials System**: Client feedback management with approval workflow
- **Admin Dashboard**: Comprehensive admin interface for content management
- **Cloudinary Integration**: Image upload and management
- **MongoDB Database**: Flexible document storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or Atlas)
- Cloudinary account for image storage

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd photo-teoflys/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ADMIN_DASHBOARD_URL=http://localhost:3001
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run init-admin` - Initialize the admin user
- `npm run seed` - Seed the database with sample data

## Database Setup

### Initialize Admin User
```bash
npm run init-admin
```

This will create the first admin user using the credentials from your `.env` file.

### Seed Sample Data
```bash
npm run seed
```

This will populate the database with sample gallery items and testimonials.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Gallery
- `GET /api/gallery` - Get all gallery items
- `POST /api/gallery` - Upload new gallery item (admin only)
- `PUT /api/gallery/:id` - Update gallery item (admin only)
- `DELETE /api/gallery/:id` - Delete gallery item (admin only)

### Testimonials
- `GET /api/testimonials/published` - Get published testimonials
- `POST /api/testimonials/submit` - Submit new testimonial
- `GET /api/testimonials/admin/all` - Get all testimonials (admin only)
- `PUT /api/testimonials/admin/approve/:id` - Approve testimonial (admin only)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (admin only)
- `GET /api/admin/users` - Get all users (admin only)

### Health & Status
- `GET /api/health` - Basic health check
- `GET /api/status` - Detailed system status

## Models

### User
- `email`: User's email address
- `password`: Hashed password
- `name`: User's full name
- `role`: User role (user/admin)
- `isActive`: Account status

### Gallery
- `title`: Image title
- `description`: Image description
- `category`: Photography category
- `imageUrl`: Cloudinary image URL
- `tags`: Array of tags
- `isPublished`: Publication status

### Testimonial
- `name`: Client name
- `email`: Client email
- `message`: Testimonial content
- `rating`: 1-5 star rating
- `category`: Service category
- `isApproved`: Admin approval status
- `isPublished`: Publication status

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- CORS configuration
- Input validation and sanitization

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and meaningful error messages.

## Development

### Running in Development Mode
```bash
npm run dev
```

The server will start on port 5000 (or the port specified in your `.env` file).

### Environment Variables
Make sure all required environment variables are set in your `.env` file before starting the server.

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure all environment variables are properly configured
3. Use a process manager like PM2 for production deployments
4. Set up proper logging and monitoring

## Support

For issues and questions, please refer to the project documentation or contact the development team.
