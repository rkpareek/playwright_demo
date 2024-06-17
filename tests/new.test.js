const { chromium } = require('playwright');
const CDP = require('chrome-remote-interface');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://example.com/webauthn'); // replace with your WebAuthn-enabled site
  await page.waitForSelector('body');

  // Connect to Chrome DevTools Protocol
  const client = await CDP({ target: page.context().pages()[0]._target._targetId });

  // Enable the WebAuthn domain
  const { WebAuthn } = client;
  await WebAuthn.enable();

  // Add a virtual authenticator
  const { authenticatorId } = await WebAuthn.addVirtualAuthenticator({
    protocol: 'ctap2',
    transport: 'usb',
    hasResidentKey: false,
    hasUserVerification: false,
    isUserVerified: false
  });

  // Create a credential
  const credentialId = Buffer.from('credential-id').toString('base64');
  await WebAuthn.addCredential({
    authenticatorId,
    credentialId,
    isResidentCredential: false,
    privateKey: 'base64-encoded-private-key',
    signCount: 0,
    rpId: 'example.com',
    userHandle: Buffer.from('user-handle').toString('base64')
  });

  // Perform WebAuthn operations on the page
  await page.click('#webauthn-login-button');

  // Cleanup
  await WebAuthn.removeVirtualAuthenticator({ authenticatorId });

  // Close the browser
  await browser.close();
})();
