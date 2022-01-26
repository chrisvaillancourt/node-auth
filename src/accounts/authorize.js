import bcrypt from "bcryptjs";
const { compare } = bcrypt;

export async function authorizeUser(email, password) {
  const { user } = await import("../user/user.js");
  const { password: savedPassword } = await user.findOne({
    "email.address": email,
  });
  const isAuthorized = await compare(password, savedPassword);
  return isAuthorized;
}
