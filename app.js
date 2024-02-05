class Book {
  constructor(book) {

    this.id = book.id;
    this.title = book.title;
    this.author = book.author;
    this.pages = book.pages;
    this.progress = book.progress;
    this.color = book.color || getRandomColor();
  }

  get readStatus() {
    return +((this.progress * 100) / this.pages).toFixed(2);
  }

  /**
   * @param {number} number
   */
  set setProgress(number) {
    this.progress = number;
  }
}


const LIBRARY = (() => {
  let id = 1; // initial id
  const books = [];
  const sortOptions = ['title', 'author', 'recent'];
  let sortMode = 0;


  const updateId = (bookId) => {
    if(bookId) id = Math.max(id, parseInt(bookId.split('-')[1]) + 1);

  }

  const addBook = (book) => {
    const _book = new Book({...book, id: book.id || getNextId()});
    books.push(_book);
    UI_Stuff.addBook(_book);
    FireBase_Stuff.addBook(_book);
  }

  const loadBook = (book) => {
    updateId(book.id);
    const _book = new Book(book);
    books.push(_book);
    UI_Stuff.addBook(_book);
  }

  const removeBook = (e) => {
    const id = e.target.closest('[data-id]').dataset.id;
    const book = getBook(id);
    DomRef.modelEditBook.classList.remove('open');

    if(confirm(`Are you sure, you want to delete "${book.title}" by "${book.author}"?`)){
      document.querySelector(`.card[data-id="${id}"]`).remove();
      books.splice(books.indexOf(book), 1);
      FireBase_Stuff.deleteBook(id);
    }
  }

  const setProgress = (id, progress) => {
    const book = books.find(book => book.id === id);
    book.setProgress = progress;
    UI_Stuff.updateBook(book);
    FireBase_Stuff.addBook(book);
  }

  const getNextId = () => `book-${id++}`;

  // sorts books by title, author, or recent, return SortMode and call to refreshUi
  const sortBooks = () => {
    const _sortMode = sortOptions[sortMode++ % sortOptions.length]; 
    const mode = _sortMode == 'recent' ? 'id' : _sortMode;
    books.sort((a, b) => {
      return a[mode] < b[mode] ? -1 : a[mode] > b[mode] ? 1 : 0;
    });
    UI_Stuff.refreshUi(books);
    return toTitleCase(_sortMode);
  }

  const getBook = (id) => {
    return books.find(book => book.id === id);
  }

  const isEmpty = () => books.length === 0;

  return { isEmpty, addBook, removeBook, setProgress, sortBooks, getBook, getNextId, loadBook };
})();

