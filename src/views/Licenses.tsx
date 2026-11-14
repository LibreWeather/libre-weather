import React from 'react';

import { faMugHot, faCode } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';
import { pageClass } from '@/common/layout';
import type { PackageLicense } from '@/models/licenses';
import { FONT_NOTICES, OFL_TEXT } from '../assets/fontLicenses';
import packages from '../assets/packages.json';

const listClass =
  'mx-auto mt-12 w-full px-3 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] ' +
  'xl:max-w-[1140px] 2xl:max-w-[1320px]';

const Licenses = () => (
  <header className={pageClass}>
    <h2 className="mb-2 text-[calc(1.325rem_+_0.9vw)] xl:text-[2rem]">
      Built with &nbsp;
      <Icon icon={faMugHot} />
      &nbsp;&&nbsp;
      <Icon icon={faCode} />
    </h2>
    <section className={listClass}>
      <h3 className="mb-2 text-xl">Fonts</h3>
      <p className="mb-4 text-sm">
        These typefaces stay under the SIL Open Font License 1.1.
      </p>
      <ul>
        {FONT_NOTICES.map((font) => (
          <li key={font.family} className="mb-3">
            <h6 className="mb-1 text-base">{font.family}</h6>
            <p className="text-sm">{font.copyright}</p>
          </li>
        ))}
      </ul>
      <details className="mt-4 text-left">
        <summary className="cursor-pointer text-sm">SIL Open Font License 1.1</summary>
        <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs">{OFL_TEXT}</pre>
      </details>
    </section>
    <ul className={listClass}>
      {(packages as PackageLicense[]).map((pack) => (
        <li key={`${pack.name}${pack.license}`}>
          <h6 className="mb-2 text-base">{`${pack.name} : ${pack.license}`}</h6>
        </li>
      ))}
    </ul>
  </header>
);

export default Licenses;
