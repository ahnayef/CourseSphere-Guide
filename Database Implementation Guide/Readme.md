# Database Implementation Guide

This guide provides step-by-step database implementation instructions for each page in the CourseSphere system. It's designed for beginner developers to connect the UI with the database.

## Student Portal Pages

### Dashboard Implementation

1. **Database Queries**:
   ```sql
   -- Get student information
   SELECT name, registration_number, department_id, waiver_percentage 
   FROM student WHERE id = ?;
   
   -- Get registration bundles count by status
   SELECT status, COUNT(*) as count FROM registration_bundles 
   WHERE student_id = ? GROUP BY status;
   
   -- Get recent notifications
   SELECT title, description, created_at FROM notifications 
   WHERE student_id = ? ORDER BY created_at DESC LIMIT 5;
   
   -- Get upcoming deadline
   SELECT deadline_date FROM registration_deadline 
   WHERE deadline_date > CURRENT_DATE() ORDER BY deadline_date ASC LIMIT 1;
   ```

2. **Implementation Steps**:
   - Create database connection utility
   - Implement student authentication
   - Create dashboard controller with student info query
   - Add dashboard summary statistics queries
   - Display results in UI cards

### Course Catalog Implementation

1. **Database Queries**:
   ```sql
   -- Get all courses with department info
   SELECT c.id, c.name, c.code, c.credit, d.name as department_name 
   FROM courses c JOIN departments d ON c.department_id = d.id;
   
   -- Filter courses by department
   SELECT c.id, c.name, c.code, c.credit 
   FROM courses c WHERE c.department_id = ?;
   
   -- Check prerequisites for a course
   SELECT p.prereq_course_id FROM prerequisites p WHERE p.course_id = ?;
   ```

2. **Implementation Steps**:
   - Create courses controller with listing query
   - Implement department filter dropdown
   - Add search functionality with LIKE query
   - Connect "Add to Cart" button to cart table
   - Validate prerequisites before adding to cart

### Course Cart Implementation

1. **Database Queries**:
   ```sql
   -- Get cart items for student
   SELECT cc.id, c.code, c.name, c.credit 
   FROM course_cart cc 
   JOIN courses c ON cc.course_id = c.id 
   WHERE cc.student_id = ?;
   
   -- Add course to cart
   INSERT INTO course_cart (student_id, course_id, semester) VALUES (?, ?, ?);
   
   -- Remove course from cart
   DELETE FROM course_cart WHERE id = ? AND student_id = ?;
   ```

2. **Implementation Steps**:
   - Create cart controller with CRUD operations
   - Use localStorage for temporary cart storage
   - Sync with database on login/logout
   - Calculate totals using course credits and department fee structure
   - Implement remove functionality

### Registration Submission Implementation

1. **Database Queries**:
   ```sql
   -- Create registration bundle
   INSERT INTO registration_bundles 
   (student_id, semester, status, submitted_at) 
   VALUES (?, ?, 'pending', NOW());
   
   -- Add course registrations to bundle
   INSERT INTO course_registrations (bundle_id, course_id, status) 
   VALUES (?, ?, 'pending');
   
   -- Clear student's cart after submission
   DELETE FROM course_cart WHERE student_id = ?;
   ```

2. **Implementation Steps**:
   - Create transaction wrapper for multi-table updates
   - Implement bundle creation with course items
   - Add final validation before submission
   - Show success/error messages based on transaction result
   - Redirect to registration status page after successful submission

### Registration Status Implementation

1. **Database Queries**:
   ```sql
   -- Get registration bundles for student
   SELECT id, semester, status, advisor_approval, hod_approval, submitted_at 
   FROM registration_bundles WHERE student_id = ? ORDER BY submitted_at DESC;
   
   -- Get courses in a bundle
   SELECT cr.id, c.code, c.name, c.credit, cr.status, cr.rejection_reason 
   FROM course_registrations cr 
   JOIN courses c ON cr.course_id = c.id 
   WHERE cr.bundle_id = ?;
   ```

