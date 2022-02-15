openssl verify -CAfile ./child-ca/1.x5c.2.crt ./child-ca/1.x5c.2.crt
openssl verify -CAfile ./child-ca/1.x5c.2.crt ./child-ca/1.x5c.1.crt
openssl verify -CAfile ./child-ca/1.x5c.2.crt -untrusted ./child-ca/1.x5c.1.crt ./child-ca/1.x5c.0.crt