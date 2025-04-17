# CourseSphere: Database Implementation Guide

This document provides a comprehensive guide for implementing the database component of the CourseSphere Online Course Registration System.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Tables and Relationships](#tables-and-relationships)
4. [SQL Queries by Module](#sql-queries-by-module)
5. [Database Optimization Strategies](#database-optimization-strategies)
6. [Data Migration and Backup](#data-migration-and-backup)

## Database Schema

The CourseSphere database follows a relational model designed to efficiently manage the course registration process. The schema is organized into several interconnected tables that handle various aspects of the system including user management, course catalog, registration process, and administrative functions.

## Entity Relationship Diagram

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    Student    │       │   Department  │       │    Course     │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ student_id PK │       │ dept_id PK    │       │ course_id PK  │
│ first_name    │       │ dept_name     │       │ course_code   │
│ last_name     │       │ dean_name     │◄──────┤ dept_id FK    │
│ email         │       │ credit_cost   │       │ title         │
│ password_hash │       └───────────────┘       │ description   │
│ dept_id FK    │                               │ credit_hours  │
│ advisor_id FK │       ┌───────────────┐       │ max_seats     │
│ waiver_pct    │       │    Advisor    │       │ available_seats│
└───┬───────────┘       ├───────────────┤       └───┬───────────┘
    │                   │ advisor_id PK │           │
    │                   │ first_name    │           │
    │                   │ last_name     │           │
    │                   │ email         │           │
    │                   │ password_hash │           │
    │                   │ dept_id FK    │           │
    │                   └───────────────┘           │
    │                                               │
    │                   ┌───────────────┐           │
    │                   │ Prerequisite  │           │
    │                   ├───────────────┤           │
    │                   │ prereq_id PK  │           │
    └──────────────────►│ course_id FK  │◄──────────┘
                        │ prereq_course_id FK│
                        └───────────────┘
                        
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  Course_Cart  │       │ Registration_ │       │    Course_    │
│               │       │    Bundle     │       │ Registration  │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ cart_id PK    │       │ bundle_id PK  │       │ reg_id PK     │
│ student_id FK │       │ student_id FK │       │ bundle_id FK  │
│ course_id FK  │       │ semester      │       │ course_id FK  │
│ added_on      │       │ total_fees    │       │ status        │
└───────────────┘       │ status        │       │ advisor_notes │
                        │ submitted_on  │       │ approval_date │
                        │ advisor_app   │       └───────────────┘
                        │ hod_app       │
                        │ payment_status│
                        └───────────────┘
```

## Tables and Relationships

### User-related Tables

1. **Student**
   - Primary key: `student_id`
   - Foreign keys: `dept_id` (references Department), `advisor_id` (references Advisor)
   - Key fields: name, email, password_hash, waiver_percentage

2. **Advisor**
   - Primary key: `advisor_id`
   - Foreign key: `dept_id` (references Department)
   - Key fields: name, email, password_hash

3. **HOD (Head of Department)**
   - Primary key: `hod_id`
   - Foreign key: `dept_id` (references Department)
   - Key fields: name, email, password_hash

4. **Admin**
   - Primary key: `admin_id`
   - Key fields: name, email, password_hash, access_level

### Course and Department Tables

5. **Department**
   - Primary key: `dept_id`
   - Key fields: dept_name, dean_name, credit_hour_cost

6. **Course**
   - Primary key: `course_id`
   - Foreign key: `dept_id` (references Department)
   - Key fields: course_code, title, description, credit_hours, max_seats, available_seats

7. **Prerequisite**
   - Primary key: `prereq_id`
   - Foreign keys: `course_id` (references Course), `prereq_course_id` (references Course)

### Registration-related Tables

8. **Course_Cart**
   - Primary key: `cart_id`
   - Foreign keys: `student_id` (references Student), `course_id` (references Course)
   - Key field: added_on

9. **Registration_Bundle**
   - Primary key: `bundle_id`
   - Foreign key: `student_id` (references Student)
   - Key fields: semester, total_fees, status, submitted_on, advisor_approval, hod_approval, payment_status

10. **Course_Registration**
    - Primary key: `reg_id`
    - Foreign keys: `bundle_id` (references Registration_Bundle), `course_id` (references Course)
    - Key fields: status, advisor_notes, approval_date

### Auxiliary Tables

11. **Notification**
    - Primary key: `notification_id`
    - Foreign keys: `user_id`, `user_type` (determines which user table to reference)
    - Key fields: message, created_on, read_status

12. **Payment**
    - Primary key: `payment_id`
    - Foreign key: `bundle_id` (references Registration_Bundle)
    - Key fields: amount, payment_method, transaction_id, payment_date, status

13. **Audit_Log**
    - Primary key: `log_id`
    - Foreign keys: `user_id`, `user_type` (determines which user table to reference)
    - Key fields: action, timestamp, details, ip_address

## SQL Queries by Module

### User Authentication

#### Login Verification
```sql
SELECT student_id, first_name, last_name, email, password_hash 
FROM Student 
WHERE email = ? AND status = 'active';

-- Similar queries for Advisor, HOD, and Admin tables
```

#### Password Reset
```sql
UPDATE Student
SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL
WHERE reset_token = ? AND reset_token_expiry > NOW();
```

### Course Catalog

#### Fetch All Courses with Department Info
```sql
SELECT c.course_id, c.course_code, c.title, c.description, 
       c.credit_hours, c.max_seats, c.available_seats,
       d.dept_name, d.credit_hour_cost
FROM Course c
JOIN Department d ON c.dept_id = d.dept_id
WHERE c.available_seats > 0
ORDER BY d.dept_name, c.course_code;
```

#### Filter Courses by Department
```sql
SELECT c.course_id, c.course_code, c.title, c.credit_hours, 
       c.available_seats, d.dept_name
FROM Course c
JOIN Department d ON c.dept_id = d.dept_id
WHERE d.dept_id = ?
ORDER BY c.course_code;
```

#### Check Prerequisites for a Course
```sql
SELECT p.prereq_id, c.course_code, c.title
FROM Prerequisite p
JOIN Course c ON p.prereq_course_id = c.course_id
WHERE p.course_id = ?;
```

#### Check if Student Has Satisfied Course Prerequisites
```sql
SELECT COUNT(*) as prerequisite_count,
       (SELECT COUNT(*) 
        FROM Prerequisite p 
        WHERE p.course_id = ?) as total_prerequisites
FROM Prerequisite p
JOIN Course c ON p.prereq_course_id = c.course_id
JOIN Course_Registration cr ON cr.course_id = c.course_id
JOIN Registration_Bundle rb ON cr.bundle_id = rb.bundle_id
WHERE p.course_id = ?
AND rb.student_id = ?
AND rb.status = 'completed'
AND cr.status = 'approved';
```

### Course Cart

#### Add Course to Cart
```sql
INSERT INTO Course_Cart (student_id, course_id, added_on)
VALUES (?, ?, NOW());
```

#### View Cart Contents
```sql
SELECT cc.cart_id, c.course_id, c.course_code, c.title,
       c.credit_hours, d.credit_hour_cost, c.available_seats,
       d.dept_name
FROM Course_Cart cc
JOIN Course c ON cc.course_id = c.course_id
JOIN Department d ON c.dept_id = d.dept_id
WHERE cc.student_id = ?
ORDER BY cc.added_on DESC;
```

#### Calculate Cart Total
```sql
SELECT SUM(c.credit_hours * d.credit_hour_cost) as total_cost,
       SUM(c.credit_hours) as total_credits,
       (SELECT waiver_percentage FROM Student WHERE student_id = ?) as waiver
FROM Course_Cart cc
JOIN Course c ON cc.course_id = c.course_id
JOIN Department d ON c.dept_id = d.dept_id
WHERE cc.student_id = ?;
```

#### Remove Course from Cart
```sql
DELETE FROM Course_Cart
WHERE cart_id = ? AND student_id = ?;
```

#### Clear Cart
```sql
DELETE FROM Course_Cart
WHERE student_id = ?;
```

### Registration Submission

#### Create Registration Bundle
```sql
INSERT INTO Registration_Bundle 
(student_id, semester, total_fees, status, submitted_on)
VALUES (?, ?, ?, 'pending', NOW());
```

#### Add Courses to Registration
```sql
INSERT INTO Course_Registration (bundle_id, course_id, status)
SELECT ?, cc.course_id, 'pending'
FROM Course_Cart cc
WHERE cc.student_id = ?;
```

#### Get Registration Details
```sql
SELECT rb.bundle_id, rb.semester, rb.total_fees, rb.status,
       rb.submitted_on, rb.advisor_approval, rb.hod_approval,
       rb.payment_status, s.first_name, s.last_name, s.email,
       d.dept_name
FROM Registration_Bundle rb
JOIN Student s ON rb.student_id = s.student_id
JOIN Department d ON s.dept_id = d.dept_id
WHERE rb.bundle_id = ?;
```

#### Get Registered Courses
```sql
SELECT cr.reg_id, cr.status, cr.advisor_notes, cr.approval_date,
       c.course_code, c.title, c.credit_hours, d.dept_name
FROM Course_Registration cr
JOIN Course c ON cr.course_id = c.course_id
JOIN Department d ON c.dept_id = d.dept_id
WHERE cr.bundle_id = ?;
```

### Advisor Approval

#### Get Pending Registrations
```sql
SELECT rb.bundle_id, rb.submitted_on, rb.status,
       s.student_id, s.first_name, s.last_name, s.email
FROM Registration_Bundle rb
JOIN Student s ON rb.student_id = s.student_id
WHERE s.advisor_id = ? AND rb.advisor_approval = FALSE
ORDER BY rb.submitted_on ASC;
```

#### Approve/Reject Individual Course
```sql
UPDATE Course_Registration
SET status = ?, advisor_notes = ?, approval_date = NOW()
WHERE reg_id = ?;
```

#### Complete Advisor Review
```sql
UPDATE Registration_Bundle
SET advisor_approval = TRUE, status = 
    CASE 
        WHEN (SELECT COUNT(*) FROM Course_Registration 
              WHERE bundle_id = ? AND status = 'rejected') > 0 
        THEN 'partially_approved' 
        ELSE 'advisor_approved' 
    END
WHERE bundle_id = ?;
```

### HOD Approval

#### Get Advisor-Approved Registrations
```sql
SELECT rb.bundle_id, rb.submitted_on, rb.status,
       s.student_id, s.first_name, s.last_name, 
       a.first_name as advisor_first_name, a.last_name as advisor_last_name
FROM Registration_Bundle rb
JOIN Student s ON rb.student_id = s.student_id
JOIN Advisor a ON s.advisor_id = a.advisor_id
JOIN Department d ON s.dept_id = d.dept_id
WHERE d.hod_id = ? AND rb.advisor_approval = TRUE AND rb.hod_approval = FALSE
ORDER BY rb.submitted_on ASC;
```

#### Complete HOD Review
```sql
UPDATE Registration_Bundle
SET hod_approval = TRUE, 
    status = 'approved'
WHERE bundle_id = ?;
```

### Payment Processing

#### Record Payment
```sql
INSERT INTO Payment 
(bundle_id, amount, payment_method, transaction_id, payment_date, status)
VALUES (?, ?, ?, ?, NOW(), 'completed');
```

#### Update Registration Status After Payment
```sql
UPDATE Registration_Bundle
SET payment_status = 'paid', status = 'completed'
WHERE bundle_id = ?;
```

#### Update Available Seats
```sql
UPDATE Course c
SET available_seats = available_seats - 1
WHERE course_id IN (
    SELECT cr.course_id
    FROM Course_Registration cr
    WHERE cr.bundle_id = ? AND cr.status = 'approved'
);
```

### Student Management

#### Get Student Details with Registration History
```sql
SELECT s.student_id, s.first_name, s.last_name, s.email, 
       s.waiver_percentage, d.dept_name, a.first_name as advisor_first_name,
       a.last_name as advisor_last_name
FROM Student s
JOIN Department d ON s.dept_id = d.dept_id
JOIN Advisor a ON s.advisor_id = a.advisor_id
WHERE s.student_id = ?;
```

#### Get Student's Registration History
```sql
SELECT rb.bundle_id, rb.semester, rb.submitted_on, rb.status,
       rb.total_fees, rb.payment_status,
       COUNT(cr.reg_id) as course_count
FROM Registration_Bundle rb
LEFT JOIN Course_Registration cr ON rb.bundle_id = cr.bundle_id
WHERE rb.student_id = ?
GROUP BY rb.bundle_id
ORDER BY rb.submitted_on DESC;
```

#### Update Student Information
```sql
UPDATE Student
SET first_name = ?, last_name = ?, email = ?, 
    dept_id = ?, advisor_id = ?, waiver_percentage = ?
WHERE student_id = ?;
```

### Course Management

#### Create New Course
```sql
INSERT INTO Course 
(course_code, dept_id, title, description, credit_hours, max_seats, available_seats)
VALUES (?, ?, ?, ?, ?, ?, ?);
```

#### Update Course Details
```sql
UPDATE Course
SET title = ?, description = ?, credit_hours = ?,
    max_seats = ?, available_seats = ?
WHERE course_id = ?;
```

#### Add Course Prerequisite
```sql
INSERT INTO Prerequisite (course_id, prereq_course_id)
VALUES (?, ?);
```

#### Get Course Enrollment Statistics
```sql
SELECT c.course_id, c.course_code, c.title, c.max_seats,
       c.available_seats, (c.max_seats - c.available_seats) as enrolled,
       (SELECT COUNT(*) FROM Course_Cart cc WHERE cc.course_id = c.course_id) as in_carts
FROM Course c
WHERE c.dept_id = ?
ORDER BY c.course_code;
```

### System Administration

#### Create New Academic Semester
```sql
INSERT INTO Semester (semester_name, start_date, end_date, registration_start, registration_deadline)
VALUES (?, ?, ?, ?, ?);
```

#### Update Department Credit Hour Cost
```sql
UPDATE Department
SET credit_hour_cost = ?
WHERE dept_id = ?;
```

#### Create System Notification
```sql
INSERT INTO Notification (user_id, user_type, message, created_on, read_status, global)
VALUES (?, ?, ?, NOW(), FALSE, ?);
```

#### Get System Audit Logs
```sql
SELECT al.log_id, al.action, al.timestamp, al.ip_address,
       al.user_id, al.user_type, al.details
FROM Audit_Log al
WHERE al.timestamp BETWEEN ? AND ?
ORDER BY al.timestamp DESC
LIMIT 100;
```

## Database Optimization Strategies

### Indexing Strategy

The following indexes should be created to optimize query performance:

1. **Student table:**
   ```sql
   CREATE INDEX idx_student_advisor ON Student(advisor_id);
   CREATE INDEX idx_student_dept ON Student(dept_id);
   CREATE INDEX idx_student_email ON Student(email);
   ```

2. **Course table:**
   ```sql
   CREATE INDEX idx_course_dept ON Course(dept_id);
   CREATE INDEX idx_course_code ON Course(course_code);
   ```

3. **Course_Cart table:**
   ```sql
   CREATE INDEX idx_cart_student ON Course_Cart(student_id);
   CREATE INDEX idx_cart_course ON Course_Cart(course_id);
   ```

4. **Registration_Bundle table:**
   ```sql
   CREATE INDEX idx_bundle_student ON Registration_Bundle(student_id);
   CREATE INDEX idx_bundle_status ON Registration_Bundle(status);
   CREATE INDEX idx_bundle_submitted ON Registration_Bundle(submitted_on);
   ```

5. **Course_Registration table:**
   ```sql
   CREATE INDEX idx_reg_bundle ON Course_Registration(bundle_id);
   CREATE INDEX idx_reg_course ON Course_Registration(course_id);
   CREATE INDEX idx_reg_status ON Course_Registration(status);
   ```

### Query Optimization

1. **Use prepared statements** for all queries to prevent SQL injection and improve performance.
2. **Implement connection pooling** to reduce database connection overhead.
3. **Paginate results** for large data sets (e.g., course catalog, registration history).
4. **Use batch operations** for multiple inserts/updates (e.g., when processing multiple course registrations).
5. **Implement caching** for frequently accessed, relatively static data (e.g., department and course information).

### Transaction Management

Use transactions for operations that require multiple related database changes:

```sql
START TRANSACTION;

-- Create registration bundle
INSERT INTO Registration_Bundle (student_id, semester, total_fees, status, submitted_on)
VALUES (?, ?, ?, 'pending', NOW());

-- Get the newly inserted bundle_id
SET @bundle_id = LAST_INSERT_ID();

-- Transfer courses from cart to registration
INSERT INTO Course_Registration (bundle_id, course_id, status)
SELECT @bundle_id, cc.course_id, 'pending'
FROM Course_Cart cc
WHERE cc.student_id = ?;

-- Clear the student's cart
DELETE FROM Course_Cart
WHERE student_id = ?;

-- Create notification for student
INSERT INTO Notification (user_id, user_type, message, created_on, read_status)
VALUES (?, 'student', 'Your course registration has been submitted and is pending approval.', NOW(), FALSE);

-- Create notification for advisor
INSERT INTO Notification (user_id, user_type, message, created_on, read_status)
VALUES (
    (SELECT advisor_id FROM Student WHERE student_id = ?),
    'advisor',
    CONCAT('New registration submission from student: ', 
           (SELECT CONCAT(first_name, ' ', last_name) FROM Student WHERE student_id = ?)),
    NOW(),
    FALSE
);

COMMIT;
```

## Data Migration and Backup

### Backup Procedures

1. **Daily differential backups** of the entire database.
2. **Weekly full backups** stored both on-site and off-site.
3. **Transaction log backups** every hour during peak registration periods.

### Backup Script Example

```sql
-- Create time-stamped backup filename
SET @backup_file = CONCAT('/backup/coursesphere_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s'), '.sql');

-- Execute backup (MySQL example)
SET @backup_cmd = CONCAT('mysqldump -u backup_user -p"password" coursesphere > ', @backup_file);
SELECT @backup_cmd;
```

### Data Migration Strategy

For system updates or schema changes:

1. **Create migration scripts** with both up and down migrations.
2. **Test migrations** in staging environment before production.
3. **Schedule migrations** during low-usage periods.
4. **Include rollback plan** for each migration.

### Sample Migration Script

```sql
-- Migration: Add graduation_year column to Student table

-- Up Migration
ALTER TABLE Student
ADD COLUMN graduation_year INT NULL,
ADD INDEX idx_graduation_year (graduation_year);

-- Update existing records based on enrollment date
UPDATE Student
SET graduation_year = YEAR(enrollment_date) + 4
WHERE graduation_year IS NULL;

-- Down Migration (if needed)
-- ALTER TABLE Student DROP COLUMN graduation_year;
```

---

This guide provides the foundation for implementing the database component of the CourseSphere system. The SQL queries, optimization strategies, and maintenance procedures outlined here should be adapted to the specific database management system being used (MySQL, PostgreSQL, SQL Server, etc.).