// Everything related to the UI
const UI_Stuff = (() => {
  // Card Element Template
  const library = document.querySelector('.library');
  const [card, book, title, author, info, p, pIcon, mdi] = createElements(
    'div', 'div', 'h3', 'p', 'div', 'p', 'p', 'span'
  );
  card.className = 'card';
  book.className = 'book';
  title.className = 'title';
  author.className = 'author';
  info.className = 'info';
  p.className = 'progress';
  mdi.className = 'mdi mdi-dots-vertical mdi-rotate-90';

  pIcon.appendChild(mdi);
  info.append(p, pIcon);
  book.append(title, author);
  card.append(book, info);

// Option Element
  const [list, add, edit, read] = createElements('ul', 'li', 'li', 'li');
  add.textContent = 'Add Progress';
  add.addEventListener('click', openAddProgress);

  edit.textContent = 'Edit';
  edit.addEventListener('click', openEditBook);

  read.textContent = 'Mark as Finished';
  read.addEventListener('click', markAsRead);

  list.append(add, edit, read);

  // add a book card to ui
  const addBook = (book) => {

    const _card = card.cloneNode(true);
    _card.setAttribute('data-id', book.id);
    library.appendChild(_card);
    addEvent(_card);
    updateBook(book);
  }

  const refreshUi = (books) => {
    library.innerHTML = '';
    books.forEach(addBook);
  }


  // update a book card in ui
  const updateBook = (book) => {
    const _card = library.querySelector(`[data-id="${book.id}"]`)
    _card.querySelector('.title').textContent = book.title;
    _card.querySelector('.author').textContent = book.author;
    _card.querySelector('.book').style.backgroundColor = book.color;
    setProgress(book.id, book.readStatus);
  }

  function openAddProgress(e){
    const bookId = e.target.closest('[data-id]').getAttribute('data-id');
    const book = LIBRARY.getBook(bookId);
    const inputRange = DomRef.modelAddProgress.querySelector('input[type=range]');
    const display = DomRef.modelAddProgress.querySelector('input[type=text]');
    display.value = `Completed: ${book.progress}/${book.pages} Pages`;
    inputRange.max = book.pages;
    inputRange.value = book.progress;
    DomRef.modelAddProgress.setAttribute('data-id', bookId);
    DomRef.modelAddProgress.querySelector('label').textContent = `Add Progress for ${book.title}`;
    DomRef.modelAddProgress.classList.add('open');
  }

  function openEditBook(e) {
    const bookId = e.target.closest('[data-id]').getAttribute('data-id');
    const book = LIBRARY.getBook(bookId);
    DomRef.modelEditBook.querySelector('input[name=title]').value = book.title;
    DomRef.modelEditBook.querySelector('input[name=author]').value = book.author;
    DomRef.modelEditBook.querySelector('input[name=pages]').value = book.pages;
    DomRef.modelEditBook.querySelector('input[name=completed]').max = book.pages;
    DomRef.modelEditBook.querySelector('input[name=completed]').value = book.progress;
    DomRef.modelEditBook.querySelector('input[name=finished]').checked = book.pages == book.progress;
    DomRef.editBookPreview.style.backgroundColor = book.color;
    DomRef.editTitlePreview.textContent = book.title;
    DomRef.editAuthorPreview.textContent = book.author;
    DomRef.modelEditBook.classList.add('open');
    DomRef.modelEditBook.setAttribute('data-id', bookId);
  }

  function markAsRead(e){
    const bookId = e.target.closest('[data-id]').getAttribute('data-id');
    const book = LIBRARY.getBook(bookId);
    book.setProgress = book.pages;
    LIBRARY.setProgress(bookId, book.pages);
    updateBook(book);
  }

  const liveProgressUpdate = (e) => {
    const bookId = e.target.closest('[data-id]').getAttribute('data-id');
    const book = LIBRARY.getBook(bookId);
    const inputRange = e.target;
    const display = DomRef.modelAddProgress.querySelector('input[type=text]');
    display.value = `Completed: ${inputRange.value}/${book.pages} Pages`;
  }

  // remove a book card from ui
  const removeBook = (id) => {
    const _card = library.querySelector(`[data-id="${id}"]`);
    library.removeChild(_card);
  }

  // set progress of a book
  const setProgress = (id, progress) => {
    const _readStatus = progress === 0 ? 'New' 
      : progress === 100 ? 'Finished' 
      : `${progress}%`;
    const _card = library.querySelector(`[data-id="${id}"]`);
    _card.querySelector('.progress').textContent = _readStatus;
  }

  // show option on cards
  const showOption = (e) => {
    e.target.querySelector('.book').appendChild(list);
  }

  // add event listeners to a book card
  const addEvent = (item) => {
    item.addEventListener('mouseenter', showOption);
    item.addEventListener('mouseleave', (e) => e.target.querySelector('ul').remove());
    item.querySelector('span').addEventListener('click', openEditBook);
  }
  return { addBook, removeBook, setProgress, refreshUi, liveProgressUpdate, updateBook };
})();

