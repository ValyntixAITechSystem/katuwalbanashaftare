import { body, param, query, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  };
};

export const memberValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('relation')
    .optional()
    .isIn(['member', 'spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other'])
    .withMessage('Invalid relation'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Invalid phone number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

export const relationshipValidation = [
  body('memberId')
    .isMongoId()
    .withMessage('Invalid member ID'),
  body('relatedMemberId')
    .isMongoId()
    .withMessage('Invalid related member ID')
    .custom((value, { req }) => {
      if (value === req.body.memberId) {
        throw new Error('Cannot relate a member to themselves');
      }
      return true;
    }),
  body('relationshipType')
    .isIn(['spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'aunt_uncle', 'cousin', 'other'])
    .withMessage('Invalid relationship type'),
];

export const donationValidation = [
  body('donor')
    .isMongoId()
    .withMessage('Invalid donor ID'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('purpose')
    .optional()
    .isIn(['general', 'education', 'medical', 'emergency', 'event', 'other'])
    .withMessage('Invalid purpose'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];