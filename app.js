// # Admin Testimonial Management Guide

// ## Overview
// This guide explains how to use the admin panel to manage testimonials, including approval, publishing, and moderation features.

// ## Features

// ### 🔐 Authentication
// - Admin login required to access testimonial management
// - Secure token-based authentication
// - Session management with automatic logout

// ### 📊 Dashboard Statistics
// - **Total Testimonials**: All submitted testimonials
// - **Pending Approval**: New testimonials awaiting review
// - **Approved**: Testimonials approved but not yet published
// - **Published**: Testimonials visible on the public website

// ### 🎯 Testimonial Management
// - **Review & Approve**: Review content and approve testimonials
// - **Publish**: Make approved testimonials public
// - **Reject**: Reject inappropriate testimonials
// - **Delete**: Remove testimonials completely
// - **Admin Notes**: Add internal notes for moderation

// ### 🔍 Filtering & Search
// - Filter by status (Pending, Approved, Published)
// - Filter by category (Wedding, Portrait, Landscape, etc.)
// - Pagination for large numbers of testimonials

// ## Workflow

// ### 1. Testimonial Submission
// ```
// User submits testimonial → Status: Pending Approval
// ```

// ### 2. Admin Review
// ```
// Admin reviews testimonial → Can approve, reject, or add notes
// ```

// ### 3. Approval Process
// ```
// Approve → Status: Approved (not yet public)
// Publish → Status: Published (visible on website)
// ```

// ### 4. Public Display
// ```
// Published testimonials appear on public pages
// Filtered by category and pagination
// ```

// ## Admin Panel Access

// ### URL
// ```
// http://localhost:3000/admin/testimonials
// ```

// ### Navigation
// - Main admin dashboard: `/admin`
// - Testimonials management: `/admin/testimonials`
// - Gallery management: `/admin` (main page)

// ## Step-by-Step Management

// ### 1. Login to Admin Panel
// 1. Navigate to `/admin/login`
// 2. Enter admin credentials
// 3. You'll be redirected to the main admin dashboard

// ### 2. Access Testimonials
// 1. Click "Testimonials" button in the header
// 2. Or navigate directly to `/admin/testimonials`

// ### 3. Review Testimonials
// 1. **Pending testimonials** appear at the top
// 2. Click "Review" button on any testimonial
// 3. Read the content and rating
// 4. Add admin notes if needed

// ### 4. Take Action
// - **Approve**: Makes testimonial approved but not public
// - **Publish**: Makes approved testimonial public
// - **Reject**: Rejects the testimonial
// - **Delete**: Removes testimonial completely

// ### 5. Monitor Statistics
// - View real-time statistics on the dashboard
// - Track approval rates and category distribution
// - Monitor monthly trends

// ## Categories

// The system supports these photography categories:
// - **Wedding**: Wedding photography services
// - **Portrait**: Portrait and studio photography
// - **Landscape**: Nature and landscape photography
// - **Food**: Food and culinary photography
// - **Events**: Event and party photography
// - **Commercial**: Business and commercial photography
// - **Other**: Miscellaneous services

// ## Best Practices

// ### Content Moderation
// - Review testimonials for appropriateness
// - Check for spam or fake reviews
// - Ensure content is relevant and helpful
// - Add admin notes for future reference

// ### Approval Strategy
// - **Quick approval**: For clearly genuine, positive testimonials
// - **Review needed**: For testimonials requiring verification
// - **Reject**: For spam, inappropriate content, or fake reviews

// ### Publishing Strategy
// - Publish high-quality testimonials immediately
// - Maintain a good mix of categories
// - Ensure testimonials represent your brand well
// - Don't publish too many at once to maintain freshness

// ## Technical Details

// ### API Endpoints
// - `GET /api/testimonials/admin/all` - Get all testimonials
// - `PUT /api/testimonials/admin/approve/:id` - Approve/publish testimonial
// - `DELETE /api/testimonials/admin/:id` - Delete testimonial
// - `GET /api/testimonials/admin/stats` - Get statistics

// ### Data Flow
// ```
// Frontend (React) → Next.js API Routes → Backend (Express) → MongoDB
// ```

// ### Authentication
// - JWT tokens stored in localStorage
// - Automatic token validation
// - Secure admin-only routes

// ## Troubleshooting

// ### Common Issues

// #### Can't Access Admin Panel
// - Check if backend server is running
// - Verify admin credentials
// - Check browser console for errors

// #### Testimonials Not Loading
// - Verify backend API is accessible
// - Check network requests in browser dev tools
// - Ensure database connection is working

// #### Actions Not Working
// - Check authentication status
// - Verify API endpoint responses
// - Check browser console for errors

// ### Error Messages

// #### "Unauthorized"
// - Login again with admin credentials
// - Check if token is expired

// #### "Failed to load testimonials"
// - Check backend server status
// - Verify API endpoints are working

// #### "Action failed"
// - Check network connectivity
// - Verify testimonial ID exists
// - Check backend logs for errors

// ## Testing

// ### Run Admin Tests
// ```bash
// cd photo-teoflys
// node test-admin-testimonials.js
// ```

// ### Manual Testing
// 1. Submit a testimonial from the public form
// 2. Login to admin panel
// 3. Review and approve the testimonial
// 4. Publish it to make it public
// 5. Verify it appears on the public page

// ## Security Considerations

// - Admin credentials should be strong and unique
// - Regular password updates recommended
// - Monitor admin access logs
// - Use HTTPS in production
// - Implement rate limiting for admin actions

// ## Support

// If you encounter issues:
// 1. Check the troubleshooting section above
// 2. Review browser console for errors
// 3. Check backend server logs
// 4. Verify database connectivity
// 5. Test API endpoints directly

// ## Next Steps

// After setting up testimonial management:
// 1. **Customize categories** if needed
// 2. **Set up email notifications** for new testimonials
// 3. **Implement auto-approval** for trusted users
// 4. **Add moderation workflows** for team collaboration
// 5. **Set up analytics tracking** for testimonial performance

// ## Changes Made
// - Added CORS configuration to the backend to allow requests from frontend
// - Updated login page error handling and API call
// - Ensured backend server is running on correct port
// - Updated Express configuration and added health check endpoint
