import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faOsi } from '@fortawesome/free-brands-svg-icons';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';

import { DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { geocode, reverseGeocode } from '../utilities/nominatim';
import Logo from './Logo';

import './NavigationBar.less';

const DEFAULT_ZIP = '64106';
const DEFAULT_LOCATION_NAME = 'Kansas City';
const UNITS = { IMPERIAL: 'IMPERIAL', METRIC: 'METRIC', FREEDOM_UNITS: 'IMPERIAL' };

const logger = console;

const locNameTree = (/** @type {import('../utilities/nominatim').NominatimAddress} */ address) => {
  const { village, town, city, county, postcode, country } = address;
  const wrap = (thing) => (thing ? `${thing}, ${country}` : undefined);

  return wrap(village) || wrap(town) || wrap(city) || wrap(county) || postcode;
};

export default class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zip: localStorage.getItem('zip') || DEFAULT_ZIP,
      locationName: localStorage.getItem('locationName') || DEFAULT_LOCATION_NAME,
      units: localStorage.getItem('units') || UNITS.IMPERIAL,
      useGeo: navigator.geolocation && (localStorage.getItem('useGeo') === 'true' || false),
      locOptions: [],
      enteredZip: undefined,
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
   * Update location data from NominatimResponse
   * @param {import('../utilities/nominatim').NominatimResponse} result nominatim query response
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
    this.setState({ locationName: locName, zip: postcode, locOptions: [] });

    setLatLon(result.lat, result.lon);
  }

  handleZipChange(event) {
    this.setState({ zip: event.target.value, enteredZip: event.target.value });
  }

  updateLocationFromZip() {
    const { zip } = this.state;
    geocode({
      addressdetails: true,
      postalcode: zip,
    })
      .then((results) => {
        if (results.length > 1) {
          this.setState({
            locOptions: results,
          });
        } else {
          this.setNomData(results[0]);
          this.setState({
            enteredZip: undefined,
            locOptions: [],
          });
        }
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
          reverseGeocode({
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
    const { useGeo } = this.state;

    if (useGeo) {
      this.setState({ useGeo: false });
      localStorage.setItem('useGeo', 'false');
      this.updateLocationFromZip();
    } else {
      this.setState({ useGeo: true });
      localStorage.setItem('useGeo', 'true');
      this.updateLocationFromGeo();
    }
  }

  handleUnitsChange(event) {
    const units = event.target.checked ? UNITS.METRIC : UNITS.IMPERIAL;
    const { setUnits } = this.props;
    setUnits(units);
    this.setState({ units });
  }

  render() {
    const { locationName, zip, units, useGeo, locOptions, enteredZip } = this.state;

    return (
      <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="app-navbar">
        <div className="app-brand">
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 py-0">
            <Logo width="30" height="30" className="d-inline-block" alt="Libre Weather" />
            <span>Libre Weather</span>
          </Navbar.Brand>
          <Nav className="app-brand-links flex-row">
            <Nav.Link as={Link} to="/licenses" aria-label="Licenses">
              <FontAwesomeIcon icon={faOsi} />
            </Nav.Link>
            <Nav.Link
              aria-label="GitHub"
              href="https://github.com/LibreWeather/libre-weather"
              rel="noreferrer"
              target="_blank">
              <FontAwesomeIcon icon={faGithub} />
            </Nav.Link>
          </Nav>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <div className="app-settings">
            <Form className="app-settings-location" onSubmit={this.handleZipSubmit}>
              <InputGroup>
                <Button
                  variant="outline-secondary"
                  disabled={!navigator.geolocation}
                  onClick={this.handleGeoSubmit}
                  active={useGeo}>
                  <FontAwesomeIcon icon={faLocationArrow} />
                </Button>
                {locOptions.length ? (
                  <DropdownButton
                    variant="outline-secondary"
                    title=""
                    id="location-options"
                    show={!!enteredZip}>
                    {locOptions.map((/** @type {import('../utilities/nominatim').NominatimResponse} */ option) => {
                      const locName = locNameTree(option.address);
                      return (
                        <Dropdown.Item
                          variant="outline-secondary"
                          href="#"
                          key={`location-option--${locName}`}
                          onClick={() => {
                            this.setNomData(option);
                            this.setState({ enteredZip: undefined });
                          }}>
                          {locName}
                        </Dropdown.Item>
                      );
                    })}
                  </DropdownButton>
                ) : null}
                <InputGroup.Text id="locationName" className="app-settings-place">
                  {locationName}
                </InputGroup.Text>
                <Form.Control
                  placeholder={zip === DEFAULT_ZIP ? 'ZIP Code' : zip}
                  aria-label="ZIP Code"
                  aria-describedby="locationName"
                  type="number"
                  onChange={this.handleZipChange} />
                <Button variant="outline-secondary" type="submit">
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup>
            </Form>
            <div className="app-settings-units">
              <span>˚F</span>
              <Form.Switch
                id="custom-switch"
                className="app-units-switch"
                label=""
                onChange={this.handleUnitsChange}
                checked={units === 'METRIC'} />
              <span>˚C</span>
            </div>
          </div>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
