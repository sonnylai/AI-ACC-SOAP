const soap = require("strong-soap").soap;

async function createSession() {
  return new Promise((resolve, reject) => {
    soap.createClient(process.env.ACC_WSDL, {}, (err, client) => {
      if (err) return reject(err);

      client.Logon(
        {
          user: process.env.ACC_USER,
          password: process.env.ACC_PASSWORD
        },
        (err, res) => {
          if (err) return reject(err);

          client.addHttpHeader("Cookie", res.sessionToken);
          resolve(client);
        }
      );
    });
  });
}

module.exports = createSession;
