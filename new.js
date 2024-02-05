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

// Initialize Firebase


// Get a reference to the database service


// Get a reference to the database service
const database = firebase.database();

const bookList = document.getElementById('book-list');

// Function to render book items
function renderBook(bookId, book) {
  const bookItem = document.createElement('div');
  bookItem.classList.add('book-item');
  bookItem.setAttribute('data-id', bookId);
  bookItem.innerHTML = `
    <h2>${book.title}</h2>
    <p>Author: ${book.author}</p>
    <p>Year: ${book.year}</p>
    ${book.imageUrl ? `<img src="${book.imageUrl}" alt="${book.title}" />` : ''}
    <button class="delete-btn">Delete</button>
  `;
  bookList.appendChild(bookItem);

  // Attach event listener to delete button
  const deleteBtn = bookItem.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    database.ref('books/' + bookId).remove();
  });
}

// Fetch books from Firebase and display them
// Fetch books from Firebase and display them
database.ref('books').on('value', (snapshot) => {
  const bookList = document.getElementById('book-list');
  bookList.innerHTML = '';

  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const bookId = childSnapshot.key;
      const book = childSnapshot.val();
      renderBook(bookId, book);
    });
  } else {
    bookList.innerHTML = '<p>No books found.</p>';
  }
});
