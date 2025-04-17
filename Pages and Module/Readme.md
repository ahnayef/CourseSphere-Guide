# CourseSphere: Pages and Modules Documentation

This document outlines the core pages and functional modules of the CourseSphere Online Course Registration System with a focus on simplicity for beginner developers.

## Table of Contents

1. [User Interfaces](#user-interfaces)
   - [Student Portal](#student-portal)
   - [Advisor Portal](#advisor-portal)
   - [HOD Portal](#hod-portal)
   - [Admin Portal](#admin-portal)
2. [Core Modules](#core-modules)
   - [Authentication Module](#authentication-module)
   - [Course Management Module](#course-management-module)
   - [Registration Module](#registration-module)
   - [Approval Module](#approval-module)
   - [Payment Module](#payment-module)
   - [Notification Module](#notification-module)
   - [Reporting Module](#reporting-module)

## User Interfaces

### Student Portal

#### Dashboard
- Welcome screen showing registration status and notifications
- Simple cards for key information and action buttons

#### Course Catalog
- List of available courses with basic search and filtering
- Simple "Add to Cart" functionality for course selection

#### Course Cart
- List of selected courses with remove option
- Credit hour calculation and estimated fees
- Submit button to proceed to registration

#### Registration Status
- View status of submitted registration requests
- See approvals, rejections, and reasons
- Proceed to payment when approved

#### Payment Portal
- View fees with any applicable waivers
- Simple payment form
- Confirmation screen after payment

### Advisor Portal

#### Dashboard
- Overview of pending approvals and assigned students
- Basic count metrics and action buttons

#### Student Management
- Simple list of assigned students
- Basic student details and course registrations

#### Registration Approval
- List of pending student registrations
- Simple approve/reject functionality with comments

### HOD Portal

#### Department Dashboard
- Basic department statistics
- Approval queue status

#### Course Management
- List of department courses
- Simple add/edit course forms

#### Registration Approval
- Review and approve registrations pre-approved by advisors
- Department-level approval process

### Admin Portal

#### System Dashboard
- Basic system metrics and activity logs
- Simple status indicators

#### User Management
- List of system users
- Basic add/edit/deactivate functionality

#### System Configuration
- Simple settings for deadlines and fees
- Basic form controls for configuration

#### Reporting
- Simple pre-defined reports
- Basic filtering and CSV export

## Core Modules

### Authentication Module
- Simple login/logout functionality
- Password reset process
- Basic role-based permissions

### Course Management Module
- Course creation and editing
- Basic prerequisite management
- Department assignment

### Registration Module
- Shopping cart functionality
- Registration submission and tracking
- Simple validation rules

### Approval Module
- Two-step approval workflow (Advisor → HOD)
- Rejection handling with comments
- Approval status tracking

### Payment Module
- Basic fee calculation
- Waiver application
- Simple payment processing

### Notification Module
- Basic notification display on dashboards
- Simple email notifications for status changes

### Reporting Module
- Pre-defined report templates
- CSV export functionality

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript with Bootstrap 5
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Authentication**: Basic session-based authentication
- **API**: Simple RESTful endpoints

## Development Approach for Beginners

### Phase 1: Static Pages
1. Create HTML templates for all pages using Bootstrap
2. Implement responsive layouts with minimal custom CSS
3. Add navigation between pages

### Phase 2: Basic Functionality
1. Implement login and session management
2. Create course catalog and cart functionality
3. Build registration submission process

### Phase 3: Approval Workflows
1. Add advisor approval screens
2. Implement HOD approval process
3. Add status tracking

### Phase 4: Payment and Completion
1. Add simple payment form
2. Implement basic reporting
3. Complete administrative functions

## Simplified Database Tables

The system will use a simplified version of the database schema with these core tables:

1. users (all user types with role field)
2. departments
3. courses
4. prerequisites
5. registration_bundles
6. course_registrations
7. payments
8. notifications