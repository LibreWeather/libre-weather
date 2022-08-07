import React from 'react';
import * as Nominatim from 'nominatim-browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faLocationArrow } from '@fortawesome/free-solid-svg-icons';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Navbar from 'react-bootstrap/Navbar';

import Logo from './Logo';

const DEFAULT_ZIP = '64106';
const DEFAULT_LOCATION_NAME = 'Kansas City';
const UNITS = { IMPERIAL: 'IMPERIAL', METRIC: 'METRIC', FREEDOM_UNITS: 'IMPERIAL' };

const logger = console;

export default class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zip: localStorage.getItem('zip') || DEFAULT_ZIP,
      locationName: localStorage.getItem('locationName') || DEFAULT_LOCATION_NAME,
      units: localStorage.getItem('units') || UNITS.IMPERIAL,
      useGeo: navigator.geolocation && (localStorage.getItem('useGeo') === 'true' || false),
    };

    this.setNomData = this.setNomData.bind(this);
    this.handleZipChange = this.handleZipChange.bind(this);
    this.updateLocationFromZip = this.updateLocationFromZip.bind(this);
    this.handleZipSubmit = this.handleZipSubmit.bind(this);
    this.updateLocationFromGeo = this.updateLocationFromGeo.bind(this);
    this.handleGeoSubmit = this.handleGeoSubmit.bind(this);
    this.handleUnitsChange = this.handleUnitsChange.bind(this);
  }

  componentDidMount() {
    const { useGeo } = this.state;
    if (useGeo) {
      this.updateLocationFromGeo();
    } else {
      this.updateLocationFromZip();
    }
  }

  /**
   * Update location data from NominatimResonse
   * @param {NominatimResponse} result nominatim query response
   */
  setNomData(result) {
    const { setLatLon } = this.props;

    const { village, town, city, county, postcode } = result.address;
    let locName;
    if (village) {
      locName = village;
    } else if (town) {
      locName = town;
    } else if (city) {
      locName = city;
    } else if (county) {
      locName = county;
    } else if (postcode) {
      locName = postcode;
    }
    localStorage.setItem('locationName', locName);
    localStorage.setItem('zip', postcode);
    this.setState({ locationName: locName, zip: postcode });

    setLatLon(result.lat, result.lon);
  }

  handleZipChange(event) {
    this.setState({ zip: event.target.value });
  }

  updateLocationFromZip() {
    const { zip } = this.state;
    Nominatim.geocode({
      addressdetails: true,
      postalcode: zip,
    })
      .then((results) => {
        this.setNomData(results[0]);
      })
      .catch(logger.error);
  }

  handleZipSubmit(event) {
    this.setState({ useGeo: false });
    localStorage.setItem('useGeo', 'false');

    this.updateLocationFromZip();

    event.preventDefault();
    event.target.reset();
  }

  updateLocationFromGeo() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Called if success
        ({ coords }) => {
          Nominatim.reverseGeocode({
            lat: coords.latitude,
            lon: coords.longitude,
            addressdetails: true,
          })
            .then(this.setNomData)
            .catch(logger.error);
        }
      );
    }
  }

  handleGeoSubmit() {
    this.setState({ useGeo: true });
    localStorage.setItem('useGeo', 'true');
    this.updateLocationFromGeo();
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
        <Navbar.Brand href="/">
          <Logo width="30" height="30" className="d-inline-block align-top" alt="Libre Weather" />
        </Navbar.Brand>
        <Navbar.Brand href="/" className="py-0">
          Libre Weather
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Navbar.Text id="locationName" className="py-0">
            {locationName}
          </Navbar.Text>
          <Form onSubmit={this.handleZipSubmit}>
            <InputGroup>
              <InputGroup.Prepend>
                <Button variant="outline-secondary" disabled={!navigator.geolocation} onClick={this.handleGeoSubmit}>
                  <FontAwesomeIcon icon={faLocationArrow} />
                </Button>
              </InputGroup.Prepend>
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
