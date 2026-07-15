import express from 'express';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  searchMembers,
} from '../controllers/memberController.js';
import { validate, memberValidation } from '../middlewares/validation.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', getMembers);
router.get('/search', searchMembers);
router.get('/:id', getMemberById);
router.post('/', uploadSingle, validate(memberValidation), createMember);
router.put('/:id', uploadSingle, validate(memberValidation), updateMember);
router.delete('/:id', deleteMember);

export default router;