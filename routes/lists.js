import express from 'express';
import {
    createListNormal,
    createListWithCSV,
    deleteAllListAndUsers,
    sendMailToAllUsers,
    unsubscribe,
    // sendtest
} from '../controllers/ListsController.js';
import upload from '../middleware/multer.js';


const router = express.Router();

// create a normal list with title and properties
router.post('/create-list', createListNormal)
// create a list with csv file
router.post('/create-list-csv', upload.single('file'), createListWithCSV)
// send mail to all users in the list
router.post('/send-mail-all-users', sendMailToAllUsers)
// unsubscribe a user from the list
router.get('/unsubscribe', unsubscribe)
// deletes all users and db so that you can make a new list
// not recommended to use in production
// i used this to immediately delete all users and list 
router.delete('/delete-all',deleteAllListAndUsers)  
 







export default router;