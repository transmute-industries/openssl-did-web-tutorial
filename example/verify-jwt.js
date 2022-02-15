const fs = require("fs");
const path = require("path");
const jose = require("jose");

function x5c_to_cert(x5c) {
  var cert, y;
  cert = (function () {
    var _i, _ref, _results;
    _results = [];
    for (y = _i = 0, _ref = x5c.length; _i <= _ref; y = _i += 64) {
      _results.push(x5c.slice(y, +(y + 63) + 1 || 9e9));
    }
    return _results;
  })().join("\n");
  return "-----BEGIN CERTIFICATE-----\n" + cert + "\n-----END CERTIFICATE-----";
}

(async () => {
  const publicKeyJwk = require("./child-ca/1.example.com/1.publicKeyJwk.json");
  const { jwt } = require("./child-ca/1.example.com/vc.1.json");

  const { protectedHeader } = await jose.jwtVerify(
    jwt,
    await jose.importJWK(publicKeyJwk, "ES384"),
    {
      issuer: "urn:example:issuer",
      audience: "urn:example:audience",
    }
  );

  if (protectedHeader.alg === "ES384") {
    console.log("JWT verified.");
  }

  // write out the certs to the fs so they can be checked with openssl
  const certs = publicKeyJwk.x5c.map((x5c) => {
    return x5c_to_cert(x5c);
  });
  certs.forEach((cert, i) => {
    fs.writeFileSync(
      path.resolve(__dirname, `./child-ca/1.x5c.${i}.crt`),
      cert
    );
  });
})();
