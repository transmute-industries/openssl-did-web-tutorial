# Open SSL DID Web Tutorial

This repository provides an educational example for how to generate keys
for use with `did:web` in a manner that aims to be consistent with existing best
practices for handing public key generation and use of 
[X.509](https://datatracker.ietf.org/doc/html/rfc5280) certificates to handle
such use cases as certificate chains and revocation.

### Disclaimer
The contents of this repository are educational only, and should not be relied on in
production.

Nothing in this guide should be mistaken for security or legal advice, and the
reader is advised to read further about these topics and consult security
experts and legal counsel regarding the latest case law and best practices.

## Intro and Example
When working with [Decentralized Identifiers](https://www.w3.org/TR/did-core/)
and [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) a natural
question that arises is how do these standards relate to
[X.509](https://en.wikipedia.org/wiki/X.509) and traditional public key
infrastructure tooling such as [OpenSSL](https://github.com/openssl/openssl).

For the sake of expediency, we'll walk through a toy example with a series of
questions.

### Which web origins will issue my verifiable credentials?

The first question we must answer is: "how will we identify issuers and
holders".

When working with DIDs, this usually starts by picking a DID Method from the
[DID Spec Registries](https://w3c.github.io/did-spec-registries/).

In a decentralized scenario, we might pick a DID Method like ION, ELEM or INDY,
however we are assuming a centralized scenario because we are assuming the need
for backwards compatibility with traditional PKI.

This leaves us with only a few options, of which 
[DID Web](https://w3c-ccg.github.io/did-method-web/) 
is the most practical choice at the time that this document was last updated.

Let use assume we will use DID Web for issuer identifiers, we must now refine
the format of the identifier further.

DID Web supports 2 identifier formats, the first is a "naked origin", which
looks like `"example.com"` or `"1.example.com"`.

This first format is ideal when you control that entire origin, and when you do
not need to make many unique issuer identifiers bound to that same origin.

The second is a path based identifer, "example.com/issuer/123". This format is
ideal when a single origin manages many identifiers for issuers on behalf of
departments / clients / customers.

There are obvious usability benefits and privacy cons to be considered for this
second case, so for the sake of our example, we will proceed using the first
format.

Having settled on a format for the `issuer` of the Verifiable Credentials, we
have successfully answered the first question.

We will use `1.example.com` and its corrosponding DID `did:web:1.example.com` to
issuer credentials.

### How will we establish trust in the issuer & holder?

In traditional PKI systems, we rely on a centralized 
[Certificate Authority](https://en.wikipedia.org/wiki/Certificate_authority) 
to establish trust.

If you would like to learn more about software / hardware supply chain attacks,
here are some references:

- [Solar Winds 2021](https://www.businessinsider.com/solarwinds-hack-explained-government-agencies-cyber-security-2020-12)
- [Elemental / Super Micro Computer Inc.2018](https://www.bloomberg.com/news/features/2018-10-04/the-big-hack-how-china-used-a-tiny-chip-to-infiltrate-america-s-top-companies)
- [Comodo 2011](https://www.eff.org/deeplinks/2011/03/iranian-hackers-obtain-fraudulent-https)

For the sake of our example we will consider 3 factors in establishing trust in
the issuer.

#### DPKI Trust Factors

1. Do we trust the issuer's hardware supply chain?

1. Do we trust the issuer's software supply chain?

1. Do we trust the issuer's governance (legal / geographic) system?

Answers to these questions require looking at specific manufacturers, software
vendors and governments.

It's important to note that in addition to the "server side" considerations, we
also have "mobile device" side considerations.

See also:

- [Android Key Attestations](https://developer.android.com/training/articles/security-key-attestation)
- [Apple Secure Enclave](https://developer.apple.com/documentation/security/certificate_key_and_trust_services/keys/storing_keys_in_the_secure_enclave)

If you are interested in device bound keys and Decentralized Identifiers, you
may want to consider [did:key](https://did.key.transmute.industries/), or
registering device bound keys to a verification relationship for a more
decentralized DID Method, such as ION or ELEM.

Let's assume that we trust the certificates associated with
[Apple](https://www.apple.com/certificateauthority/private/) and
[Android](https://android.googlesource.com/platform/system/ca-certificates/+/master/files/).

Let's also assume that we trust the root CA and intermediate CAs associated with
the web origin's CA chain we need to establish trust in `1.example.com`.

We are now ready to generate some example certificates and Decentralized
Identifiers.

### Generating Example Data

```
cd ./example;
npm i;
./clean.sh && ./build.sh
```

These commands will clean and generate example data associated with a simple CA
system.

Although the script will generate these examples in a flat directory structure,
this is what they look like when organized logically.

```
root-ca/
├─ intermediate-ca/
│  ├─ child-ca/
│  │  ├─ 1.example.com
│  │  ├─ 2.example.com
│  │  ├─ 3.example.com
```

Each `child-ca` is really a web origin, and has a corresponding [DID Document](https://www.w3.org/TR/did-core/#core-properties).

This document contains the keys that are "authoritative" for the identifier and
its various verification relationships.

In this case we have `1.example.com` represented as `did:web:1.example.com` with
a single elliptic curve public key (P-384 / ES384).

This key is registered for use in 2 relationships, `assertionMethod` for issuing
verifiable credentials, and `authentication` for creating verifiable
presentations.

These relationships correspond to the 2 roles in the verifiable credentials
specification, `issuer` and `holder`.

See [VC Data Model Life Cycle Details](https://www.w3.org/TR/vc-data-model/#lifecycle-details).

In order to make this clearer lets look at a full example.

### User Stories

Example did:web document:

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/jws-2020/v1"
  ],
  "id": "did:web:1.example.com",
  "verificationMethod": [
    {
      "id": "did:web:1.example.com#z82LkoKVLUUigxZckvRRUGCWjsusxrN44xkpZCBDXDTHusQ2o1HCr7XF5AoX2YXQAP9TUxq",
      "type": "JsonWebKey2020",
      "controller": "did:web:1.example.com",
      "publicKeyJwk": {
        "kty": "EC",
        "crv": "P-384",
        "x": "TFBtjpFFfaqHjUweZYsX0oYdVB71pA_d6C72dj7m-PFC26f2IS-ALSkAoJSRVv2C",
        "y": "8EYC27AaGwUe7QG4_MZhnFm7JbecFDXo_qZg-Dhnk-BDaKskbaz6Tc5QA2hTjQJc"
      }
    }
  ],
  "assertionMethod": [
    "did:web:1.example.com#z82LkoKVLUUigxZckvRRUGCWjsusxrN44xkpZCBDXDTHusQ2o1HCr7XF5AoX2YXQAP9TUxq"
  ],
  "authentication": [
    "did:web:1.example.com#z82LkoKVLUUigxZckvRRUGCWjsusxrN44xkpZCBDXDTHusQ2o1HCr7XF5AoX2YXQAP9TUxq"
  ]
}
```

#### Issuing & Verifying a Verifiable Credential

As an issuer, `did:web:1.example.com` uses the `assertionMethod` verification
relationship
`did:web:1.example.com#z82LkoKVLUUigxZckvRRUGCWjsusxrN44xkpZCBDXDTHusQ2o1HCr7XF5AoX2YXQAP9TUxq`
to issue (sign) verifiable credentials.

As a verifier, the relying party dereferences the verification relationship
`did:web:1.example.com#z82LkoKVLUUigxZckvRRUGCWjsusxrN44xkpZCBDXDTHusQ2o1HCr7XF5AoX2YXQAP9TUxq`
to the public key and checks the signature on the verifiable credential.

#### Presenting & Verifying a Verifiable Presentation

As a holder, `did:web:1.example.com` uses the `authentication` verification
relationship
`did:web:1.example.com#z82LkoKVLUUigxZckvRRUGCWjsusxrN44xkpZCBDXDTHusQ2o1HCr7XF5AoX2YXQAP9TUxq`
to prove (sign) verifiable presentations.

As a verifier, the relying party dereferences the verification relationship
`did:web:1.example.com#z82LkoKVLUUigxZckvRRUGCWjsusxrN44xkpZCBDXDTHusQ2o1HCr7XF5AoX2YXQAP9TUxq`
to the public key and checks the signature on the verifiable presentation.

The verifier also does the same for any included verifiable credentials,
according to the process above.

#### Verifying the Full CA Chain for a VC or VP

The verifier may also wish to review the full CA chain for the associated public
key, which is supported by the X.509 standard.

In order to do this, the verifier will need to check each certificate in the
chain, this can be accomplished using open ssl.

```
openssl x509 -text -in child-ca/1.example.com/1.crt
openssl verify -CAfile ./root-ca/certs/ca.crt -untrusted ./intermediate-ca/certs/intermediate-ca.crt child-ca/1.example.com/1.crt
openssl verify -CAfile ./root-ca/certs/ca.crt ./intermediate-ca/certs/intermediate-ca.crt
openssl verify -CAfile ./root-ca/certs/ca.crt ./root-ca/certs/ca.crt
```

At the time of writing this tutorial, there is no "standard" recommended way for
embedding this CA chain in a did document, though embedding the whole chain
may not be desireable, as in doing so, a situation is created where the
CA chain from the document might be used for verification, rather than the 
core operating system managed CA chain (which sees updates to revocation 
based on system updates).  That type of situation could allow verification
based on a revoked certificate which could be quite problematic.

We recommend not including this chain in the did web document, and instead,
making it available to verifiers via an approach similar to the one taken by
Apple and Google for Android and iOS.  
n.b. many core intermediate and root certificates are already present on both 
commonly deployed operating systems and browsers and as a result, you may not 
need to take additional action to deploy intermediate certificates.

#### Hardware Isolation & Supply Chain Considerations

There are a number of considerations that apply to how the private keys are
generated and how the public keys are signed to construct the CA Chain.

There can be some flexibility here depending of the frequency of key rotations
and [threat model](https://en.wikipedia.org/wiki/Threat_model).

It is recommended that the Root CA be
[air-gapped](<https://en.wikipedia.org/wiki/Air_gap_(networking)>), and that the
intermediate CA key ceremonies occur in an environment that is suitable to the desired
security level for the intended deployment environment.  

If conducting a key ceremony that is generating key material
or certificates for use on the open web, it should be assumed that key generation
will occur in a safe environment, and that private key material will not be 
accessed outside of use of an [HSM](https://en.wikipedia.org/wiki/Hardware_security_module) 
meeting the appropriate security level for the desired deployment environment, 
e.g. [FIPS 140-3](https://csrc.nist.gov/publications/detail/fips/140/3/final)  


Because this process of securing a CA Chain is not new, we will direct readers
to the following references for further details.

- [Key Ceremony](https://en.wikipedia.org/wiki/Key_ceremony)
- [NSA KEY MANAGEMENT REQUIREMENTS ANNEX V2.0 2021](<https://www.nsa.gov/portals/75/documents/resources/everyone/csfc/capability-packages/(U)%20Key%20Management%20Requirements%20Annex%20v2_0.pdf?ver=aInoh9AdFRsDsNa2yjgTRg%3D%3D>)
- [digi-sign key ceremony](https://www.digi-sign.com/compliance/key%20ceremony/index)

Regardless of the threat environment, a `verifier` or `relying-party` MUST trust
that all private keys remain uncompromised, meaning that the verifier believes
that only authorized personal have access to the raw private key or its signing
capabilities in the case of hardware isolation.

### Conclusion

If you are an organization or person interested in applying 
[Decentralized Identifiers](https://www.w3.org/TR/did-core/) and 
[Verifiable Credentials](https://www.w3.org/TR/vc-data-model/), 
it is recommended that you understand their relationship to traditional PKI systems such as
[X.509](https://en.wikipedia.org/wiki/X.509) and
[OpenSSL](https://github.com/openssl/openssl).

Because these standards are many years apart from each other, there is often more
than one way that they can be used together, additionally the cryptographic and
legal building blocks associated with their successful operation may have
changed since the time the standard was published.

It is recommended that you review the latest case law and security expert
recommendations before considering applying these technologies.

You may wish to consult:

- [CFRG](https://datatracker.ietf.org/rg/cfrg/documents/)
- [NIST](https://www.nist.gov/)
- [UN Committee of Experts on Big Data and Data Science for Official Statistics](https://unstats.un.org/bigdata/task-teams/privacy)
- [UN Office of Counter-Terrorism](https://www.un.org/counterterrorism/cybersecurity)
