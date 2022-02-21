import { client } from '../db.js';

const user = client.db('test').collection('user');

user.createIndex({ 'email.address': 1 });

function setEmailVerified(email, verifiedVal) {
  user.updateOne(
    { 'email.address': email },
    { $set: { 'email.verified': verifiedVal } }
  );
}

export { user, setEmailVerified };
