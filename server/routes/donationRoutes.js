import express from 'express';
import {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
  getDonationStats,
} from '../controllers/donationController.js';
import { validate, donationValidation } from '../middlewares/validation.js';

const router = express.Router();

router.get('/', getDonations);
router.get('/stats', getDonationStats);
router.get('/:id', getDonationById);
router.post('/', validate(donationValidation), createDonation);
router.put('/:id', validate(donationValidation), updateDonation);
router.delete('/:id', deleteDonation);

export default router;