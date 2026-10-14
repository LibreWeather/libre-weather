import React from 'react';

import { faMugHot, faCode } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';
import { pageClass } from '@/common/layout';
import type { PackageLicense } from '@/models/licenses';
import packages from '../assets/packages.json';

const Licenses = () => (
  <header className={pageClass}>
    <h2 className="mb-2 text-[calc(1.325rem_+_0.9vw)] xl:text-[2rem]">
      Built with &nbsp;
      <Icon icon={faMugHot} />
      &nbsp;&&nbsp;
      <Icon icon={faCode} />
    </h2>
    <ul
      className={
        'mx-auto mt-12 w-full px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] ' +
        'xl:max-w-[1140px] 2xl:max-w-[1320px]'
      }>
      {(packages as PackageLicense[]).map((pack) => (
        <li key={`${pack.name}${pack.license}`}>
          <h6 className="mb-2 text-base">{`${pack.name} : ${pack.license}`}</h6>
        </li>
      ))}
    </ul>
  </header>
);

export default Licenses;
