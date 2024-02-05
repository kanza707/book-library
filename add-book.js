// Initialize Firebase
const firebaseConfig = {
 apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
// Initialize Firebase


// Get a reference to the database service
// Initialize Firebase

// Get a reference to the database service
const database = firebase.database();

const addBookForm = document.getElementById('add-book-form');

addBookForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = addBookForm.title.value;
  const author = addBookForm.author.value;
  const year = addBookForm.year.value;
  const imageUrl = addBookForm['image-url'].value || 'default.jpg';

  // Push data to the Firebase Realtime Database
  database.ref('books').push({
    title: title,
    author: author,
    year: year,
    imageUrl: imageUrl
  }).then(() => {
    // Book added successfully, show a success message
    alert('Your book has been successfully added!');
    addBookForm.reset();
  }).catch((error) => {
    console.error('Error adding book: ', error);
    alert('An error occurred while adding the book. Please try again later.');
  });
  });
