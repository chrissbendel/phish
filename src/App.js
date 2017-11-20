import React, { Component } from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import Header from './components/Header/Header'
import Player from './components/Footer/Player'

import './css/Main.css';

export default class App extends Component {
  render() {
    return (
      <Router>
        <div id="outer-container" className="app">
          <Sidebar />
          <div id="page-wrap" className="container">
            <header className="header">
              <Header />
            </header>
            <main className="content">
              <Route path="/main/:year" component={Main}/>
              <Redirect from="/" to="/main/all"/>
            </main>
            <footer className="player">
              <Player /> 
            </footer>
          </div>
        </div>
      </Router>
    );
  }
}
