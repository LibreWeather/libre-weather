import React from 'react';

import { Container, Row } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMugHot, faCode } from '@fortawesome/free-solid-svg-icons';
import packages from '../assets/packages.json';

class Pack extends React.Component {
  render() {
    const { pack } = this.props;
    const bit = `${pack.name} : ${pack.license}`;
    return (
      <Row key="{pack.name}" className="row-center">
        <h6>{bit}</h6>
      </Row>
    );
  }
}

export default class LicensesView extends React.Component {
  render() {
    const packs = Array.from(new Set(packages)).map((pack) => <Pack pack={pack} key={`${pack.name}${pack.license}`} />);
    return (
      <header className="header">
        <div>
          <h2>
            Built with &nbsp;
            <FontAwesomeIcon icon={faMugHot} />
            &nbsp;&&nbsp;
            <FontAwesomeIcon icon={faCode} />
          </h2>
          <br />
          <Container fluid="sm" className="constrained hide-scroll">
            {packs}
          </Container>
        </div>
      </header>
    );
  }
}
