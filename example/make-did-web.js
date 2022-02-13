const path = require("path");
const fs = require("fs-extra");
const jose = require("jose");
const { WebCryptoKey } = require("@transmute/web-crypto-key-pair");

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
    const childKey1 = fs
      .readFileSync(path.resolve(__dirname, `./child-ca/${i}.crt`))
      .toString();

    const domain = childKey1.split("Subject: CN=")[1].split("\n")[0];
    const did = "did:web:" + domain;

    const cert =
      "-----BEGIN CERTIFICATE-----" +
      childKey1.split("-----BEGIN CERTIFICATE-----")[1];

    const childKey1Imported = await jose.importX509(cert, "ES384");
    const childKey1Exported = await jose.exportJWK(childKey1Imported);
    const vm = await getVerificationMethodsFromKeys(childKey1Exported, did);
    const didDocument = getDidDocument(vm);
    console.log(didDocument);
    await fs.outputFile(
      path.resolve(__dirname, "./child-ca/" + domain + "/did.json"),
      JSON.stringify(didDocument, null, 2)
    );
  }
})();