// form related stuff
const FORM_Stuff = (() => {
  const addBook = (e) => {
    e.preventDefault();
    const form = e.target;
    if(
      validateInput(form.title) && 
      validateInput(form.author) && 
      validateInput(form.pages)){

      const book = {
        title: form.title.value.toUpperCase(),
        author: toTitleCase(form.author.value),
        pages: parseInt(form.pages.value),
        progress: parseInt(form.completed.value) || 0,
      }

      LIBRARY.addBook(book);
      DomRef.modelAddBook.classList.remove('open');
      form.reset();
  }
}

  const updateBook = (e) => {
    e.preventDefault();
    const bookId = DomRef.modelEditBook.getAttribute('data-id');
    const book = LIBRARY.getBook(bookId);
    const form = e.target;
    book.title = form.title.value;
    book.author = form.author.value;
    book.pages = parseInt(form.pages.value);
    book.progress = parseInt(form.completed.value);

    UI_Stuff.updateBook(book);
    DomRef.modelEditBook.classList.remove('open');
    form.reset();
    FireBase_Stuff.addBook(book);
  }

  const addProgress = (e) => {
    e.preventDefault();
    const form = e.target;
    const progress = parseInt(form.progress.value);
    const bookId = form.closest('[data-id]').getAttribute('data-id');
    LIBRARY.setProgress(bookId, progress);
    DomRef.modelAddProgress.classList.remove('open');
    form.reset();
  }

  const removeBook = () => {}

  const changePages = (e) => {
    const form = e.target.closest('form');
    const pages = e.target.value;
    const completed = form.querySelector('input[name="completed"]');
    if(pages > 0){
      completed.max = pages;
      completed.value = Math.min(completed.value, pages);
    }
    changeProgress(completed);
  }
  const changeProgress = (e) => {
    const form = e.target ? e.target.closest('form') : e.closest('form');
    const completed = e.target ? e.target : e; // tweak for calling manually
    const pages = form.querySelector('input[name="pages"]');
    const finished = form.querySelector('input[name="finished"]');
    if(+completed.value >= +pages.value){
      completed.value = +pages.value;
      finished.checked = true;

    }
    if(completed.value < +pages.value){
      finished.checked = false;
    }

  }
  const changeFinished = (e) => {
    const form = e.target.closest('form');
    const completed = form.querySelector('input[name="completed"]');
    const pages = form.querySelector('input[name="pages"]').value;
    if(e.target.checked){
      completed.value = pages;
    }else{
      completed.value = 0;
    }
  }


  return { addBook, removeBook, changePages, changeProgress, changeFinished, addProgress, updateBook };
})();

// custom validity message
function validateInput(input){
  const type = input.name;

  if(!isValid(input, type)){
    input.setCustomValidity(CUSTOM_VALIDITY_MESSAGES[type].required);
    input.reportValidity();
  } else {
    input.setCustomValidity('');
  }
  return isValid(input, type);
};

// validating input with type
function isValid(input, type){
  if(type === 'title' || type === 'author'){
    return input.value.length > 0;
  }
  if(type === 'pages'){
    return +input.value > 0;
  }
};

// convert string to title case
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// make easy document.create (including bulk create)
function createElements(...elementName) {
  const result = [];
  elementName.forEach((e) => result.push(document.createElement(e)));
  if (result.length == 1) return result[0];
  return result;
};

// getting random number
function getRandomNumber(max = Number, min = 0) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// getting random color
function getRandomColor() {
  return `rgb(${getRandomNumber(255)}, ${getRandomNumber(255)}, ${getRandomNumber(255)})`;
};

const DomRef = (() => {
const modelAddBook = document.querySelector('.add-book-form');
const modelAddProgress = document.querySelector('.add-progress');
const modelEditBook = document.querySelector('.edit-book-form');
const editBookPreview = modelEditBook.querySelector('.book');
const editTitlePreview = modelEditBook.querySelector('.title');
const editAuthorPreview =  modelEditBook.querySelector('.author');


// sort books button event listener
  document.querySelector('#sort-by')
    .addEventListener('click', (e) => {
    e.target.textContent = LIBRARY.sortBooks();
  });

// add listener to validate input on change
  ['title', 'author', 'pages'].forEach(field => {
    const inputs = document.querySelectorAll(`[name='${field}']`);
    inputs.forEach(input =>
      input.addEventListener('input', e => validateInput(e.target))
      );
  })

// getting pages to update progress.max, add or edit book form
document.querySelectorAll('[name="pages"]').forEach(input =>{
  input.addEventListener('input',FORM_Stuff.changePages);
});

// getting progress to update finished, add or edit book form
document.querySelectorAll('[name="completed"]').forEach(input =>{
  input.addEventListener('input',FORM_Stuff.changeProgress);
});

// getting finished to update progress, add or edit book form
document.querySelectorAll('[name="finished"]').forEach(input =>{
  input.addEventListener('change',FORM_Stuff.changeFinished);
});

// submit event Add book form
modelAddBook.querySelector('form')
.addEventListener('submit', FORM_Stuff.addBook);

// open add book form
document.querySelector('#add-book')
  .addEventListener('click', () => modelAddBook.classList.add('open'));

// close add book form
modelAddBook.querySelector('.mdi-close')
  .addEventListener('click', () => modelAddBook.classList.remove('open'));


// submit event Add progress form
modelAddProgress.querySelector('form')
  .addEventListener('submit', FORM_Stuff.addProgress);

// close add progress form
modelAddProgress.querySelector('.mdi-plus')
  .addEventListener('click', () => modelAddProgress.classList.remove('open'));

// update display value on change of progress
modelAddProgress.querySelector('input[type="range"]')
  .addEventListener('input', UI_Stuff.liveProgressUpdate);

// submit event Edit book form
modelEditBook.querySelector('form')
  .addEventListener('submit', FORM_Stuff.updateBook);

// close edit book form
modelEditBook.querySelector('.mdi-close')
  .addEventListener('click', () => modelEditBook.classList.remove('open'));

modelEditBook.querySelector('#edit-title').addEventListener('input', (e) => {
    editTitlePreview.textContent = e.target.value;
});
modelEditBook.querySelector('#edit-author').addEventListener('input', (e) => {
    editAuthorPreview.textContent = e.target.value;
});

modelEditBook.querySelector('#delete-book').addEventListener('click', LIBRARY.removeBook);

    return { modelAddBook, modelAddProgress, modelEditBook, editBookPreview, editTitlePreview, editAuthorPreview };
})();


