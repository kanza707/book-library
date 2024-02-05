// Initialize Firebase
const firebaseConfig = {
 apiKey: "AIzaSyANARmixV3niCn5jdwkz7o_EmdpRnaRYe8",
    authDomain: "library-e944e.firebaseapp.com",
    databaseURL: "https://library-e944e-default-rtdb.firebaseio.com",
    projectId: "library-e944e",
    storageBucket: "library-e944e.appspot.com",
    messagingSenderId: "68313934044",
    appId: "1:68313934044:web:edf56cb099ebeee7746c19"
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