import React, { Component } from 'react';
import './../../css/Show.css';
import { show, randomShow } from './../../api/phishin';
import Ionicon from 'react-ionicons';
import ReactTable from 'react-table';

export default class Show extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: null
    }
  }

  fetchShow = (id) => {
    show(id).then(show => {
      if (show) {
        this.setState({
          show: show
        })
      }
    });
  }

  fetchRandomShow = () => {
    randomShow().then(show => {
      this.setState({
        show: show
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id === 'random') {
      this.fetchRandomShow();
    }
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.fetchShow(nextProps.match.params.id);
    }
  }

  componentWillMount() {
    console.log(this.props);
    if (this.props.match.params.id === 'random') {
      this.fetchRandomShow();
    } else {
      this.fetchShow(this.props.match.params.id);
    }
  }

  renderTracks = (set) => {
    let show = this.state.show;
    let tracks = show.tracks;
    let emitter = this.props.emitter;
    
    return tracks.filter(track => {
      return track.set_name === set;
    }).map(track => {
      console.log(track);
      return (
        <li 
          className="playlist-container-item" 
          key={track.src}
          // onClick={() => {
          //   this.setPlaylistPosition(track.position - 1);
          // }}
        >
          <Ionicon 
            style={{cursor: 'pointer'}}
            icon="ios-play"
            font-size="60px"
            onClick={() => {
              emitter.emit('playlistUpdate', show.id, track.position - 1)
            }}
          />
          <span> {track.position} - </span>
          <span>{track.title}</span>
        </li>
      );
    });
  }

  renderTrackContainer = () => {
    const sets = [...new Set(this.state.show.tracks.map(track => track.set_name))];
    return sets.map(set => {
      return (
        <div>
          <p> {set} </p>
          <ul className="playlist-section"> {this.renderTracks(set)} </ul>
        </div>
      )
    });
  }

  render() {
    if (!this.state.show) {
      return (
        <div>
          Loading ...
        </div>
      )
    }

    let show = this.state.show;
    let tracks = show.tracks;

    console.log(show);

    return (
      <div className="show-container">
        <div className="show-overview">
          <img 
            className="art"
            alt={show.date} src={process.env.PUBLIC_URL + '/art/' + show.date + '.jpg'}
          />
          <div className="show-details">
            <p> {show.date} </p>
            <p> {show.venue.name} </p>
            <p> {show.venue.location} </p>

            <p> {show.date} </p>
            <p> {show.tags} </p>
            <p> {show.remastered ? "Remastered" : null} </p>
            <p> {show.sbd ? "Soundboard" : null} </p>
            <p> Tour : {show.tour} (we can fetch this tour and show information about the tour, possibly using a component) this will link to the tour page with all the shows from that tour</p>
            
          </div>
        </div>
        <div className="show-tracks">
          {this.renderTrackContainer()}
        </div>
      </div>
    );
  }
}