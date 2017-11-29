import React, { Component } from 'react';
import { shows, showsForYear, showsForVenue, showsForTour, showsToday, show, testFunc } from './../../api/phishin';
import {yearFilters, tourFilters, venueFilters, sortByOptions, showJamcharts} from './../../filterOptions';
import ReactDOM from 'react-dom';
import './../../css/Shows.css';
import Ionicon from 'react-ionicons';
import Filter from './Filter';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const isJamchart = (id) => {
  return (showJamcharts.indexOf(id) != -1);
}

//TODO create default empty state if no shows found
export default class Shows extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      shows: null,
      allShows: true,
      filterOption: '',
      page: 1,
      loadingShows: false,
      currentFilter: 'All Shows'
    }
  }
  
  componentWillMount = () => {

    let type = this.props.match.params.type;
    let id = this.props.match.params.id;
    this.loadRelevantData(type, id);
  }

  componentWillReceiveProps(nextProps) {
    let nextType = nextProps.match.params.type;
    let nextId = nextProps.match.params.id;
    this.loadRelevantData(nextType, nextId);
  }

  loadRelevantData = (type = null, id = null) => {
    if (!type) {
      this.fetchAllShows();
    }

    switch(type) {
      case "year": 
        this.fetchShowsForYear(id);
        break;
      case "today":
        this.fetchShowsToday();
        break;
      case "venue":
        this.fetchShowsForVenue(id);
        break;
      case "tour":
        this.fetchShowsForTour(id);
        break;
    }
  }

  renderShows = (shows) => {
    return shows.map(function (show, index) {
      let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      let date = new Date(show.date + ' 00:00');
      return (
        <div key={show.id} className="image-container">
          <div className="show-information-control">
            <div className="show-tags">
              {show.sbd ? <div style={{backgroundColor: 'blue'}} className="tag">Soundboard</div> : null}
              {show.remastered ? <div style={{backgroundColor: 'red'}} className="tag">Remastered</div> : null}
              {isJamchart(show.id) ? <div style={{backgroundColor: 'green'}} className="tag">Jamcharts</div> : null}
            </div>
            <img 
              src={process.env.PUBLIC_URL + '/art/' + show.date + '.jpg'}
              alt={show.id}
              id={show.id}
            />
            <div className="show-information">
              <div className="center-abs">
                <div className="play-button" onClick={() => this.props.emitter.emit('playlistUpdate', show.id)}>
                  <Ionicon 
                    icon="ios-play" 
                    fontSize="35px" 
                    color="white"
                    className="left-10"
                  />
                </div>
                <div className="show-likes">
                  <Ionicon 
                    icon="ios-thumbs-up" 
                    fontSize="18px" 
                    onClick={() => console.log('like clicked')}
                    color="white"
                  />
                  <span className="likes-num"> 
                    {show.likes_count} 
                  </span>
                </div>
              </div>
            </div>
          </div>
          <span 
            onClick={() => {
              this.props.history.push('/show/' + show.id)}
            }
            className="show-date"
          >
            {date.toLocaleDateString('en-US', dateOptions)}
          </span>
          <span className="show-venue"
            
          >
            {show.venue ? 
              <span onClick={() => {
                this.props.history.push('/shows/venue/' + show.venue.id)
              }}>{show.venue.name} {show.venue.location}</span>
              :
              <span onClick={() => {
                this.props.history.push('/shows/venue/' + show.venue_id)
              }}> {show.venue_name} {show.location}  </span>
            }
            
            </span>

          {show.remastered ? <p> Remastered: yes </p> : null}
        </div>
      );
    }, this);
  }

  fetchShowsToday = () => {
    let today = new Date();
    let day = today.getDate().toString();
    let month = (today.getMonth() + 1).toString();
    let date = month + "-" + day;
    showsToday(date).then(shows => {
      this.setState({
        shows: shows,
        allShows: false
      })
    })
  }

  fetchShowsForTour = (tour) => {
    showsForTour(tour).then(shows => {
      this.setState({
        shows: shows,
        allShows: false
      })
    })
  }

  fetchShowsForVenue = (venue) => {
    showsForVenue(venue).then(showIds => {
      let promises = [];
      showIds.forEach(id => {
        promises.push(show(id).then(showInfo => {
          return showInfo;
        }));
      });

      Promise.all(promises).then(shows => {
        this.setState({
          shows: shows,
          allShows: false
        })
      })
    })
  }

  fetchShowsForYear = (year) => {
    showsForYear(year).then(shows => {
      this.setState({
        shows: shows,
        allShows: false
      })
    })
  }

  sortShows = (attr, order) => {
    let sorted;
    let shows = this.state.shows;
    if (attr === 'date') {
      sorted = shows.sort((a, b) => {
        var c = new Date(a.date);
        var d = new Date(b.date);
        if (order === 'asc') {
          return c-d;
        } else if (order === 'desc') {
          return d-c;
        }
      });
    }

    if (attr == 'jamcharts') {
      sorted = shows.filter(show => {
        return isJamchart(show.id);
      })
    }

    if (attr === 'likes_count') {
      sorted = shows.sort((a, b) => {
        return parseFloat(b.likes_count) - parseFloat(a.likes_count);
      });
    }

    this.setState({
      shows: sorted
    })
  }

  fetchAllShows = () => {
    shows().then(shows => {
      this.setState({
        shows: shows,
        allShows: true,
        page: 1,
        currentFilter: "All Shows"
      })
    })
  }

  handleChange = (filterOption) => {
    this.sortShows(filterOption.attr, filterOption.order);
    this.setState({ filterOption: filterOption });
  }

  loadMoreShows = () => {
    this.setState({
      loadingShows: true
    })
    let page = this.state.page + 1;
    
    shows(page).then(shows => {
      console.log(shows);
      this.setState(previousState => ({
        loadingShows: false,
        page: page,
        shows: [...previousState.shows, ...shows]
      }));
    });
  }

  setCurrentFilter = (title) => {
    this.setState({currentFilter: title});
  }

  render() {
    let shows = this.state.shows;
    
    if (!shows) {
      return (<div> Loading ... </div>);
    }

    return (
      <div>
        <div className="filters">
          
          <Ionicon
            className="clickable"
            icon="ios-arrow-dropup-circle" 
            fontSize="40px"
            onClick={() => {
              //animate this one day
              this.refs.shows.scrollTop = 0;
            }}
          />
          <div className="filter-display">
            Displaying: {this.state.currentFilter}
          </div>
          <Filter
            history={this.props.history}
            setTitle={this.setCurrentFilter.bind(this)}
            name={"Years"}
            path={"/shows/year/"}
            placeholder={"Years"}
            options={yearFilters}
          />
          <Filter 
            history={this.props.history}
            setTitle={this.setCurrentFilter.bind(this)}
            name={"Tours"}
            path={"/shows/tour/"}
            placeholder={"Tours"}
            options={tourFilters}
          />
          <Filter 
            history={this.props.history}
            setTitle={this.setCurrentFilter.bind(this)}
            name={"Venues"}
            path={"/shows/venue/"}
            placeholder={"Venues"}
            options={venueFilters}
          />

          <div className="search-filter">
            <Select
              name={"Sort by"}
              placeholder={"Sort by"}
              value={this.state.value}
              onChange={this.handleChange.bind(this)}
              options={sortByOptions}
            />
          </div>

          <div className="load-more" onClick={() => {
                  this.fetchAllShows();
                }}
              >
              Remove Filters
          </div>
        </div>
        <div className="shows-container" ref="shows">
          <div className="show-gallery">
            {this.renderShows(shows)}
          </div>
          {this.state.allShows ?
            <div>
              <Ionicon className={this.state.loadingShows ? "" : "hidden"} icon="ios-refresh" fontSize="80px" rotate={true} />
              <div className={this.state.loadingShows ? "hidden" : "load-more"} onClick={() => {
                  this.loadMoreShows();
                }}
              >
                Load more shows
              </div>
            </div>
            :
            null
            }
        </div>
      </div>
    );
  }
}
