/* globals localStorage */

import React from 'react';
import * as Nominatim from 'nominatim-browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../assets/logo.svg';

const DEFAULT_ZIP = '67202';
const DEFAULT_LOCATION_NAME = 'Wichita';
const UNITS = { IMPERIAL: 'IMPERIAL', METRIC: 'METRIC', FREEDOM_UNITS: 'IMPERIAL' };

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zip: localStorage.getItem('zip') || DEFAULT_ZIP,
      locationName: localStorage.getItem('locationName') || DEFAULT_LOCATION_NAME,
      units: localStorage.getItem('units') || UNITS.IMPERIAL,
    };

    this.updateLocation = this.updateLocation.bind(this);
    this.handleZipChange = this.handleZipChange.bind(this);
    this.handleZipSubmit = this.handleZipSubmit.bind(this);
    this.handleUnitsChange = this.handleUnitsChange.bind(this);
  }

  componentDidMount() {
    this.updateLocation();
  }

  updateLocation() {
    // TODO This supports a more generic search string
    // Also, should handle multiple results and no results
    const { zip } = this.state;
    const { setLatLon } = this.props;

    Nominatim.geocode({
      addressdetails: true,
      postalcode: zip,
    }).then((results) => {
      localStorage.setItem('zip', zip);
      const locName = results[0].address.city;
      localStorage.setItem('locationName', locName);

      this.setState({ locationName: locName });
      setLatLon(results[0].lat, results[0].lon);
    });
  }

  handleZipChange(event) {
    this.setState({ zip: event.target.value });
  }

  handleZipSubmit(event) {
    this.updateLocation();
    event.preventDefault();
    event.target.reset();
  }

  handleUnitsChange(event) {
    const units = event.target.checked ? UNITS.METRIC : UNITS.IMPERIAL;
    const { setUnits } = this.props;
    setUnits(units);
    this.setState({ units });
  }

  render() {
    const { locationName, zip, units } = this.state;

    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#home">
          <img src={logo} width="30" height="30" className="d-inline-block align-top" alt="React Bootstrap logo" />
        </Navbar.Brand>
        <Navbar.Brand href="#home" className="py-0">
          Libre Weather
        </Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Navbar.Text id="locationName" className="py-0">
            {locationName}
          </Navbar.Text>
          <Form onSubmit={this.handleZipSubmit}>
            <InputGroup>
              <FormControl
                placeholder={zip === DEFAULT_ZIP ? 'ZIP Code' : zip}
                aria-label="ZIP Code"
                aria-describedby="basic-addon2"
                type="number"
                onChange={this.handleZipChange}
              />
              <InputGroup.Append>
                <Button variant="outline-secondary" type="submit">
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Form>
          <Navbar.Text className="py-0">˚F</Navbar.Text>
          <Form>
            <Form.Switch id="custom-switch" label="" onChange={this.handleUnitsChange} checked={units === 'METRIC'} />
          </Form>
          <Navbar.Text className="py-0">˚C</Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

module.exports = NavigationBar;
