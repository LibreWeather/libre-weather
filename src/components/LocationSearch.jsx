import React from 'react';
import * as Nominatim from 'nominatim-browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Nominatim from 'nominatim-browser';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import PropTypes from 'prop-types';
import React from 'react';

class LocationSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zip: '67042',
      locationName: 'El Dorado',
    };
    this.updateLocation();

    this.updateLocation = this.updateLocation.bind(this);
    this.handleZipChange = this.handleZipChange.bind(this);
    this.handleZipSubmit = this.handleZipSubmit.bind(this);
    this.handleUnitsChange = this.handleUnitsChange.bind(this);
  }

  updateLocation() {
    // TODO This supports a more generic search string
    // Also, should handle multiple results and no results
    const { zip } = this.state;
    const { updateWeather } = this.props;

    Nominatim.geocode({
      addressdetails: true,
      postalcode: zip,
    })
      .then((results) => {
        this.state.locationName = results[0].address.city;
        updateWeather(results[0].lat, results[0].lon);
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
    const units = event.target.checked ? 'METRIC' : 'IMPERIAL';
    const { updateUnits } = this.props;
    updateUnits(units);
  }

  render() {
    const { locationName } = this.state;

    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#home" className="py-0">
          Libre Weather
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto" />
          <Nav.Link id="locationName" className="py-0" disabled>{locationName}</Nav.Link>
          <Form onSubmit={this.handleZipSubmit}>
            <InputGroup>
              <FormControl placeholder="ZIP Code" aria-label="ZIP Code" aria-describedby="basic-addon2" type="number" onChange={this.handleZipChange} />
              <InputGroup.Append>
                <Button variant="outline-secondary" type="submit"><FontAwesomeIcon icon={faSearch} /></Button>
              </InputGroup.Append>
            </InputGroup>
          </Form>
          <Nav.Link className="py-0" disabled>˚F</Nav.Link>
          <Form>
            <Form.Switch
              id="custom-switch"
              label="˚C"
              onChange={this.handleUnitsChange}
            />
          </Form>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
LocationSearch.propTypes = {
  updateWeather: PropTypes.func.isRequired,
  updateUnits: PropTypes.func.isRequired,
};

module.exports = LocationSearch;
