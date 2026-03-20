import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import Counselor from '../src/models/Counselor';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/relife';

async function seed() {
  try {
    console.log('🌱 Starting seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep data)
    // await User.deleteMany({});
    // await Counselor.deleteMany({});
    // console.log('🗑️  Cleared existing data');

    // Create test users for counselors
    const testUsers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah@example.com',
        image: 'https://api.example.com/avatar1.jpg'
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael@example.com',
        image: 'https://api.example.com/avatar2.jpg'
      },
      {
        name: 'Dr. Emma Wilson',
        email: 'emma@example.com',
        image: 'https://api.example.com/avatar3.jpg'
      }
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = await User.create(userData);
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.name}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`ℹ️  User already exists: ${existingUser.name}`);
      }
    }

    // Generate test slots (next 7 days, 4 slots per day)
    function generateSlots() {
      const slots = [];
      const now = new Date();
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() + day);
        
        // Morning slot
        const morning = new Date(date);
        morning.setHours(9, 0, 0, 0);
        const morningEnd = new Date(morning);
        morningEnd.setHours(10, 0, 0, 0);
        slots.push({ start: morning, end: morningEnd, isBooked: false });
        
        // Mid-morning slot
        const midMorning = new Date(date);
        midMorning.setHours(11, 0, 0, 0);
        const midMorningEnd = new Date(midMorning);
        midMorningEnd.setHours(12, 0, 0, 0);
        slots.push({ start: midMorning, end: midMorningEnd, isBooked: false });
        
        // Afternoon slot
        const afternoon = new Date(date);
        afternoon.setHours(14, 0, 0, 0);
        const afternoonEnd = new Date(afternoon);
        afternoonEnd.setHours(15, 0, 0, 0);
        slots.push({ start: afternoon, end: afternoonEnd, isBooked: false });
        
        // Late afternoon slot
        const lateAfternoon = new Date(date);
        lateAfternoon.setHours(16, 0, 0, 0);
        const lateAfternoonEnd = new Date(lateAfternoon);
        lateAfternoonEnd.setHours(17, 0, 0, 0);
        slots.push({ start: lateAfternoon, end: lateAfternoonEnd, isBooked: false });
      }
      
      return slots;
    }

    // Create counselor profiles
    const counselorData = [
      {
        userId: createdUsers[0]._id,
        credentials: {
          degree: 'Master of Science in Counseling',
          license: 'LPC-001001',
          licenseState: 'California',
          yearsOfExperience: 5,
          certifications: ['Addiction Specialist', 'SAMHSA Certified']
        },
        specializations: ['addiction', 'substance_abuse', 'relapse_prevention'],
        bio: 'Dr. Sarah Johnson is a certified addiction recovery counselor with 5 years of experience helping clients overcome substance abuse and addiction. She specializes in motivational interviewing and cognitive behavioral therapy. Sarah is passionate about helping others on their recovery journey.',
        isVerified: true,
        hourlyRate: 50,
        ratingCount: 12,
        availableSlots: generateSlots()
      },
      {
        userId: createdUsers[1]._id,
        credentials: {
          degree: 'PhD in Clinical Psychology',
          license: 'MFT-001002',
          licenseState: 'New York',
          yearsOfExperience: 8,
          certifications: ['Trauma-Informed Care', 'EMDR Certified']
        },
        specializations: ['anxiety', 'depression', 'trauma', 'ptsd'],
        bio: 'Dr. Michael Chen is a licensed clinical psychologist with 8 years of experience in treating anxiety, depression, and trauma-related disorders. He has helped over 500 clients achieve significant improvements in their mental health through evidence-based therapeutic approaches and compassionate care.',
        isVerified: true,
        hourlyRate: 60,
        ratingCount: 25,
        availableSlots: generateSlots()
      },
      {
        userId: createdUsers[2]._id,
        credentials: {
          degree: 'Master of Marriage and Family Therapy',
          license: 'LMFT-001003',
          licenseState: 'Texas',
          yearsOfExperience: 10,
          certifications: ['Family Systems Therapy', 'Child Psychology']
        },
        specializations: ['family_therapy', 'group_therapy', 'teen_counseling', 'stress_management'],
        bio: 'Dr. Emma Wilson is a licensed marriage and family therapist with over 10 years of clinical experience. She specializes in working with families, teens, and individuals experiencing life transitions. Emma is dedicated to helping clients build stronger relationships and develop healthy coping strategies.',
        isVerified: true,
        hourlyRate: 75,
        ratingCount: 40,
        availableSlots: generateSlots()
      }
    ];

    for (const counselor of counselorData) {
      const existingCounselor = await Counselor.findOne({ userId: counselor.userId });
      if (!existingCounselor) {
        await Counselor.create(counselor);
        console.log(`✅ Created counselor: ${counselor.specializations.join(', ')} - ${counselor.availableSlots.length} slots`);
      } else {
        console.log(`ℹ️  Counselor already exists for user: ${counselor.userId}`);
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Users created: ${createdUsers.length}`);
    console.log(`   - Counselors with slots added`);
    console.log('\n🚀 You can now test the API endpoints!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
    process.exit(0);
  }
}

seed();
