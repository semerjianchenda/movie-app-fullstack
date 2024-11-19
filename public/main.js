var trash = document.getElementsByClassName("fa-trash-o");
var edit = document.getElementsByClassName("fa-pencil");

document.getElementById('searchForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  
  const title = document.getElementById('movieTitle').value;

  const response = await fetch(`/search?title=${encodeURIComponent(title)}`);
  const movies = await response.json();
  
 
  const resultsDiv = document.getElementById('movieResults');
  resultsDiv.innerHTML = ''; 

  if (movies.length === 0) {
    resultsDiv.innerHTML = '<p>No movies found</p>';
    return;
  }

  movies.forEach(movie => {
    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie');

    movieDiv.innerHTML = `
      <h3>${movie.title}</h3>
      <img src="${movie.image}" alt="${movie.title}" style="width: 200px; height: 300px;">
      <p>Rating: ${movie.rating}</p>
    `;

    resultsDiv.appendChild(movieDiv);
  });
});

Array.from(edit).forEach(function (element) { //array.from(edit) holds a collection of dom elements icon or button
  element.addEventListener('click', function () {
    const oldItem = this.getAttribute('data-movie'); // Get current item name
    const newItem = prompt('Edit your movie:', oldItem); // Ask user for new value
    if (newItem && newItem !== oldItem) {
      fetch('/movies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldItem: oldItem, // Send old item
          newItem: newItem, // Send updated item
        }),
      }).then(function (response) {
        if (response.ok) {
          window.location.reload(); // Reload page on success
        } else {
          console.error('Failed to edit');
        }
      });
    }
  });
});

Array.from(trash).forEach(function (element) {
  element.addEventListener('click', function () {
    const movie = this.getAttribute('data-movie'); // Get the movie name from the data-movie attribute
    
    fetch('/movies', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        movie: movie,  // Pass the movie name to the backend
      }),
    }).then(function (response) {
      if (response.ok) {
        window.location.reload();  // Reload the page after successful delete
      } else {
        console.error('Failed to delete movie');
      }
    });
  });
});
