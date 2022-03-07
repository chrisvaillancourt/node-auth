import bcrypt from 'bcryptjs';
const { compare } = bcrypt;

export async function authorizeUser(email, password) {
  const { user } = await import('../user/user.js');
  const {
    password: savedPassword,
    _id: userId,
    authenticator: authenticatorSecret,
  } = await user.findOne({
    'email.address': email,
  });
  // TODO confirm behavior if looking up non-existent user
  const isAuthorized = await compare(password, savedPassword);
  return { isAuthorized, userId, authenticatorSecret };
}