2. **Implementation Steps**:
   - Create status controller with bundle and course queries
   - Implement status badges with different colors
   - Add auto-refresh or manual refresh button
   - Enable payment button only when fully approved
   - Display rejection reasons when applicable

### Payment Portal Implementation

1. **Database Queries**:
   ```sql
   -- Get bundle total amount
   SELECT rb.id, SUM(c.credit * d.amount_per_credit) as total_amount 
   FROM registration_bundles rb
   JOIN course_registrations cr ON rb.id = cr.bundle_id
   JOIN courses c ON cr.course_id = c.id
   JOIN departments d ON c.department_id = d.id
   WHERE rb.id = ? GROUP BY rb.id;
   
   -- Get student waiver
   SELECT waiver_percentage FROM student WHERE id = ?;
   
   -- Create payment record
   INSERT INTO payments (bundle_id, student_id, amount, status, payment_date) 
   VALUES (?, ?, ?, 'completed', NOW());
   
   -- Update bundle payment status
   UPDATE registration_bundles SET payment_status = 'paid' WHERE id = ?;
   ```

2. **Implementation Steps**:
   - Calculate total fees with waiver discount
   - Implement simple payment form
   - Create payment success and failure pages
   - Update bundle status after successful payment
   - Generate simple receipt

## Advisor Portal Pages

### Advisor Dashboard Implementation

1. **Database Queries**:
   ```sql
   -- Get pending approval count
   SELECT COUNT(*) as count FROM registration_bundles 
   WHERE advisor_id = ? AND advisor_approval = 0 AND status = 'pending';
   
   -- Get assigned students count
   SELECT COUNT(*) as count FROM student WHERE advisor_id = ?;
   
   -- Get recent activities
   SELECT rb.id, s.name as student_name, rb.submitted_at, rb.status 
   FROM registration_bundles rb
   JOIN student s ON rb.student_id = s.id
   WHERE rb.advisor_id = ? ORDER BY rb.submitted_at DESC LIMIT 10;
   ```

2. **Implementation Steps**:
   - Create advisor dashboard controller
   - Implement metrics calculations
   - Create simple activity log display
   - Add quick action buttons
   - Implement notification system for new requests

### Student Management Implementation

1. **Database Queries**:
   ```sql
   -- Get advisor's students
   SELECT id, name, registration_number, email, mobile 
   FROM student WHERE advisor_id = ? ORDER BY name;
   
   -- Get student details
   SELECT s.*, d.name as department_name 
   FROM student s
   JOIN departments d ON s.department_id = d.id
   WHERE s.id = ? AND s.advisor_id = ?;
   
   -- Get student's registrations
   SELECT rb.id, rb.semester, rb.status, rb.submitted_at,
   COUNT(cr.id) as course_count
   FROM registration_bundles rb
   LEFT JOIN course_registrations cr ON rb.id = cr.bundle_id
   WHERE rb.student_id = ? GROUP BY rb.id ORDER BY rb.submitted_at DESC;
   ```

2. **Implementation Steps**:
   - Create student listing controller
   - Implement student details view
   - Add search and filter functionality
   - Create student academic history view
   - Add pagination for large student lists

### Registration Approval Implementation

1. **Database Queries**:
   ```sql
   -- Get pending registrations
   SELECT rb.id, s.name as student_name, s.registration_number,
   rb.submitted_at, COUNT(cr.id) as course_count
   FROM registration_bundles rb
   JOIN student s ON rb.student_id = s.id
   JOIN course_registrations cr ON rb.id = cr.bundle_id
   WHERE rb.advisor_id = ? AND rb.advisor_approval = 0 AND rb.status = 'pending'
   GROUP BY rb.id ORDER BY rb.submitted_at ASC;
   
   -- Get registration details
   SELECT cr.id, c.code, c.name, c.credit, cr.status 
   FROM course_registrations cr
   JOIN courses c ON cr.course_id = c.id
   WHERE cr.bundle_id = ?;
   
   -- Approve registration
   UPDATE registration_bundles 
   SET advisor_approval = 1, status = 'pending_hod' 
   WHERE id = ? AND advisor_id = ?;
   
   -- Reject registration
   UPDATE registration_bundles 
   SET status = 'rejected', rejection_reason = ? 
   WHERE id = ? AND advisor_id = ?;
   ```

