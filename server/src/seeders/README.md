# Database Seeders

This directory contains comprehensive seeders for populating the LMS database with sample data for testing and development purposes.

## Overview

The seeder system creates realistic sample data for all entities in the Learning Management System:

- **Users**: 2 Admins, 5 Teachers, 15 Students
- **Courses**: 15 courses across different academic disciplines
- **Batches**: Multiple batches for different academic terms
- **Enrollments**: Student enrollments in various courses
- **Notes**: Course materials and study resources
- **Videos**: Lecture videos and educational content
- **Quizzes**: Assessments with different difficulty levels
- **Questions**: Various question types (MCQ, True/False, Short Answer)
- **Quiz Attempts**: Student performance data
- **Evaluations**: Teacher assessments and feedback

## Quick Setup

### Option 1: Automatic Setup (Recommended)
```bash
# This will generate Prisma client, push schema, and seed data
npm run setup
```

### Option 2: Manual Setup
```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push schema to database
npm run db:push

# 3. Run seeders
npm run seed
```

## File Structure

```
seeders/
├── index.ts              # Main seeder orchestrator
├── users.ts              # User data (admins, teachers, students)
├── courses.ts            # Course data across disciplines
├── batches.ts            # Academic term batches
├── enrollments.ts        # Student course enrollments
├── notes.ts              # Course materials and documents
├── videos.ts             # Educational videos and lectures
├── quizzes.ts            # Assessment quizzes
├── questions.ts          # Quiz questions with answers
├── quizAttempts.ts       # Student quiz performance
├── evaluations.ts        # Teacher evaluations and feedback
└── README.md             # This file
```

## Usage

### Running the Seeders

```bash
# Run all seeders (requires database to be set up first)
npm run seed

# Or run directly with ts-node
npx ts-node src/seeders/index.ts
```

### Individual Seeders

You can also run individual seeders by importing them:

```typescript
import { seedUsers } from './users';
import { seedCourses } from './courses';
// ... etc
```

## Data Overview

### Users
- **Admins**: 2 users with full system access
- **Teachers**: 5 professors across different departments
- **Students**: 15 students with various academic backgrounds

**Default Password**: `password123` (hashed with bcrypt)

### Courses
- **Computer Science**: CS101, CS201, CS301, CS401
- **Mathematics**: MATH201, MATH301
- **Business**: BUS301, MKT201, ACC201, HRM201
- **English**: ENG201, ENG301
- **Physics**: PHY101, CHEM101, EE201

### Academic Terms
- **Fall 2024**: Current active term
- **Spring 2024**: Completed term
- **Summer 2024**: Completed term
- **Spring 2025**: Future term

### Assessment Types
- **Quizzes**: Multiple choice, true/false, short answer
- **Evaluations**: Assignments, projects, presentations, participation
- **Quiz Attempts**: Realistic performance data with pass/fail scenarios

## Sample Login Credentials

### Admin Users
- Email: `admin@university.edu` | Password: `password123`
- Email: `admin2@university.edu` | Password: `password123`

### Teacher Users
- Email: `prof.smith@university.edu` | Password: `password123`
- Email: `prof.johnson@university.edu` | Password: `password123`
- Email: `prof.williams@university.edu` | Password: `password123`
- Email: `prof.brown@university.edu` | Password: `password123`
- Email: `prof.davis@university.edu` | Password: `password123`

### Student Users
- Email: `student1@university.edu` | Password: `password123`
- Email: `student2@university.edu` | Password: `password123`
- ... (up to student15@university.edu)

## Data Relationships

The seeders maintain proper relationships between entities:

1. **Users → Courses**: Teachers are assigned to courses
2. **Courses → Batches**: Each course has multiple batches
3. **Students → Enrollments**: Students are enrolled in courses through batches
4. **Teachers → Content**: Teachers create notes, videos, quizzes
5. **Students → Performance**: Students take quizzes and receive evaluations

## Customization

### Adding More Data

To add more sample data, modify the respective seeder files:

1. Add new data objects to the arrays
2. Ensure proper relationships are maintained
3. Run the seeder again

### Modifying Existing Data

Edit the data arrays in the seeder files to change:
- Course descriptions
- Quiz questions and answers
- Evaluation feedback
- File paths and URLs

### Clearing Data

The main seeder (`index.ts`) includes a cleanup section that deletes existing data before seeding. Comment out these lines if you want to preserve existing data:

```typescript
// Comment out to preserve existing data
await prisma.evaluation.deleteMany();
await prisma.quizAttempt.deleteMany();
// ... etc
```

## Notes

- All file URLs are placeholder paths (e.g., `/uploads/notes/...`)
- Video durations are in seconds
- Quiz durations are in minutes
- Dates are set to realistic academic calendar dates
- Scores and marks are realistic for educational assessments

## Troubleshooting

### Common Issues

1. **Database Tables Don't Exist**: Run `npm run setup` to initialize the database
2. **Foreign Key Errors**: Ensure seeders run in the correct order (users → courses → batches → enrollments → content)
3. **Duplicate Data**: The seeder clears existing data by default
4. **Database Connection**: Ensure your database is running and accessible

### Database Setup Issues

If you encounter "table does not exist" errors:

```bash
# Check if database is running and accessible
# Ensure your DATABASE_URL in .env is correct

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run seeders
npm run seed
```

### Reset Database

To completely reset and reseed:

```bash
# Reset database (if using migrations)
npx prisma migrate reset

# Or push schema changes
npx prisma db push

# Run seeders
npm run seed
```

### Environment Setup

Ensure your `.env` file contains the correct database URL:

```env
DATABASE_URL="mysql://username:password@localhost:3306/lms_database"
```

## Contributing

When adding new seeders or modifying existing ones:

1. Maintain consistent data quality
2. Ensure proper relationships
3. Add realistic and educational content
4. Update this README with new information
5. Test the seeders with a fresh database 