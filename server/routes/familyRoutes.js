import express from 'express';
import {
  getFamilyTree,
  getAncestors,
  getDescendants,
  getRelationships,
  addRelationship,
  updateRelationship,
  deleteRelationship,
} from '../controllers/familyController.js';
import { validate, relationshipValidation } from '../middlewares/validation.js';

const router = express.Router();

router.get('/tree', getFamilyTree);
router.get('/:memberId/ancestors', getAncestors);
router.get('/:memberId/descendants', getDescendants);
router.get('/:memberId/relationships', getRelationships);
router.post('/relationships', validate(relationshipValidation), addRelationship);
router.put('/relationships/:id', updateRelationship);
router.delete('/relationships/:id', deleteRelationship);

export default router;