2. **Implementation Steps**:
   - Create approval controller with pending requests
   - Implement details view for each registration
   - Add approve/reject functionality
   - Create form for rejection reasons
   - Implement batch approval option

## HOD Portal Pages

### HOD Dashboard Implementation

1. **Database Queries**:
   ```sql
   -- Get HOD's department
   SELECT d.* FROM departments d
   JOIN hod h ON d.id = h.department_id
   WHERE h.id = ?;
   
   -- Get pending HOD approvals count
   SELECT COUNT(*) as count FROM registration_bundles rb
   JOIN student s ON rb.student_id = s.id
   JOIN departments d ON s.department_id = d.id
   JOIN hod h ON d.id = h.department_id
   WHERE h.id = ? AND rb.advisor_approval = 1 
   AND rb.hod_approval = 0 AND rb.status = 'pending_hod';
   
   -- Get department courses count
   SELECT COUNT(*) as count FROM courses WHERE department_id = ?;
   
   -- Get department students count
   SELECT COUNT(*) as count FROM student WHERE department_id = ?;
   ```

2. **Implementation Steps**:
   - Create HOD dashboard controller
   - Implement department statistics
   - Add approval queue status
   - Create simple activity feed
   - Add quick action links

### Course Management Implementation

1. **Database Queries**:
   ```sql
   -- Get department courses
   SELECT id, code, name, credit FROM courses 
   WHERE department_id = ? ORDER BY code;
   
   -- Add new course
   INSERT INTO courses (name, code, credit, department_id) 
   VALUES (?, ?, ?, ?);
   
   -- Update course
   UPDATE courses SET name = ?, code = ?, credit = ? 
   WHERE id = ? AND department_id = ?;
   
   -- Delete course
   DELETE FROM courses WHERE id = ? AND department_id = ?;
   
   -- Get course prerequisites
   SELECT p.id, p.prereq_course_id, c.code, c.name 
   FROM prerequisites p
   JOIN courses c ON p.prereq_course_id = c.id
   WHERE p.course_id = ?;
   
   -- Add prerequisite
   INSERT INTO prerequisites (course_id, prereq_course_id) VALUES (?, ?);
   ```

2. **Implementation Steps**:
   - Create course management controller
   - Implement course listing view
   - Add modal forms for add/edit operations
   - Implement deletion with confirmation
   - Create prerequisites management interface

### HOD Registration Approval Implementation

1. **Database Queries**:
   ```sql
   -- Get pending HOD approvals
   SELECT rb.id, s.name as student_name, s.registration_number,
   a.name as advisor_name, rb.submitted_at
   FROM registration_bundles rb
   JOIN student s ON rb.student_id = s.id
   JOIN advisor a ON s.advisor_id = a.id
   JOIN departments d ON s.department_id = d.id
   JOIN hod h ON d.id = h.department_id
   WHERE h.id = ? AND rb.advisor_approval = 1 
   AND rb.hod_approval = 0 AND rb.status = 'pending_hod'
   ORDER BY rb.submitted_at ASC;
   
   -- Approve registration
   UPDATE registration_bundles 
   SET hod_approval = 1, status = 'approved' 
   WHERE id = ?;
   
   -- Reject registration
   UPDATE registration_bundles 
   SET status = 'rejected', rejection_reason = ? 
   WHERE id = ?;
   ```

