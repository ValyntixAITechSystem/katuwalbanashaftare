import Organization from '../models/Organization.js';
import cloudinary from '../config/cloudinary.js';
import { io } from '../server.js';

export const getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findOne();
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrganization = async (req, res) => {
  try {
    const existing = await Organization.findOne();
    if (existing) {
      return res.status(400).json({ message: 'Organization already exists' });
    }

    const organization = new Organization({
      ...req.body,
      logo: req.file?.path || null,
      createdBy: req.user?._id || null,
    });

    await organization.save();
    io.emit('organization:updated', organization);
    res.status(201).json(organization);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Organization name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findOne();
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Delete old logo if new one uploaded
    if (req.file && organization.logo) {
      const publicId = organization.logo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const updatedOrg = await Organization.findByIdAndUpdate(
      organization._id,
      {
        ...req.body,
        logo: req.file?.path || organization.logo,
        updatedBy: req.user?._id || null,
      },
      { new: true, runValidators: true }
    );

    io.emit('organization:updated', updatedOrg);
    res.json(updatedOrg);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Organization name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findOne();
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Delete logo from Cloudinary
    if (organization.logo) {
      const publicId = organization.logo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Organization.deleteOne({ _id: organization._id });
    io.emit('organization:deleted', { id: organization._id });
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadOrganizationLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const organization = await Organization.findOne();
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Delete old logo
    if (organization.logo) {
      const publicId = organization.logo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    organization.logo = req.file.path;
    await organization.save();

    io.emit('organization:updated', organization);
    res.json({ logo: req.file.path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};