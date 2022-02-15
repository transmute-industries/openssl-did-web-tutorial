const jose = require("jose");
const fs = require("fs");
const path = require("path");

(async () => {
  const privateKeyJwk = require("./child-ca/1.example.com/1.privateKeyJwk.json");
  const publicKeyJwk = require("./child-ca/1.example.com/1.publicKeyJwk.json");

  const m = { hello: "world" };

  const jwt = await new jose.SignJWT(m)
    .setProtectedHeader({ alg: "ES384" })
    .setIssuedAt()
    .setIssuer("urn:example:issuer")
    .setAudience("urn:example:audience")
    .setExpirationTime("2h")
    .sign(await jose.importJWK(privateKeyJwk, "ES384"));

  const { payload, protectedHeader } = await jose.jwtVerify(
    jwt,
    await jose.importJWK(publicKeyJwk, "ES384"),
    {
      issuer: "urn:example:issuer",
      audience: "urn:example:audience",
    }
  );
  if (protectedHeader.alg === "ES384") {
    fs.writeFileSync(
      path.resolve(__dirname, "./child-ca/1.example.com/vc.1.json"),
      JSON.stringify(
        {
          jwt,
          protectedHeader,
          payload,
        },
        null,
        2
      )
    );
  }
})();
