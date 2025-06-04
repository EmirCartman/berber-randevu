import mongoose from 'mongoose';
import Appointment from '../models/appointment.model.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateAppointments = async () => {
  try {
    console.log('Starting appointment migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all appointments
    const appointments = await Appointment.find({});
    console.log(`Found ${appointments.length} appointments to migrate`);

    // Update each appointment
    for (const appointment of appointments) {
      if (appointment.services && appointment.services.length > 0) {
        // Check if services need to be migrated
        const needsMigration = appointment.services.some(service => service.service && !service.serviceId);
        
        if (needsMigration) {
          console.log(`Migrating appointment ${appointment._id}`);
          
          // Update services structure
          appointment.services = appointment.services.map(service => ({
            serviceId: service.service || service.serviceId,
            quantity: service.quantity || 1
          }));

          await appointment.save();
          console.log(`Successfully migrated appointment ${appointment._id}`);
        }
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration
migrateAppointments(); 