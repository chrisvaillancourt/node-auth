import bcrypt from "bcryptjs";
const { genSalt, hash } = bcrypt;
async function registerUser(email, password) {
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
}
export { registerUser };
