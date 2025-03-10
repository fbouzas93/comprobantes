import { Router } from 'express';
import { getBills } from '../controllers/BillController';

const router = Router();

router.get('/bills', getBills);

export default router;