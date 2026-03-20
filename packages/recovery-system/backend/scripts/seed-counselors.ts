import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import Counselor from '../src/models/Counselor';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/relife';

type CounselorSeed = {
  name: string;
  email: string;
  image: string;
  specializations: string[];
  experience: number;
  qualifications: string;
  sessionFee: number;
  bio: string;
  days: number[];
  startHour: number;
  endHour: number;
};

const counselors: CounselorSeed[] = [
  {
    name: 'Dr. Melissa Carter',
    email: 'melissa.carter@relife.local',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    specializations: ['substance_abuse', 'alcohol_dependency', 'relapse_prevention'],
    experience: 12,
    qualifications: 'PhD in Clinical Psychology',
    sessionFee: 40,
    bio: 'Helps individuals overcome alcohol dependency using CBT and relapse prevention strategies in practical weekly sessions focused on long term sobriety and healthy routines.',
    days: [1, 2, 3, 4, 5],
    startHour: 9,
    endHour: 17,
  },
  {
    name: 'Daniel Hayes',
    email: 'daniel.hayes@relife.local',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    specializations: ['drug_addiction', 'behavioral_addiction'],
    experience: 8,
    qualifications: 'MSc in Counseling Psychology',
    sessionFee: 30,
    bio: 'Focuses on habit-breaking techniques and long-term recovery planning through structured behavior change support and accountability frameworks for sustained progress.',
    days: [1, 3, 5],
    startHour: 10,
    endHour: 18,
  },
  {
    name: 'Sophia Bennett',
    email: 'sophia.bennett@relife.local',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    specializations: ['anxiety', 'addiction'],
    experience: 10,
    qualifications: 'Licensed Therapist (LPC)',
    sessionFee: 35,
    bio: 'Combines mindfulness with addiction counseling for holistic healing, helping clients reduce anxiety triggers while building practical coping plans for daily life.',
    days: [2, 3, 4, 5, 6],
    startHour: 8,
    endHour: 14,
  },
  {
    name: 'Michael Turner',
    email: 'michael.turner@relife.local',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    specializations: ['alcohol_dependency', 'stress_management'],
    experience: 15,
    qualifications: 'MA in Psychology',
    sessionFee: 45,
    bio: 'Expert in managing stress triggers that lead to relapse by teaching emotional regulation, stress mapping, and protective routines for high-risk situations.',
    days: [1, 2, 3, 4],
    startHour: 11,
    endHour: 19,
  },
  {
    name: 'Olivia Brooks',
    email: 'olivia.brooks@relife.local',
    image: 'https://randomuser.me/api/portraits/women/52.jpg',
    specializations: ['teen_counseling', 'substance_abuse'],
    experience: 7,
    qualifications: 'BSc Psychology, Certified Counselor',
    sessionFee: 25,
    bio: 'Works with teenagers struggling with substance use and peer pressure, guiding them and their families toward healthier coping and communication habits.',
    days: [0, 6],
    startHour: 9,
    endHour: 16,
  },
  {
    name: 'Ethan Caldwell',
    email: 'ethan.caldwell@relife.local',
    image: 'https://randomuser.me/api/portraits/men/85.jpg',
    specializations: ['addiction', 'relapse_prevention'],
    experience: 9,
    qualifications: 'Certified Addiction Specialist',
    sessionFee: 35,
    bio: 'Guides clients through structured recovery programs and lifestyle rebuilding with practical plans, check-ins, and measurable goals for steady improvement.',
    days: [0, 1, 2, 3, 4, 5, 6],
    startHour: 8,
    endHour: 20,
  },
  {
    name: 'Rachel Morgan',
    email: 'rachel.morgan@relife.local',
    image: 'https://randomuser.me/api/portraits/women/21.jpg',
    specializations: ['trauma', 'addiction', 'ptsd'],
    experience: 11,
    qualifications: 'PhD in Counseling Psychology',
    sessionFee: 50,
    bio: 'Helps clients address trauma-related addiction patterns using trauma-informed interventions and recovery plans designed to prevent recurring cycles.',
    days: [2, 3, 4, 5],
    startHour: 10,
    endHour: 17,
  },
  {
    name: 'James Holloway',
    email: 'james.holloway@relife.local',
    image: 'https://randomuser.me/api/portraits/men/41.jpg',
    specializations: ['behavioral_addiction', 'social_media_addiction'],
    experience: 6,
    qualifications: 'Certified Behavioral Therapist',
    sessionFee: 20,
    bio: 'Focuses on breaking daily addictive habits like smoking by combining behavior tracking, trigger awareness, and practical replacement routines.',
    days: [1, 2, 3, 4, 5, 6],
    startHour: 8,
    endHour: 12,
  },
  {
    name: 'Lauren Pierce',
    email: 'lauren.pierce@relife.local',
    image: 'https://randomuser.me/api/portraits/women/24.jpg',
    specializations: ['addiction', 'adult_counseling'],
    experience: 10,
    qualifications: 'MSc Clinical Psychology',
    sessionFee: 35,
    bio: 'Supports women through recovery with personalized therapy plans tailored to life context, emotional needs, and practical relapse prevention methods.',
    days: [1, 2, 3, 4, 5],
    startHour: 9,
    endHour: 15,
  },
  {
    name: 'Nathan Cole',
    email: 'nathan.cole@relife.local',
    image: 'https://randomuser.me/api/portraits/men/55.jpg',
    specializations: ['relapse_prevention', 'addiction'],
    experience: 13,
    qualifications: 'Licensed Clinical Therapist',
    sessionFee: 45,
    bio: 'Specializes in identifying triggers and preventing relapse cycles through personalized relapse plans, emergency coping tools, and accountability support.',
    days: [1, 2, 3, 4],
    startHour: 13,
    endHour: 20,
  },
  {
    name: 'Hannah Foster',
    email: 'hannah.foster@relife.local',
    image: 'https://randomuser.me/api/portraits/women/37.jpg',
    specializations: ['dual_diagnosis', 'anxiety', 'depression'],
    experience: 8,
    qualifications: 'BSc Psychology, Certified Counselor',
    sessionFee: 30,
    bio: 'Focuses on dual diagnosis care where mental health and addiction overlap, creating integrated treatment plans that address both together.',
    days: [2, 3, 4, 5, 6],
    startHour: 10,
    endHour: 18,
  },
  {
    name: 'Christopher Blake',
    email: 'christopher.blake@relife.local',
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
    specializations: ['alcohol_dependency', 'relapse_prevention'],
    experience: 14,
    qualifications: 'MA Clinical Psychology',
    sessionFee: 50,
    bio: 'Uses structured programs for alcohol recovery, helping clients build consistency and confidence with milestone-driven sobriety planning.',
    days: [1, 2, 3, 4, 5],
    startHour: 9,
    endHour: 17,
  },
  {
    name: 'Emily Dawson',
    email: 'emily.dawson@relife.local',
    image: 'https://randomuser.me/api/portraits/women/58.jpg',
    specializations: ['teen_counseling', 'behavioral_addiction'],
    experience: 6,
    qualifications: 'Licensed Therapist',
    sessionFee: 25,
    bio: 'Helps teens build healthier coping mechanisms through age-appropriate counseling, family communication support, and digital behavior boundaries.',
    days: [1, 2, 3, 4, 5, 6, 0],
    startHour: 16,
    endHour: 21,
  },
  {
    name: 'Ryan Mitchell',
    email: 'ryan.mitchell@relife.local',
    image: 'https://randomuser.me/api/portraits/men/29.jpg',
    specializations: ['drug_addiction', 'relapse_prevention'],
    experience: 9,
    qualifications: 'Certified Rehab Counselor',
    sessionFee: 35,
    bio: 'Focuses on recovery planning and accountability with practical tools that help clients maintain momentum between therapy sessions.',
    days: [1, 2, 3, 4, 5],
    startHour: 11,
    endHour: 18,
  },
  {
    name: 'Victoria Sanders',
    email: 'victoria.sanders@relife.local',
    image: 'https://randomuser.me/api/portraits/women/63.jpg',
    specializations: ['addiction', 'anxiety', 'depression'],
    experience: 12,
    qualifications: 'PhD Psychology',
    sessionFee: 45,
    bio: 'Helps clients manage emotions linked to addiction using evidence-based psychotherapy, emotional regulation strategies, and relapse prevention.',
    days: [2, 3, 4, 5, 6],
    startHour: 9,
    endHour: 16,
  },
  {
    name: 'Andrew Lawson',
    email: 'andrew.lawson@relife.local',
    image: 'https://randomuser.me/api/portraits/men/15.jpg',
    specializations: ['behavioral_addiction', 'social_media_addiction'],
    experience: 7,
    qualifications: 'MSc Psychology',
    sessionFee: 30,
    bio: 'Specializes in modern digital addictions including gaming and social media, helping clients restore healthy habits and attention control.',
    days: [0, 1, 2, 3, 4, 5, 6],
    startHour: 9,
    endHour: 19,
  },
  {
    name: 'Chloe Whitaker',
    email: 'chloe.whitaker@relife.local',
    image: 'https://randomuser.me/api/portraits/women/16.jpg',
    specializations: ['addiction', 'stress_management'],
    experience: 8,
    qualifications: 'Certified Mindfulness Therapist',
    sessionFee: 35,
    bio: 'Uses meditation techniques for recovery support, helping clients reduce cravings and improve emotional stability through mindful routines.',
    days: [1, 2, 3, 4, 5],
    startHour: 8,
    endHour: 14,
  },
  {
    name: 'Benjamin Clarke',
    email: 'benjamin.clarke@relife.local',
    image: 'https://randomuser.me/api/portraits/men/73.jpg',
    specializations: ['relapse_prevention', 'addiction'],
    experience: 15,
    qualifications: 'Licensed Addiction Counselor',
    sessionFee: 50,
    bio: 'Helps clients maintain sobriety over the long term through sustainability planning, support systems, and maintenance-oriented counseling.',
    days: [1, 2, 3, 4],
    startHour: 10,
    endHour: 19,
  },
  {
    name: 'Sarah Collins',
    email: 'sarah.collins@relife.local',
    image: 'https://randomuser.me/api/portraits/women/31.jpg',
    specializations: ['family_therapy', 'addiction'],
    experience: 10,
    qualifications: 'MA Counseling',
    sessionFee: 35,
    bio: 'Works with families affected by addiction, improving communication and collaborative recovery planning across household relationships.',
    days: [2, 3, 4, 5, 6],
    startHour: 9,
    endHour: 17,
  },
  {
    name: 'Jonathan Reeves',
    email: 'jonathan.reeves@relife.local',
    image: 'https://randomuser.me/api/portraits/men/11.jpg',
    specializations: ['crisis_intervention', 'addiction', 'trauma'].filter(
      (s) => s !== 'crisis_intervention'
    ),
    experience: 13,
    qualifications: 'PhD Clinical Psychology',
    sessionFee: 45,
    bio: 'Provides immediate support during critical situations and stabilizes clients with rapid intervention plans before ongoing recovery treatment.',
    days: [0, 1, 2, 3, 4, 5, 6],
    startHour: 0,
    endHour: 24,
  },
];

