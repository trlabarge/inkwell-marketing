/*
 * Inkwell marketing site: Google tag bootstrap.
 *
 * Loads one gtag.js for both destinations:
 *   GA4  G-B12PYMCSJZ    (Inkwell Marketing Website)
 *   Ads  AW-18428669176  (conversion tracking)
 *
 * Deliberately fires NO conversion event. Signup happens on
 * app.inkwell.world, and the app fires the conversion at the real signup
 * moment. A page-load event snippet here would report a conversion for
 * every visitor who reads a page and leaves. Do not add one.
 *
 * Loaded from every page's <head>. Keep the IDs in this file only.
 */
(function () {
  'use strict';

  var GA4_ID = 'G-B12PYMCSJZ';
  var ADS_ID = 'AW-18428669176';

  // Shared with the app's tag config. Both sides must list both domains.
  var LINKER_DOMAINS = ['inkwell.world', 'app.inkwell.world'];

  // Production only, so localhost and Vercel preview deploys stay out of
  // campaign data.
  var PROD_HOSTS = ['inkwell.world', 'www.inkwell.world'];

  // Define gtag on every host, including non-production ones, so any later
  // call is a harmless dataLayer push instead of a ReferenceError.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  if (PROD_HOSTS.indexOf(window.location.hostname) === -1) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
  document.head.appendChild(s);

  gtag('js', new Date());

  // Applies to both configs below. Decorates outbound links (and forms, if
  // any are ever added) to app.inkwell.world with the _gl parameter, and
  // accepts _gl on traffic coming back the other way.
  gtag('set', 'linker', {
    domains: LINKER_DOMAINS,
    decorate_forms: true,
    accept_incoming: true
  });

  gtag('config', GA4_ID);
  gtag('config', ADS_ID);
})();
