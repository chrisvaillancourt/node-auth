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

/**
 *
 * @param {string} token
 * @param {string} email
 * verify user email in the db.
 */
function validateVerifyEmail(token, email) {
  // create a hash/token
  const emailToken = createVerifyEmailToken(email);
  const isValid = emailToken === token;

  if (isValid) {
    // TODO refactor connection so we don't need to use a dynamic import
    import('../user/user.js').then(({ setEmailVerified }) => {
      setEmailVerified(email, true);
    });
    return true;
  }
  return false;
}

export { createVerifyEmailLink, validateVerifyEmail };
