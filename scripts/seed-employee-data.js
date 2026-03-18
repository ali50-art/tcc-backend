const mongoose = require('mongoose');
require('dotenv').config();

// Import compiled models from dist folder
const User = require('../dist/database/mongodb/models/user.model').User;
const Todo = require('../dist/database/mongodb/models/todo.model').Todo;
const Leave = require('../dist/database/mongodb/models/leave.model').Leave;
const Notification = require('../dist/database/mongodb/models/notification.model').Notification;

const EMPLOYEE_ID = '699d7dc6d1af32919a8c29fc';

const sampleTasks = [
  {
    name: 'Signer avenant contrat',
    description: 'Échéance : 24 Octobre - Nécessite votre signature pour la mise à jour du contrat',
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    isConpleted: false,
  },
  {
    name: 'Entretien annuel 2024',
    description: 'Prévu le : 12 Novembre - Préparez vos objectifs et réalisations',
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    isConpleted: false,
  },
  {
    name: 'Module Sécurité IT',
    description: 'Formation obligatoire - À compléter avant fin du mois',
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    isConpleted: false,
  },
  {
    name: 'Mise à jour profil',
    description: 'Actualiser vos compétences et expériences dans le système',
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    isConpleted: false,
  },
  {
    name: 'Validation des frais de déplacement',
    description: 'Soumettre les notes de frais pour la mission client',
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    isConpleted: false,
  },
];

const sampleLeaveRequests = [
  {
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    type: 'cp',
    startDate: new Date('2024-12-20'),
    endDate: new Date('2024-12-31'),
    reason: 'Vacances de fin d\'année',
    status: 'approved',
  },
  {
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    type: 'rtt',
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-11-15'),
    reason: 'RTT accumulation',
    status: 'approved',
  },
  {
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    type: 'maladie',
    startDate: new Date('2024-10-05'),
    endDate: new Date('2024-10-06'),
    reason: 'Congé maladie',
    status: 'approved',
  },
];

const sampleNotifications = [
  {
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    title: 'Nouvelle demande de congé approuvée',
    body: 'Votre demande de congé du 20/12/2024 au 31/12/2024 a été approuvée',
    type: 'leave',
    isRead: false,
  },
  {
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    title: 'Rappel : Entretien annuel',
    body: 'N\'oubliez pas votre entretien annuel prévu le 12 Novembre à 14h',
    type: 'system',
    isRead: false,
  },
  {
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    title: 'Document disponible',
    body: 'Votre fiche de paie de Novembre est disponible dans vos documents',
    type: 'document',
    isRead: true,
  },
  {
    user: new mongoose.Types.ObjectId(EMPLOYEE_ID),
    title: 'Nouveau message',
    body: 'Vous avez reçu un nouveau message de votre manager',
    type: 'message',
    isRead: false,
  },
];

const sampleEmployeeData = {
  _id: new mongoose.Types.ObjectId(EMPLOYEE_ID),
  name: 'Jean Dupont',
  email: 'jean.dupont@tcc.com',
  role: 'employee',
  department: 'Développement',
  currentJob: 'Développeur Frontend Senior',
  city: 'Paris',
  location: 'Paris, France',
  phone: '+33612345678',
  address: '123 Rue de la République, 75001 Paris',
  birthDate: '1990-05-15',
  experience: '5 ans',
  matricule: 'EMP001',
  hireDate: new Date('2020-03-15'),
  contractType: 'CDI',
  avatar: 'https://lesultan-uploads.s3.eu-west-3.amazonaws.com/images-removebg-preview.png',
  totalLeaveDays: 25,
  usedLeaveDays: 10.5,
  isActive: true,
  lastLoginAt: new Date(),
};

async function seedEmployeeData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Starter');
    console.log('Connected to MongoDB');

    // Clear existing data for this user
    await Todo.deleteMany({ user: new mongoose.Types.ObjectId(EMPLOYEE_ID) });
    await Leave.deleteMany({ user: new mongoose.Types.ObjectId(EMPLOYEE_ID) });
    await Notification.deleteMany({ user: new mongoose.Types.ObjectId(EMPLOYEE_ID) });

    // Update or create user
    await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(EMPLOYEE_ID) },
      sampleEmployeeData,
      { upsert: true, new: true }
    );
    console.log('User data updated');

    // Insert sample tasks
    const tasks = await Todo.insertMany(sampleTasks);
    console.log(`Created ${tasks.length} tasks`);

    // Insert sample leave requests
    const leaves = await Leave.insertMany(sampleLeaveRequests);
    console.log(`Created ${leaves.length} leave requests`);

    // Insert sample notifications
    const notifications = await Notification.insertMany(sampleNotifications);
    console.log(`Created ${notifications.length} notifications`);

    console.log('Employee data seeded successfully!');
    console.log(`User ID: ${EMPLOYEE_ID}`);
    console.log(`Email: ${sampleEmployeeData.email}`);
    console.log(`Name: ${sampleEmployeeData.name}`);

  } catch (error) {
    console.error('Error seeding employee data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedEmployeeData();
