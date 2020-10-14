/* globals localStorage, navigator, confirm */

import React from 'react';
import * as Nominatim from 'nominatim-browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faLocationArrow } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../assets/logo.svg';

const DEFAULT_ZIP = '67202';
const DEFAULT_LOCATION_NAME = 'Wichita';
const UNITS = { IMPERIAL: 'IMPERIAL', METRIC: 'METRIC', FREEDOM_UNITS: 'IMPERIAL' };

const logger = console;

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zip: localStorage.getItem('zip') || DEFAULT_ZIP,
      locationName: localStorage.getItem('locationName') || DEFAULT_LOCATION_NAME,
      units: localStorage.getItem('units') || UNITS.IMPERIAL,
      useGeo: navigator.geolocation && (localStorage.getItem('useGeo') === 'true' || false),
    };

    this.updateLocation = this.updateLocation.bind(this);
    this.handleZipChange = this.handleZipChange.bind(this);
    this.handleZipSubmit = this.handleZipSubmit.bind(this);
    this.handleUnitsChange = this.handleUnitsChange.bind(this);
    this.getAutoGeoLocation = this.getAutoGeoLocation.bind(this);
    this.toggleGeo = this.toggleGeo.bind(this);
    this.setNomData = this.setNomData.bind(this);
    this.geo = navigator.geolocation;
  }

  componentDidMount() {
    this.updateLocation();
  }

  /**
   * Update location data from NominatimResonse
   * @param {NominatimResponse} result nominatim query response
   */
  setNomData(result) {
    const { setLatLon } = this.props;

    localStorage.setItem('zip', result.address.postcode);
    const locName = result.address.city;
    localStorage.setItem('locationName', locName);

    this.setState({ locationName: locName });
    setLatLon(result.lat, result.lon);
  }

  getAutoGeoLocation() {
    this.geo.getCurrentPosition(
      ({ coords }) => {
        localStorage.setItem('coords', `${coords.latitude},${coords.longitude}`);
        Nominatim.reverseGeocode({
          lat: coords.latitude,
          lon: coords.longitude,
          addressdetails: true,
        })
          .then(this.setNomData)
          .catch(logger.error);
      },
      () => {
        this.setState({ useGeo: false });
      }
    );
  }

  async updateLocation() {
    // TODO This supports a more generic search string
    // Also, should handle multiple results and no results
    const { zip, useGeo } = this.state;

    if (useGeo && this.geo) {
      const storedCoords = (localStorage.getItem('coords') || '').split(',');
      if (storedCoords.length >= 2) {
        Nominatim.reverseGeocode({
          lat: storedCoords[0],
          lon: storedCoords[1],
          addressdetails: true,
        })
          .then(this.setNomData)
          .catch(logger.error);
      }
    } else {
      // prevent misleading info due to non-existant browser apiwq
      this.setState({ useGeo: false });
      Nominatim.geocode({
        addressdetails: true,
        postalcode: zip,
      }).then((results) => {
        this.setNomData(results[0], zip);
      });
    }
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

  toggleGeo() {
    const { useGeo } = this.state;
    this.setState({ useGeo: !useGeo });
    localStorage.setItem('useGeo', useGeo ? 'false' : 'true');
    this.updateLocation();
    if (!useGeo) {
      this.getAutoGeoLocation();
    }
  }

  render() {
    const { locationName, zip, units, useGeo } = this.state;

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
              <InputGroup.Prepend>
                <Button
                  variant="outline-secondary"
                  active={useGeo}
                  disabled={!navigator.geolocation}
                  onClick={this.toggleGeo}
                >
                  <FontAwesomeIcon icon={faLocationArrow} />
                </Button>
              </InputGroup.Prepend>
              <FormControl
                disabled={useGeo}
                placeholder={zip === DEFAULT_ZIP ? 'ZIP Code' : zip}
                aria-label="ZIP Code"
                aria-describedby="basic-addon2"
                type="number"
                onChange={this.handleZipChange}
              />
              <InputGroup.Append>
                <Button variant="outline-secondary" type="submit" disabled={useGeo}>
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
