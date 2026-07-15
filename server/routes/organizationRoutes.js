import express from 'express';
import {
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  uploadOrganizationLogo,
} from '../controllers/organizationController.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', getOrganization);
router.post('/', uploadSingle, createOrganization);
router.put('/', uploadSingle, updateOrganization);
router.delete('/', deleteOrganization);
router.post('/logo', uploadSingle, uploadOrganizationLogo);

export default router;