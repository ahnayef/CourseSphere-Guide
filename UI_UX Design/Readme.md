# CourseSphere: UI/UX and Database Implementation Guide

This document provides a detailed guide for both UI/UX design and database implementation processes for the CourseSphere Online Course Registration System.

## Table of Contents

1. [Design System](#design-system)
2. [Page Implementation Guide](#page-implementation-guide)
   - [Login Page](#login-page)
   - [Student Dashboard](#student-dashboard)
   - [Course Catalog](#course-catalog)
   - [Course Cart](#course-cart)
   - [Registration Submission](#registration-submission)
   - [Registration Status](#registration-status)
   - [Payment Portal](#payment-portal)
   - [Advisor Dashboard](#advisor-dashboard)
   - [Student Management](#student-management)
   - [Registration Approval](#registration-approval)
   - [HOD Dashboard](#hod-dashboard)
   - [Course Management](#course-management)
   - [Admin Dashboard](#admin-dashboard)
   - [User Management](#user-management)
   - [System Configuration](#system-configuration)
   - [Reporting](#reporting)

## Design System

### Colors

- **Primary**: #3498db (Blue) - Main brand color, used for navigation, primary buttons
- **Secondary**: #2ecc71 (Green) - Success states, approval indicators, positive actions
- **Accent**: #e74c3c (Red) - Error states, destructive actions, alerts
- **Background**: #f8f9fa (Light Gray) - Page backgrounds
- **Card**: #ffffff (White) - Content containers, cards, forms
- **Text**: #333333 (Dark Gray) - Primary text color

### Typography

- **Headings**: Roboto, Arial, sans-serif
- **Body Text**: Open Sans, Helvetica, sans-serif
- **Base Size**: 16px
- **Line Height**: 1.5

### Components

#### Buttons

- **Primary Button**: Blue background (#3498db), white text, 8px border-radius
- **Secondary Button**: Green background (#2ecc71), white text, 8px border-radius
- **Danger Button**: Red background (#e74c3c), white text, 8px border-radius
- **Outline Button**: Transparent background, colored border, colored text

#### Cards

- White background (#ffffff)
- Box shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
- Border radius: 8px
- Margin bottom: 20px

#### Form Elements

- Input height: 40px
- Border radius: 4px
- Border color: #ced4da
- Focus state: Blue outline (#3498db)

#### Status Badges

- **Pending**: Yellow (#f39c12), rounded pill
- **Approved**: Green (#2ecc71), rounded pill
- **Rejected**: Red (#e74c3c), rounded pill

## Page Implementation Guide

### Login Page

#### UI/UX Elements
- Clean, split-panel design with brand visuals on the left
- Form on the right with email/password fields
- Remember me checkbox
- Forgot password link
- Error message display for invalid credentials

#### Database Implementation
- **Process**: When a user submits login credentials, the system:
  1. Queries the appropriate user table (student, advisor, hod, or admin) based on the email domain or login selection
  2. Verifies the hashed password
  3. Creates a session with user data and role
  4. Redirects to the appropriate dashboard

### Student Dashboard

#### UI/UX Elements
- Navigation bar with key sections
- Status cards showing registration status, pending approvals, etc.
- Recent registrations summary table
- Important deadlines section
- Notifications area

#### Database Implementation
- **Process**: When loading the dashboard, the system:
  1. Queries registration_bundle for the current student to get overall status
  2. Fetches course_registration records to show recent registrations
  3. Retrieves registration_deadline for upcoming deadlines
  4. Calculates total fees from course credits and department rates
  5. Fetches recent notifications

### Course Catalog

#### UI/UX Elements
- Search and filter functionality
- Sortable course table with key information
- "Add to Cart" buttons
- Status indicators (Available, Full, Prerequisites Required)
- Pagination for large course lists

#### Database Implementation
- **Process**: When loading and interacting with the catalog:
  1. Queries the course table with filters from the department table
  2. Checks prerequisite table for each course to determine eligibility
  3. Tracks courses already in the student's cart from course_cart table
  4. When "Add to Cart" is clicked, inserts a record into course_cart

### Course Cart

#### UI/UX Elements
- List of selected courses with details (code, title, credits, department)
- Total credit hours calculation
- Total cost calculation showing any applicable waivers
- "Remove" buttons for individual courses
- "Clear Cart" functionality
- "Proceed to Registration" button
- Empty state messaging when cart is empty

#### Database Implementation
- **Process**: When viewing and managing the cart:
  1. Retrieves all course_cart records for the current student
  2. Joins with course and department tables to show complete information
  3. Calculates total cost based on credit_hours, credit_hour_cost, and student waiver_percentage
  4. When removing courses, deletes specific course_cart records
  5. When clearing cart, performs a bulk delete on all student's cart records

### Registration Submission

#### UI/UX Elements
- Review panel showing all courses selected
- Final fee calculation with breakdown
- Terms and conditions checkbox
- Confirmation modal before submission
- Success/failure messaging post-submission
- Option to download registration receipt

#### Database Implementation
- **Process**: During submission:
  1. Creates a new registration_bundle record with student data, semester, and status
  2. Transfers courses from course_cart to course_registration with the new bundle ID
  3. Updates total_fees in the registration_bundle based on final calculation
  4. Clears the student's course_cart after successful submission
  5. Creates notification records for the student and advisor

### Registration Status

#### UI/UX Elements
- Status timeline showing registration progress
- Color-coded indicators for different statuses
- Details panel showing bundle information
- Course list with individual approval statuses
- Rejection reasons displayed when applicable
- Action buttons based on current status (Cancel, Pay, etc.)

#### Database Implementation
- **Process**: When viewing status:
  1. Retrieves registration_bundle record with all relevant status flags
  2. Fetches all course_registration records connected to the bundle
  3. Joins advisor and hod data to show approval information
  4. For rejected courses, displays the rejection_reason field
  5. When cancellation is requested, updates registration_bundle.status to 'cancelled'

### Payment Portal

#### UI/UX Elements
- Fee summary with breakdown
- Multiple payment method options
- Secure form fields for payment information
- Order summary sidebar
- Processing indicator during payment submission
- Success/failure confirmation screen
- Receipt generation option

#### Database Implementation
- **Process**: During payment:
  1. Retrieves registration_bundle record to confirm payment amount
  2. Creates a new payment record with bundle ID, amount, and payment method
  3. On successful payment, updates registration_bundle.payment_status to 'paid'
  4. Updates registration_bundle.status to 'completed'
  5. Updates available_seats in each approved course
  6. Creates payment confirmation notification for the student

### Advisor Dashboard

#### UI/UX Elements
- Overview statistics (pending approvals, completed registrations)
- Alerts for urgent approvals (near deadline)
- Action items section highlighting required tasks
- Recent activity feed
- Quick links to common advisor functions

#### Database Implementation
- **Process**: When loading the dashboard:
  1. Counts registration_bundle records where advisor_id matches and advisor_approval is false
  2. Fetches registration_deadline to identify urgent approvals
  3. Retrieves recent registration_bundle records where the advisor has taken action
  4. Counts total students assigned to the advisor from student table
  5. Retrieves unread notifications for the advisor

### Student Management

#### UI/UX Elements
- Searchable list of assigned students
- Student profile cards with key information
- Filtering options (department, year, status)
- Quick view of each student's registration status
- Action buttons for common tasks

#### Database Implementation
- **Process**: When managing students:
  1. Queries student table where advisor_id matches the current advisor
  2. Joins with department to show department_name for each student
  3. Retrieves latest registration_bundle for each student to show status
  4. When updating student information, updates specific fields in student table
  5. For waiver adjustments, updates student.waiver_percentage

### Registration Approval

#### UI/UX Elements
- List of pending registrations with submission dates
- Student information panel for context
- Detailed view of selected registration showing all courses
- Course-by-course approval controls with notes field
- Bulk approval/rejection options
- Confirmation dialogs for rejections

#### Database Implementation
- **Process**: During the approval process:
  1. Retrieves registration_bundle records where advisor_id matches and status is 'pending'
  2. Fetches all course_registration records for a selected bundle
  3. For each course, checks prerequisite satisfaction from prerequisite table
  4. When approving/rejecting individual courses, updates course_registration.status
  5. When completing the review, updates registration_bundle.advisor_approval and status
  6. Creates notification for student about approval result

### HOD Dashboard

#### UI/UX Elements
- Department-wide statistics and metrics
- Course enrollment visualization
- Pending approvals requiring HOD action
- Department faculty listing with status
- System alerts and announcements

#### Database Implementation
- **Process**: When loading the dashboard:
  1. Counts registration_bundle records needing HOD approval in the department
  2. Aggregates course enrollment data from course_registration for department courses
  3. Joins with advisor table to list all department advisors
  4. Retrieves department-specific system configuration
  5. Fetches unread notifications for the HOD

### Course Management

#### UI/UX Elements
- Course listing with search and filter functionality
- Course creation/editing forms
- Enrollment statistics for each course
- Prerequisite management interface
- Batch operations for multiple courses
- Archive/restore functionality

#### Database Implementation
- **Process**: When managing courses:
  1. Queries course table with department_id matching the HOD's department
  2. For each course, counts current enrollments from course_registration
  3. When creating a course, inserts new record into course table
  4. For prerequisite management, manages relations in prerequisite table
  5. When updating a course, modifies the specific course record
  6. For seat adjustments, updates available_seats and max_seats fields

### Admin Dashboard

#### UI/UX Elements
- System-wide metrics and statistics
- Critical alerts panel
- Active user sessions visualization
- System health indicators
- Quick access to all administrative functions

#### Database Implementation
- **Process**: When loading the dashboard:
  1. Aggregates metrics across all database tables (counts, totals)
  2. Checks registration_deadline to highlight active/upcoming registration periods
  3. Counts active user sessions from session tracking table
  4. Monitors database performance metrics
  5. Retrieves admin-level notifications

### User Management

#### UI/UX Elements
- User directory with role-based filtering
- User creation and editing forms
- Role assignment interface
- Batch user import functionality
- Password reset and account recovery controls
- Activity log for audit purposes

#### Database Implementation
- **Process**: When managing users:
  1. Queries across all user tables (student, advisor, hod, admin)
  2. When creating users, inserts into appropriate role-specific table
  3. For department assignments, updates department_id fields
  4. For advisor assignments, updates student.advisor_id
  5. When resetting passwords, updates password_hash fields
  6. Logs all administrative actions in audit_log table

### System Configuration

#### UI/UX Elements
- Settings panels grouped by category
- Registration period configuration
- Department and fee structure management
- System-wide announcement creation
- Email template configuration
- Backup and maintenance controls

#### Database Implementation
- **Process**: When configuring the system:
  1. Manages registration_deadline records for all semesters
  2. Updates department records for fee structure changes
  3. Creates system-wide notification records
  4. Configures email_template records for automated communications
  5. Performs database maintenance and backup operations

### Reporting

#### UI/UX Elements
- Report selection interface
- Parameter input forms
- Interactive data visualizations
- Tabular data display with sorting and filtering
- Export options (PDF, Excel, CSV)
- Report scheduling functionality

#### Database Implementation
- **Process**: When generating reports:
  1. Executes complex queries joining multiple tables based on report type
  2. For registration reports, aggregates data from registration_bundle and course_registration
  3. For financial reports, joins payment with registration_bundle
  4. For enrollment statistics, aggregates data from course and course_registration
  5. Stores report configurations in report_template table
  6. Saves scheduled reports in report_schedule table