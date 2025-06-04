import Service from '../models/service.model.js';
import User from '../models/user.model.js';

// Get all services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().populate('barberId', 'name');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('barberId', 'name');
    if (!service) {
      return res.status(404).json({ message: 'Hizmet bulunamadı' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get barber services
export const getBarberServices = async (req, res) => {
  try {
    const barber = await User.findOne({ _id: req.params.barberId, role: 'barber' });
    if (!barber) {
      return res.status(404).json({ message: 'Berber bulunamadı' });
    }

    const services = await Service.find({ barberId: req.params.barberId });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new service
export const createService = async (req, res) => {
  try {
    const { name, description, duration, price, barberId } = req.body;

    // Check if barber exists
    const barber = await User.findOne({ _id: barberId, role: 'barber' });
    if (!barber) {
      return res.status(404).json({ message: 'Berber bulunamadı' });
    }

    const service = new Service({
      name,
      description,
      duration,
      price,
      barberId
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update service
export const updateService = async (req, res) => {
  try {
    const { name, description, duration, price } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Hizmet bulunamadı' });
    }

    service.name = name || service.name;
    service.description = description || service.description;
    service.duration = duration || service.duration;
    service.price = price || service.price;

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Hizmet bulunamadı' });
    }

    await service.deleteOne();
    res.json({ message: 'Hizmet başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 