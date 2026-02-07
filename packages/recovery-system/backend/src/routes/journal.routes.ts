import { Router } from 'express';
import { createEntry, getEntries, getEntryById, updateEntry, deleteEntry } from '../controllers/journal.controller';
import upload from '../services/upload.service';
import { isAuth } from '../middleware/isAuth'; 

const router = Router();

router.post('/journals', isAuth, upload.single('image'), createEntry);
router.get('/journals', isAuth, getEntries);
router.get('/journals/:id', isAuth, getEntryById);
router.patch('/journals/:id', isAuth, upload.single('image'), updateEntry); // Image upload for updates
router.delete('/journals/:id', isAuth, deleteEntry);

export default router;