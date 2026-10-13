import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faSearch, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faOsi } from '@fortawesome/free-brands-svg-icons';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';

import { DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Logo from '@components/Logo';
import NavSummary from '@components/NavSummary';
import PreferencesPanel from '@components/Preferences';
import useDialogParam from '../../hooks/useDialogParam';
import { usePlace } from '../../providers/PlaceProvider';
import { placeLabel } from '../../utilities/nominatim';

import './NavigationBar.less';

const PHONE_QUERY = '(max-width: 767px)';

const NavigationBar = () => {
  const { zip, locationName, useGeo, geoAvailable, options, searchZip, toggleGeo, chooseLocation } = usePlace();
  const zipInput = React.useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = React.useState(false);
  const prefs = useDialogParam('prefs');
  const gearButton = React.useRef<HTMLButtonElement>(null);
  const [prefsAnchor, setPrefsAnchor] = React.useState<DOMRect | null>(null);

  React.useLayoutEffect(() => {
    if (prefs.value === null) return;
    const phone = window.matchMedia?.(PHONE_QUERY).matches;
    setPrefsAnchor(phone ? null : gearButton.current?.getBoundingClientRect() ?? null);
  }, [prefs.value]);

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

      <NavSummary />

      <button
        type="button"
        ref={gearButton}
        className="app-prefs-button"
        aria-label="Preferences"
        aria-haspopup="dialog"
        aria-expanded={prefs.value !== null}
        onClick={() => prefs.open()}>
        <FontAwesomeIcon icon={faGear} />
      </button>

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
        </div>
      </Navbar.Collapse>

      {prefs.value !== null ? <PreferencesPanel anchor={prefsAnchor} onClose={prefs.close} /> : null}
    </Navbar>
  );
};

export default NavigationBar;
