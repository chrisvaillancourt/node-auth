import { createHash } from 'crypto';

const {
  env: { ROOT_DOMAIN, JWT_SIGNATURE },
} = process;

function createVerifyEmailToken(email) {
  const authString = `${JWT_SIGNATURE}: ${email}`;
  return createHash('sha256').update(authString).digest('hex');
}

function createVerifyEmailLink(email) {
  const emailToken = createVerifyEmailToken(email);
  const uriEncodedEmail = encodeURIComponent(email);
  return `https://${ROOT_DOMAIN}/verify/${uriEncodedEmail}/${emailToken}`;
}

export { createVerifyEmailLink };
