// index.js or App.js

import React from 'react';
import ReactDOM from 'react-dom';
import MovieSearch from './MovieSearch';

const App = () => {
  ReactDOM.render(
    <React.StrictMode>
      <MovieSearch />
    </React.StrictMode>,
    document.getElementById('root') // Change 'root' to the ID of your root HTML element
  );
};

export default App;




