import React from 'react';

import packages from '../assets/packages.json';

class Pack extends React.Component {
  render() {
    const pack = this.props.pack;
    return (
      <div>
        <h3>{pack.name}</h3>
      </div>
    )
  }
}

export default class LicensesView extends React.Component {
  render() {
    const packs = Object.keys(packages).map(packageId => (<Pack pack={packages[packageId]} />));
    return (
      <header className="header">
        {packs}
      </header>
    );
  }
}