function generateSlots(days: number[], startHour: number, endHour: number) {
  const slots: { start: Date; end: Date; isBooked: boolean }[] = [];
  const now = new Date();

  for (let i = 0; i < 21; i += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);

    if (!days.includes(day.getDay())) {
      continue;
    }

    for (let hour = startHour; hour < endHour; hour += 1) {
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(start);
      end.setHours(hour + 1, 0, 0, 0);

      if (start > now) {
        slots.push({ start, end, isBooked: false });
      }
    }
  }

  return slots;
}

async function seed() {
  try {
    console.log('Starting counselor seed...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (let i = 0; i < counselors.length; i += 1) {
      const data = counselors[i];

      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create({
          name: data.name,
          email: data.email,
          image: data.image,
          role: 'counselor',
          emailVerified: true,
        });
      } else {
        user.name = data.name;
        user.image = data.image;
        user.role = 'counselor';
        user.emailVerified = true;
        await user.save();
      }

      const licenseCode = `LPC-${String(2000 + i).padStart(6, '0')}`;
      const slots = generateSlots(data.days, data.startHour, data.endHour);

      await Counselor.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          credentials: {
            degree: data.qualifications,
            license: licenseCode,
            yearsOfExperience: data.experience,
            certifications: ['Certified Counselor'],
          },
          specializations: data.specializations,
          bio: data.bio,
          hourlyRate: data.sessionFee,
          rating: 4.7,
          ratingCount: 20 + i,
          profileImage: data.image,
          isVerified: true,
          isActive: true,
          availableSlots: slots,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`Seeded counselor: ${data.name} (${slots.length} slots)`);
    }

    console.log(`Seed complete. Total counselors seeded: ${counselors.length}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seed();
