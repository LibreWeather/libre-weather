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
import { usePlace } from '../providers/PlaceProvider';
import { useWeather } from '../providers/WeatherProvider';
import { placeLabel } from '../utilities/nominatim';
import { UnitSystem } from '../utilities/weatherTypes';
import Logo from './Logo';

import './NavigationBar.less';

const NavigationBar = () => {
  const { zip, locationName, useGeo, geoAvailable, options, searchZip, toggleGeo, chooseLocation } = usePlace();
  const { units, setUnits } = useWeather();
  const zipInput = React.useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = React.useState(false);

  const handleZipSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = zipInput.current?.value.trim();
    if (query) {
      setShowOptions(true);
      searchZip(query);
    }
    event.currentTarget.reset();
  };

  return (
    <Navbar data-bs-theme="dark" expand="lg" className="app-navbar">
      <div className="app-brand">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 py-0">
          <Logo width="30" height="30" className="d-inline-block" />
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
          <Form className="app-settings-location" onSubmit={handleZipSubmit}>
            <InputGroup>
              <Button
                variant="outline-secondary"
                aria-label="Use my location"
                disabled={!geoAvailable}
                onClick={toggleGeo}
                active={useGeo}>
                <FontAwesomeIcon icon={faLocationArrow} />
              </Button>
              {options.length ? (
                <DropdownButton
                  variant="outline-secondary"
                  title=""
                  id="location-options"
                  show={showOptions}
                  onToggle={setShowOptions}>
                  {options.map((option) => (
                    <Dropdown.Item
                      href="#"
                      key={option.place_id ?? `${option.lat},${option.lon}`}
                      onClick={() => {
                        chooseLocation(option);
                        setShowOptions(false);
                      }}>
                      {placeLabel(option.address)}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              ) : null}
              <InputGroup.Text id="locationName" className="app-settings-place">
                {locationName}
              </InputGroup.Text>
              <Form.Control
                placeholder={zip || 'ZIP Code'}
                aria-label="ZIP Code"
                aria-describedby="locationName"
                ref={zipInput}
                autoComplete="postal-code" />
              <Button variant="outline-secondary" type="submit" aria-label="Search">
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
              onChange={(event) => setUnits(event.target.checked ? UnitSystem.METRIC : UnitSystem.IMPERIAL)}
              checked={units === UnitSystem.METRIC} />
            <span>˚C</span>
          </div>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
