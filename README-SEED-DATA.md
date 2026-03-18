# Employee Data Seeding Script

This script will add sample data for the employee user with ID `699d7dc6d1af32919a8c29fc`.

## What the script adds:

### User Information
- **Name**: Jean Dupont
- **Email**: jean.dupont@tcc.com
- **Role**: employee
- **Department**: Développement
- **Job Title**: Développeur Frontend Senior
- **Location**: Paris, France
- **Phone**: +33612345678
- **Address**: 123 Rue de la République, 75001 Paris
- **Contract**: CDI
- **Hire Date**: 2020-03-15
- **Leave Balance**: 25 total days, 10.5 used days

### Tasks (5 items)
1. **Signer avenant contrat** - Échéance : 24 Octobre
2. **Entretien annuel 2024** - Prévu le : 12 Novembre
3. **Module Sécurité IT** - Formation obligatoire
4. **Mise à jour profil** - Actualiser compétences
5. **Validation des frais de déplacement** - Notes de frais mission

### Leave Requests (3 approved)
1. **Vacances de fin d'année** - 20/12/2024 to 31/12/2024 (CP)
2. **RTT accumulation** - 15/11/2024 (RTT)
3. **Congé maladie** - 05/10/2024 to 06/10/2024 (Maladie)

### Notifications (4 items)
1. Nouvelle demande de congé approuvée (unread)
2. Rappel : Entretien annuel (unread)
3. Document disponible - Fiche de paie (read)
4. Nouveau message du manager (unread)

## How to run:

### Prerequisites:
1. MongoDB must be running on localhost:27017
2. The database name should be "Starter" (as configured in .env)

### To start MongoDB (if not running):
```bash
# If using MongoDB locally
mongod

# Or if using MongoDB Compass/Community
# Start the MongoDB service
```

### To run the seed script:
```bash
# From the backend directory
node scripts/seed-employee-data.js
```

### Expected output:
```
Connected to MongoDB
User data updated
Created 5 tasks
Created 3 leave requests
Created 4 notifications
Employee data seeded successfully!
User ID: 699d7dc6d1af32919a8c29fc
Email: jean.dupont@tcc.com
Name: Jean Dupont
Disconnected from MongoDB
```

## After running:
The employee home screen will display:
- Real user name and job title
- Actual leave balance (14.5 days remaining)
- Dynamic task list from database
- Real notification count
- Company news from backend

The mobile app will now show live data instead of static mock data!
