const path = require("path");
const fs = require("fs-extra");
const jose = require("jose");
const { WebCryptoKey } = require("@transmute/web-crypto-key-pair");

// taken from (MIT licensed):
// https://github.com/hildjj/node-posh/blob/master/lib/index.js
function cert_to_x5c(cert, maxdepth) {
  if (maxdepth == null) {
    maxdepth = 0;
  }
  /*
   * Convert a PEM-encoded certificate to the version used in the x5c element
   * of a [JSON Web Key](http://tools.ietf.org/html/draft-ietf-jose-json-web-key).
   *
   * `cert` PEM-encoded certificate chain
   * `maxdepth` The maximum number of certificates to use from the chain.
   */

  cert = cert.replace(/-----[^\n]+\n?/gm, ",").replace(/\n/g, "");
  cert = cert.split(",").filter(function (c) {
    return c.length > 0;
  });
  if (maxdepth > 0) {
    cert = cert.splice(0, maxdepth);
  }
  return cert;
}

const getX5c = (i) => {
  const rootCa = fs.readFileSync(
    path.resolve(__dirname, "../example/root-ca/certs/ca.crt"),
    "utf8"
  );
  const root = cert_to_x5c(rootCa);
  const intermediateCa = fs.readFileSync(
    path.resolve(
      __dirname,
      "../example/intermediate-ca/certs/intermediate-ca.crt"
    ),
    "utf8"
  );
  const intermediate = cert_to_x5c(intermediateCa);
  const childCa = fs.readFileSync(
    path.resolve(__dirname, `./child-ca/${i}.crt`),
    "utf8"
  );
  const leaf = cert_to_x5c(childCa);
  return [leaf[1], intermediate[0], root[0]];
};

const getVerificationMethodsFromKeys = async (publicKeyJwk, did) => {
  const k2 = await WebCryptoKey.from({
    id: "",
    controller: did,
    type: "JsonWebKey2020",
    publicKeyJwk,
  });
  const f = await k2.fingerprint();
  k2.id = k2.controller + "#" + f;
  return k2.export({ type: "JsonWebKey2020" });
};

const getDidDocument = (vm) => {
  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
    ],
    id: vm.controller,
    verificationMethod: [vm],
    assertionMethod: [vm.id],
    authentication: [vm.id],
  };
};

(async () => {
  for (const i of [1, 2, 3]) {
    const childCertificate = fs
      .readFileSync(path.resolve(__dirname, `./child-ca/${i}.crt`))
      .toString();

    const childPrivateKey = fs.readFileSync(
      path.resolve(__dirname, `../example/child-ca/${i}.pem`),
      "utf8"
    );

    const importedPrivateKey = await jose.importPKCS8(childPrivateKey, "ES384");
    const exportedPrivateKeyJwk = await jose.exportJWK(importedPrivateKey);

    await fs.outputFile(
      path.resolve(__dirname, `./child-ca/${i}.privateKeyJwk.json`),
      JSON.stringify(exportedPrivateKeyJwk, null, 2)
    );

    const domain = childCertificate.split("Subject: CN=")[1].split("\n")[0];
    const did = "did:web:" + domain;

    const cert =
      "-----BEGIN CERTIFICATE-----" +
      childCertificate.split("-----BEGIN CERTIFICATE-----")[1];

    const importedPublicKey = await jose.importX509(cert, "ES384");
    const exportedPublicKey = await jose.exportJWK(importedPublicKey);
    const vm = await getVerificationMethodsFromKeys(exportedPublicKey, did);

    vm.publicKeyJwk.x5c = getX5c(i);

    await fs.outputFile(
      path.resolve(__dirname, `./child-ca/${i}.publicKeyJwk.json`),
      JSON.stringify(vm.publicKeyJwk, null, 2)
    );

    const didDocument = getDidDocument(vm);

    await fs.outputFile(
      path.resolve(__dirname, "./child-ca/" + domain + "/did.json"),
      JSON.stringify(didDocument, null, 2)
    );
  }
})();
