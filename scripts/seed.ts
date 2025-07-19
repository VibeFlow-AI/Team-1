import { PrismaClient } from '../lib/generated/prisma';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample mentors
  const mentor1 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@example.com' },
    update: {},
    create: {
      email: 'sarah.johnson@example.com',
      password: await hashPassword('password123'),
      role: 'MENTOR',
      mentorProfile: {
        create: {
          fullName: 'Sarah Johnson',
          age: 35,
          email: 'sarah.johnson@example.com',
          contactNumber: '+1234567890',
          preferredLanguage: 'English',
          currentLocation: 'New York, USA',
          shortBio: 'Experienced mathematics teacher with 12 years of teaching experience. Specialized in helping students understand complex mathematical concepts.',
          professionalRole: 'Mathematics Teacher',
          subjects: ['Mathematics', 'Physics', 'Chemistry'],
          teachingExperience: '5+ years',
          preferredLevels: ['Grade 10-11', 'Advanced Level'],
          linkedinProfile: 'https://linkedin.com/in/sarah-johnson',
          githubPortfolio: 'https://github.com/sarahjohnson',
          // Legacy fields
          expertise: 'Mathematics, Physics, Chemistry',
          experience: 12,
          bio: 'Experienced mathematics teacher with 12 years of teaching experience. Specialized in helping students understand complex mathematical concepts.',
          hourlyRate: 150,
        },
      },
    },
  });

  const mentor2 = await prisma.user.upsert({
    where: { email: 'michael.chen@example.com' },
    update: {},
    create: {
      email: 'michael.chen@example.com',
      password: await hashPassword('password123'),
      role: 'MENTOR',
      mentorProfile: {
        create: {
          fullName: 'Michael Chen',
          age: 28,
          email: 'michael.chen@example.com',
          contactNumber: '+1234567891',
          preferredLanguage: 'English',
          currentLocation: 'San Francisco, USA',
          shortBio: 'Software engineer and programming instructor. Passionate about teaching coding fundamentals and modern development practices.',
          professionalRole: 'Software Engineer',
          subjects: ['Computer Science', 'Programming', 'Web Development'],
          teachingExperience: '3–5 years',
          preferredLevels: ['Grade 6-9', 'Grade 10-11'],
          linkedinProfile: 'https://linkedin.com/in/michael-chen',
          githubPortfolio: 'https://github.com/michaelchen',
          // Legacy fields
          expertise: 'Computer Science, Programming, Web Development',
          experience: 8,
          bio: 'Software engineer and programming instructor. Passionate about teaching coding fundamentals and modern development practices.',
          hourlyRate: 180,
        },
      },
    },
  });

  const mentor3 = await prisma.user.upsert({
    where: { email: 'emily.rodriguez@example.com' },
    update: {},
    create: {
      email: 'emily.rodriguez@example.com',
      password: await hashPassword('password123'),
      role: 'MENTOR',
      mentorProfile: {
        create: {
          fullName: 'Emily Rodriguez',
          age: 32,
          email: 'emily.rodriguez@example.com',
          contactNumber: '+1234567892',
          preferredLanguage: 'English',
          currentLocation: 'Los Angeles, USA',
          shortBio: 'English literature specialist with a passion for helping students develop strong writing and analytical skills.',
          professionalRole: 'English Literature Specialist',
          subjects: ['English Literature', 'Creative Writing', 'Essay Writing'],
          teachingExperience: '5+ years',
          preferredLevels: ['Grade 10-11', 'Advanced Level'],
          linkedinProfile: 'https://linkedin.com/in/emily-rodriguez',
          githubPortfolio: 'https://github.com/emilyrodriguez',
          // Legacy fields
          expertise: 'English Literature, Creative Writing, Essay Writing',
          experience: 10,
          bio: 'English literature specialist with a passion for helping students develop strong writing and analytical skills.',
          hourlyRate: 120,
        },
      },
    },
  });

  // Create sample sessions
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.session.createMany({
    data: [
      {
        mentorId: mentor1.id,
        title: 'Advanced Mathematics: Calculus Fundamentals',
        description: 'Learn the fundamentals of calculus including limits, derivatives, and integrals. Perfect for students preparing for advanced level mathematics.',
        subject: 'Mathematics',
        duration: 60,
        price: 150,
        date: tomorrow,
        time: '10:00 AM',
        maxStudents: 5,
      },
      {
        mentorId: mentor1.id,
        title: 'Physics: Mechanics and Motion',
        description: 'Comprehensive session covering Newton\'s laws, kinematics, and dynamics. Includes practical examples and problem-solving techniques.',
        subject: 'Physics',
        duration: 90,
        price: 180,
        date: nextWeek,
        time: '2:00 PM',
        maxStudents: 3,
      },
      {
        mentorId: mentor2.id,
        title: 'Introduction to Python Programming',
        description: 'Learn Python programming from scratch. Covering variables, loops, functions, and basic data structures. No prior experience required.',
        subject: 'Computer Science',
        duration: 120,
        price: 200,
        date: tomorrow,
        time: '3:00 PM',
        maxStudents: 4,
      },
      {
        mentorId: mentor2.id,
        title: 'Web Development: HTML, CSS, and JavaScript',
        description: 'Build your first website! Learn HTML structure, CSS styling, and JavaScript interactivity. Hands-on project included.',
        subject: 'Web Development',
        duration: 90,
        price: 180,
        date: nextWeek,
        time: '11:00 AM',
        maxStudents: 6,
      },
      {
        mentorId: mentor3.id,
        title: 'Essay Writing Masterclass',
        description: 'Master the art of essay writing. Learn structure, argumentation, and persuasive techniques. Includes feedback on your writing.',
        subject: 'English',
        duration: 60,
        price: 120,
        date: tomorrow,
        time: '4:00 PM',
        maxStudents: 8,
      },
      {
        mentorId: mentor3.id,
        title: 'Shakespeare: Understanding the Classics',
        description: 'Explore Shakespeare\'s works and learn to analyze complex texts. Perfect for literature students and enthusiasts.',
        subject: 'Literature',
        duration: 75,
        price: 140,
        date: nextWeek,
        time: '1:00 PM',
        maxStudents: 5,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Sample mentor emails:');
  console.log('   - sarah.johnson@example.com (password: password123)');
  console.log('   - michael.chen@example.com (password: password123)');
  console.log('   - emily.rodriguez@example.com (password: password123)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 