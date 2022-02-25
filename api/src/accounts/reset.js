import { createHash } from 'crypto';

const {
  env: { ROOT_DOMAIN, JWT_SIGNATURE },
} = process;

function createResetToken(email, expireTimestamp) {
  const authString = `${JWT_SIGNATURE}:${email}:${expireTimestamp}`;
  return createHash('sha256').update(authString).digest('hex');
}

function createResetEmailLink(email) {
  const uriEncodedEmail = encodeURIComponent(email);
  // expire in 24 hours
  // 24 hours * 60 mins in an hour * 60 seconds in an min * 1000 for ms
  const expireTimestamp = Date.now() + 24 * 60 * 60 * 1000;
  const token = createResetToken(email, expireTimestamp);
  return `https://${ROOT_DOMAIN}/reset/${uriEncodedEmail}/${expireTimestamp}/${token}`;
}

async function createResetLink(email) {
  const { user } = await import('../user/user.js');
  const userRecord = await user.findOne({ 'email.address': email });
  return userRecord ? createResetEmailLink(email) : '';
}
function validateExpirationTimestamp(expirationTimestamp) {
  // 24 hours in a day * 60 mins in an hour * 60 seconds in a minute * 1000 ms in a min
  const expirationTime = 24 * 60 * 60 * 1000; // one day in ms
  const timeDiff = Number(expirationTimestamp) - Date.now();
  const isValid = timeDiff > 0 && timeDiff <= expirationTime;
  return isValid;
}
function validateResetEmail(token, email, expirationTimestamp) {
  const resetToken = createResetToken(email, expirationTimestamp);
  const isValidToken = resetToken === token;
  const isValidTimestamp = validateExpirationTimestamp(expirationTimestamp);
  return isValidToken && isValidTimestamp;
}
export { createResetLink, validateResetEmail };
