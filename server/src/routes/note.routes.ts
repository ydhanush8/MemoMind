import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate, validateObjectId } from '../middlewares/validation.middleware.js';
import { validateCreateNote, validateUpdateNote } from '../validators/note.validator.js';
import * as controller from '../controllers/note.controller.js';

const router = Router();

router.get('/', requireAuth, controller.list);
router.post('/', requireAuth, validate(validateCreateNote), controller.create);

// :id routes validate the ObjectId before auth — matching the original 400-first order.
router.get('/:id', validateObjectId(), requireAuth, controller.getById);
router.put('/:id', validateObjectId(), requireAuth, validate(validateUpdateNote), controller.update);
router.patch('/:id', validateObjectId(), requireAuth, controller.review);
router.delete('/:id', validateObjectId(), requireAuth, controller.remove);

export default router;