/**---- Firebase Area ----*/

/// Dom Short-cut
const FireBase_Stuff = (() => {
  let user = null;
  const userEl = document.querySelector ('#user');
  const userAvatar = userEl.querySelector('#user-avatar');
  const userImg = userAvatar.querySelector('img');
  const userNamePlace = userEl.querySelector('#user-name');
  const userName = userNamePlace.querySelector('h2');
  const actionBtnPlace = userEl.querySelector('#user-action');
  const actionBtn = userEl.querySelector('#user-action button');

  const warning = document.querySelector('.book-placeHolder');

  function isLoggedIn(){
    return user !== null;
  }

  // separate method for updating data is not required,
  // since we are already using .set() method
  async function addBook(book) {
    // Add a new message entry to the Firebase database.
    if(isLoggedIn()){
      try {
        await db.collection(`${user.uid}`).doc(book.id).set({...book});
      }
      catch(error) {
        console.error("Error adding book: ", error);
      }
  }}

  function loadBooks() {
    // Create the query to load the last 12 messages and listen for new ones.
    if(isLoggedIn()){

      const books = db.collection(user.uid);

      books.get().then(snapshot => {

        snapshot.docs.forEach(doc => {
          LIBRARY.loadBook(doc.data());
        });
      });
    }
  }


  function deleteBook(id) {
    if(isLoggedIn()){
      db.collection(user.uid).doc(id).delete().then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
          console.error("Error removing document: ", error);
      });
    }
  }

  firebase.auth().onAuthStateChanged((_user) => {
    user = _user || null;
    updateStatus(_user)

  });

  function signIn(){
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
  }

  function signOut() {
    firebase.auth().signOut();
  }

  function updateStatus(_user){
        // sign in status
        userEl.innerHTML = '';
        actionBtnPlace.innerHTML = '';
        document.querySelector('.library').innerHTML = '';
        if(_user){
          // it should be under UI_stuff object
          userImg.src = _user.photoURL;
          userName.textContent = _user.displayName;
          const signOutBtn = actionBtn.cloneNode(true)
          signOutBtn.querySelector('span').className = 'mdi mdi-logout mdi-24px';
          signOutBtn.addEventListener('click', signOut);
          actionBtnPlace.appendChild(signOutBtn);
          userEl.append(userAvatar, userNamePlace)
          warning.setAttribute('hidden', true);
          loadBooks();
        }else{
          warning.removeAttribute('hidden');
          const signInBtn = actionBtn.cloneNode(true)
          signInBtn.querySelector('span').className = 'mdi mdi-login mdi-24px';
          signInBtn.addEventListener('click', signIn);
          actionBtnPlace.appendChild(signInBtn);

        }
        userEl.appendChild(actionBtnPlace);
      }


      return {addBook , isLoggedIn, deleteBook };
})()