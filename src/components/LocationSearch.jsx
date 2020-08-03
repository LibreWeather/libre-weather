import React from 'react';
import * as Nominatim from "nominatim-browser";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class LocationSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {zip: '67042'};
    this.updateLocation();
  }

  updateLocation = () => {
    // TODO This supports a more generic search string
    // Also, should handle multiple results and no results
    Nominatim.geocode({
      postalcode: this.state.zip
    })
    .then((results) => this.props.updateWeather(results[0].lat, results[0].lon));
  };

  handleChange = (event) => {
    this.setState({zip: event.target.value});
  };

  handleSubmit = (event) => {
    this.updateLocation();
    event.preventDefault();
  };

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <InputGroup className="mb-4">
          <FormControl placeholder="ZIP Code" aria-label="ZIP Code" aria-describedby="basic-addon2" type="number" onChange={this.handleChange} value={this.state.zip}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" type="submit"><FontAwesomeIcon icon={faSearch}/></Button>
          </InputGroup.Append>
        </InputGroup>
      </Form>
    );
  }
}

module.exports = LocationSearch;