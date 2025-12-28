/**
 * Generic SOAP call wrapper
 * client: authenticated strong-soap client
 * method: SOAP method name (Write, Query, Start, etc.)
 * payload: XML or JS object depending on method
 */

async function sendSoap(client, method, payload) {
  return new Promise((resolve, reject) => {
    if (!client[method]) {
      return reject(new Error(`SOAP method ${method} not found`));
    }

    client[method](payload, (err, result) => {
      if (err) {
        console.error("❌ SOAP ERROR:", err.root?.Envelope?.Body || err);
        return reject(err);
      }

      resolve(result);
    });
  });
}

module.exports = sendSoap;