2. **Implementation Steps**:
   - Adapt advisor approval controller for HOD
   - Implement department-specific validation
   - Add notes field for HOD comments
   - Create approval/rejection functionality
   - Add final status notification system

## Admin Portal Pages

### Admin Dashboard Implementation

1. **Database Queries**:
   ```sql
   -- Get users count by role
   SELECT 
     SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
     SUM(CASE WHEN role = 'advisor' THEN 1 ELSE 0 END) as advisors,
     SUM(CASE WHEN role = 'hod' THEN 1 ELSE 0 END) as hods,
     SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins
   FROM users;
   
   -- Get registrations by status
   SELECT status, COUNT(*) as count 
   FROM registration_bundles 
   GROUP BY status;
   
   -- Get payments summary
   SELECT status, COUNT(*) as count, SUM(amount) as total 
   FROM payments 
   GROUP BY status;
   ```

2. **Implementation Steps**:
   - Create admin dashboard controller
   - Implement system-wide statistics
   - Add simple charts for visual representation
   - Create activity monitoring interface
   - Implement system status indicators

### User Management Implementation

1. **Database Queries**:
   ```sql
   -- Get all users
   SELECT id, name, email, role, created_at 
   FROM users ORDER BY role, name LIMIT ?, ?;
   
   -- Create new user
   INSERT INTO users (name, email, password, role) 
   VALUES (?, ?, ?, ?);
   
   -- Update user
   UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?;
   
   -- Reset password
   UPDATE users SET password = ? WHERE id = ?;
   
   -- Deactivate user
   UPDATE users SET active = 0 WHERE id = ?;
   ```

2. **Implementation Steps**:
   - Create user management controller
   - Implement user listing with pagination
   - Add user creation form with role selection
   - Create edit user functionality
   - Implement password reset option
   - Add user activation/deactivation toggle

### System Configuration Implementation

1. **Database Queries**:
   ```sql
   -- Get current deadline
   SELECT id, semester, deadline_date 
   FROM registration_deadline
   WHERE deadline_date > CURRENT_DATE()
   ORDER BY deadline_date ASC LIMIT 1;
   
   -- Update deadline
   UPDATE registration_deadline SET deadline_date = ? WHERE id = ?;
   
   -- Add new deadline
   INSERT INTO registration_deadline (semester, deadline_date) 
   VALUES (?, ?);
   
   -- Get department fees
   SELECT id, name, amount_per_credit FROM departments;
   
   -- Update department fee
   UPDATE departments SET amount_per_credit = ? WHERE id = ?;
   ```

2. **Implementation Steps**:
   - Create configuration controller
   - Implement settings form for deadlines
   - Add department fee management
   - Create notification settings interface
   - Implement configuration saving functionality

### Reporting Implementation

1. **Database Queries**:
   ```sql
   -- Registration report
   SELECT d.name as department, COUNT(rb.id) as total_registrations,
   SUM(CASE WHEN rb.status = 'approved' THEN 1 ELSE 0 END) as approved,
   SUM(CASE WHEN rb.status = 'rejected' THEN 1 ELSE 0 END) as rejected
   FROM registration_bundles rb
   JOIN student s ON rb.student_id = s.id
   JOIN departments d ON s.department_id = d.id
   WHERE rb.submitted_at BETWEEN ? AND ?
   GROUP BY d.name;
   
   -- Payment report
   SELECT d.name as department, COUNT(p.id) as payments,
   SUM(p.amount) as total_amount
   FROM payments p
   JOIN registration_bundles rb ON p.bundle_id = rb.id
   JOIN student s ON rb.student_id = s.id
   JOIN departments d ON s.department_id = d.id
   WHERE p.payment_date BETWEEN ? AND ?
   GROUP BY d.name;
   ```

2. **Implementation Steps**:
   - Create reporting controller
   - Implement report selection interface
   - Add date range filters
   - Create tabular report display
   - Implement CSV export functionality
   - Add simple charts for data visualization