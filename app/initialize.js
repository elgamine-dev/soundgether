import ReactDOM from 'react-dom';
import React from 'react';
const  App = require('components/App').App;

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.querySelector('#app'));
});
