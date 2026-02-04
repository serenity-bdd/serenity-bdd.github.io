// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;
const path = require('path')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Serenity BDD User Manual',
  tagline: 'Automated Acceptance Testing With Style',
  url: 'https://serenity-bdd.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  trailingSlash: false,
  organizationName: 'serenity-bdd', // Usually your GitHub org/user name.
  projectName: 'documentation', // Usually your repo name.

  // Internationalization configuration
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en-US',
      },
      es: {
        label: 'Español',
        htmlLang: 'es-CO',
      },
    },
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/serenity-bdd/serenity-bdd.github.io/blob/master'
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://johnfergusonsmart.com/blog',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Home',
        logo: {
          alt: 'Serenity BDD Logo',
          src: 'img/serenity-bdd-small.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'tutorials/first_test',
            position: 'left',
            label: 'Tutorials',
          },
          {
            type: 'doc',
            docId: 'guide/user_guide_intro',
            position: 'left',
            label: 'User Manual',
          },
          {to: 'blog', label: 'Blog', position: 'left'},
          {
            href: 'https://www.serenitydojo.academy/serenity-bdd-support-packages',
            label: 'Get Support',
            position: 'right',
          },
        {type: 'dropdown',
         label: 'Learn Serenity BDD',
         position: 'right',
           items: [
            {
              href: 'https://expansion.serenity-dojo.com/courses/testing-web-applications-with-serenity-bdd',
              label: 'Serenity BDD Online Training'
            },
            {
              href: 'https://expansion.serenity-dojo.com/courses/testing-web-applications-with-serenity-bdd',
              label: 'BDD and Requirements Discovery Training'
            },
            {
              href: 'https://www.serenity-dojo.com/',
              label: 'BDD And Test Automation Coaching'
            },
             ]
          },
          {
            type: 'localeDropdown',
            position: 'right',
            dropdownItemsAfter: [
              {
                type: 'html',
                value: '<hr style="margin: 0.3rem 0;">',
              },
              {
                href: 'https://github.com/serenity-bdd/serenity-bdd.github.io/issues/69',
                label: '🌐 Help translate',
              },
            ],
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: 'docs/tutorials/first_test',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Gitter',
                href: 'https://gitter.im/serenity-bdd/serenity-core',
              },
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/serenity-bdd',
              }
            ],
          },
          {
            title: 'Learn Serenity BDD',
            items: [
              {
                label: 'The Serenity Dojo Training Library',
                href: 'http://expansion.serenity-dojo.com',
              },
              {
                label: 'Personalised Serenity BDD Coaching',
                href: 'https://www.serenity-dojo.com',
              }
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/serenity-bdd/serenity-core',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Serenity Dojo Ltd.`,
      },
      prism: {
        additionalLanguages: ['java', 'scala'],
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'V10PILA8X2',
  
        // Public API key: it is safe to commit it
        apiKey: '722dc898d5026266faadec59963be60a',
  
        indexName: 'serenity-bdd',
  
        // Optional: see doc section below
        contextualSearch: true,
  
        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.com|domain\\.com',
  
        // Optional: Algolia search parameters
        searchParameters: {},
  
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
  
        //... other Algolia params
      },
    }),

  plugins: [
    [
      path.resolve(__dirname, 'plugin/dynamic-routes'),
      { // this is the options object passed to the plugin
        routes: [
          { // using Route schema from react-router
            path: '/theserenitybook/latest',
            exact: false, // this is needed for sub-routes to match!
            component: "/src/components/LegacyLink404"
          }
        ]
      }
    ],
  ],
};
module.exports = config;
