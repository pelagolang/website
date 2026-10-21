import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/pelago-horizontal.svg" alt={appName} height={26} className="block h-[26px] w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/pelago-horizontal-dark.svg" alt="" height={26} className="hidden h-[26px] w-auto dark:block" />
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
