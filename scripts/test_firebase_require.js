try {
    const firebase = require('firebase/app');
    console.log('Firebase app required successfully');
    const firestore = require('firebase/firestore');
    console.log('Firebase firestore required successfully');
} catch (error) {
    console.error('Error requiring firebase:', error.message);
}
