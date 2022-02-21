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
    // TODO move to separate function
    import('../user/user.js').then(({ user }) => {
      user.updateOne(
        { 'email.address': email },
        { $set: { 'email.verified': true } }
      );
    });
    return true;
  }
  return false;
}

export { createVerifyEmailLink, validateVerifyEmail };
