import React, { Component } from 'react';
import './App.css';

class MovieSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchInput: '',
      searchResults: [],
      selectedMovieDetails: null,
      trailerUrl: null, // Added to state for trailer URL
      suggestionsData: null,
      error: null,
    };
  }

  resetStateAndBackground = () => {
    // Reset state and background styles
    this.setState({
      searchResults: [],
      selectedMovieDetails: null,
      suggestionsData: null,
    });

    document.body.style.background = 'rgb(36, 36, 36)';
    document.body.style.backgroundSize = 'initial';
    document.body.style.backgroundPosition = 'initial';
    document.body.style.backdropFilter = 'none';
  };

  searchMovies = async () => {
    const { searchInput } = this.state;

    try {
      // Check if the search input is not empty
      if (searchInput.trim() !== '') {
        this.setState({ selectedMovieDetails: null, suggestionsData: null });
        // Reset the background styles
        document.body.style.background = 'rgb(36, 36, 36)';
        document.body.style.backgroundSize = 'initial';
        document.body.style.backgroundPosition = 'initial';
        document.body.style.backdropFilter = 'none';

        const apiUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(searchInput)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Check if the request was successful and movies array is defined
        if (data.status === 'ok' && data.data.movies) {
          const movies = data.data.movies;

          // Update state with search results
          this.setState({ searchResults: movies, error: null });
        } else {
          // Update state with an error message if the request was not successful or movies array is undefined
          this.setState({ searchResults: [], error: 'No results found.' });
        }
      } else {
        // Update state with a message if the search input is empty
        this.setState({ searchResults: [], error: 'Please enter a movie title to search.' });
      }
    } catch (error) {
      // Update state with an error message if an exception occurs
      this.setState({ searchResults: [], error: 'An error occurred while fetching search results.' });
      console.error('Error fetching search results:', error);
    }
  };

  handleInputChange = (event) => {
    this.setState({ searchInput: event.target.value });
  };

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.searchMovies();
    }
  };

  showMovieDetails = async (movieId) => {
    try {
      const apiUrl = `https://yts.mx/api/v2/movie_details.json?movie_id=${movieId}&with_images=true&with_cast=true`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status === 'ok' && data.data.movie) {
        const selectedMovieDetails = data.data.movie;

        // Fetch movie suggestions for the selected movie
        const suggestionsUrl = `https://yts.mx/api/v2/movie_suggestions.json?movie_id=${movieId}`;
        const suggestionsResponse = await fetch(suggestionsUrl);
        const suggestionsData = await suggestionsResponse.json();

        // Fetch YouTube trailer
        const trailerUrl = await this.searchYouTubeTrailer(selectedMovieDetails.title, selectedMovieDetails.year);

        // Update state with selected movie details and trailer URL
        this.setState({ selectedMovieDetails, trailerUrl, suggestionsData, error: null });

        // Set the background image of the body
        const backgroundImageUrl = selectedMovieDetails.background_image;
        document.body.style.backgroundImage = `url('${backgroundImageUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'top';
        document.body.style.backdropFilter = 'blur(10px)';

      } else {
        // Update state with an error message if the request was not successful or movie details are undefined
        this.setState({ selectedMovieDetails: null, suggestionsData: null, error: 'Error fetching movie details.' });
      }
    } catch (error) {
      // Update state with an error message if an exception occurs
      this.setState({ selectedMovieDetails: null, suggestionsData: null, error: 'An error occurred while fetching details and suggestions.' });
      console.error('Error fetching details and suggestions:', error);
    }
  };

  searchYouTubeTrailer = async (movieTitle, movieYear) => {
    try {
      const apiKey = 'AIzaSyD0H4D2zM3QfR0qGiia6s_ZdnaLPF0TunA';
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(`${movieTitle} ${movieYear} official trailer`)}&type=video&key=${apiKey}`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        return `https://www.youtube.com/embed/${videoId}`;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error searching YouTube trailer:', error);
      return null;
    }
  }

  render() {
    const { searchResults, selectedMovieDetails, suggestionsData, error, trailerUrl } = this.state;
    const showSearchResults = searchResults.length > 0 || error;

    return (
      <div>
        <header>
          <img
            id="ytsLogo"
            className="logo"
            src="/img/Logo-YTS.svg"
            alt="YTS Logo"
            onClick={this.resetStateAndBackground}
          />
          <input
            type="text"
            id="searchInput"
            placeholder="Enter movie title"
            onChange={this.handleInputChange}
            onKeyPress={this.handleKeyPress}
          />
        </header>

        {showSearchResults && !selectedMovieDetails && (
          <div id="searchResults" className="visible">
            {error ? (
              <p>{error}</p>
            ) : (
              <div>
                <h2 style={{ color: '#4CAF50', textAlign: 'center' }}>YTS Movies</h2>
                <section>
                  {searchResults.map((movie) => (
                    <div id="searchResults-list" key={movie.id} onClick={() => this.showMovieDetails(movie.id)}>
                      <img src={movie.medium_cover_image} alt={movie.title} />
                      {`${movie.title} (${movie.year})`}
                    </div>
                  ))}
                </section>
              </div>
            )}
          </div>
        )}

        {/* Render movie details when a movie is selected */}
        {selectedMovieDetails && suggestionsData && (
          <div id="custom-section" >
            <div class="movie-details-container">
              <div id="movie-poster">
                <img src={selectedMovieDetails.medium_cover_image} alt={selectedMovieDetails.title} />
              </div>
              <div id="details">
                <h1>{selectedMovieDetails.title}</h1>
                <h2>{selectedMovieDetails.year}</h2>
                <h2>{selectedMovieDetails.genres.join('/ ')}</h2>
                <h2>{selectedMovieDetails.mpa_rating}</h2>
                <h2><span class="imdb-logo">IMDb</span> {selectedMovieDetails.rating}</h2>
                <h2>{selectedMovieDetails.runtime} minutes</h2>
              </div>
            </div>

            {/* Display movie cast */}
            <div class="cast-container">
              <h3>Main Cast:</h3>
              {selectedMovieDetails.cast && selectedMovieDetails.cast.length > 0 ? (
                selectedMovieDetails.cast.map(actor => (
                  <div class="cast-item" key={actor.id}>
                    <div class="cast-image-container">
                      <img src={actor.url_small_image || '/img/noprofile.jpg'} alt={actor.name} class="cast-image" />
                    </div>
                    <div class="cast-name">{actor.name}</div>
                  </div>
                ))
              ) : (
                <div class="cast-item">
                  <h4>No Cast Data Available </h4>
                </div>
              )}
            </div>

            {/* Display movie recommendations */}
            <div class="recommendation">
              <h3 style={{ borderRadius: '10px', backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '15px' }}>Similar Movies:</h3>
              {suggestionsData.data.movies.map(suggestion => (
                <div class="recommendation-item" key={suggestion.id} onClick={() => this.showMovieDetails(suggestion.id)}>
                  <img class="recommendation-image" src={suggestion.medium_cover_image} alt={suggestion.title} />
                </div>
              ))}
            </div>

            {/* Display plot, screenshots, download links, and YouTube trailer */}
            <div className="plot-container">
              <h3>Download Links:</h3>
              <button className="button" onClick={() => window.location.href = selectedMovieDetails.torrents[1].url}>
                <a style={{ color: 'inherit', textDecoration: 'none' }} className="button-content" target="_blank" rel="noopener noreferrer">Link 1</a>
              </button>
              <button className="button" onClick={() => window.location.href = selectedMovieDetails.torrents[0].url}>
                <a style={{ color: 'inherit', textDecoration: 'none' }} className="button-content" target="_blank" rel="noopener noreferrer">Link 2</a>
              </button>

              <h3>Plot:</h3>
              <p style={{ textAlign: 'left' }}>{selectedMovieDetails.description_full}</p>

              {/* Display screenshots */}
              <div className="screenshots">
                {selectedMovieDetails.large_screenshot_image1 && (
                  <a href={selectedMovieDetails.large_screenshot_image1} target="_blank" rel="noopener noreferrer">
                    <img src={selectedMovieDetails.medium_screenshot_image1} alt="Screenshot 1" />
                  </a>
                )}
                {selectedMovieDetails.large_screenshot_image2 && (
                  <a href={selectedMovieDetails.large_screenshot_image2} target="_blank" rel="noopener noreferrer">
                    <img src={selectedMovieDetails.medium_screenshot_image2} alt="Screenshot 2" />
                  </a>
                )}
                {selectedMovieDetails.large_screenshot_image3 && (
                  <a href={selectedMovieDetails.large_screenshot_image3} target="_blank" rel="noopener noreferrer">
                    <img src={selectedMovieDetails.medium_screenshot_image3} alt="Screenshot 3" />
                  </a>
                )}
              </div>

              {/* Display YouTube trailer */}
              {trailerUrl ? (
                <div className="youtube-trailer">
                  <iframe width="560" height="315" src={trailerUrl} title="YouTube Trailer" frameBorder="0" allowFullScreen></iframe>
                </div>
              ) : (
                <p>Trailer not found [YouTube API Queries per day limitation is reached].</p>
              )}
            </div>

          </div>
        )}

        {/* Conditionally render the home section based on the state */}
        {!showSearchResults && (
          <div id="home" className="visible">
            <img
              style={{ height: '500px', width: 'auto' }}
              src="/img/movies.png"
              alt="Movies"
            />
            <h1>Search & Download Movies</h1>
          </div>
        )}
      </div>
    );
  }
}

export default MovieSearch;