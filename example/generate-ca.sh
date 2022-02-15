#!/bin/bash -x
# modifed to use P-384 instead of RSA from:
# https://stackoverflow.com/questions/26759550/how-to-create-own-self-signed-root-certificate-and-intermediate-ca-to-be-importe

set -e

for C in `echo root-ca intermediate-ca`; do

  mkdir $C
  cd $C
  mkdir certs crl newcerts private
  cd ..

  echo 1000 > $C/serial
  touch $C/index.txt $C/index.txt.attr

  echo '
[ ca ]
default_ca = CA_default
[ CA_default ]
dir            = '$C'                     # Where everything is kept
certs          = $dir/certs               # Where the issued certs are kept
crl_dir        = $dir/crl                 # Where the issued crl are kept
database       = $dir/index.txt           # database index file.
new_certs_dir  = $dir/newcerts            # default place for new certs.
certificate    = $dir/cacert.pem          # The CA certificate
serial         = $dir/serial              # The current serial number
crl            = $dir/crl.pem             # The current CRL
private_key    = $dir/private/ca.key.pem  # The private key
RANDFILE       = $dir/.rnd                # private random number file
nameopt        = default_ca
certopt        = default_ca
policy         = policy_match
default_days   = 365
default_md     = sha256

[ policy_match ]
countryName            = optional
stateOrProvinceName    = optional
organizationName       = optional
organizationalUnitName = optional
commonName             = supplied
emailAddress           = optional

[req]
req_extensions = v3_req
distinguished_name = req_distinguished_name

[req_distinguished_name]

[v3_req]
basicConstraints = CA:TRUE
' > $C/openssl.conf
done

openssl ecparam -genkey -name secp384r1 -out root-ca/private/ca.key
openssl req -config root-ca/openssl.conf -new -x509 -days 3650 -key root-ca/private/ca.key -sha256 -extensions v3_req -out root-ca/certs/ca.crt -subj '/CN=Root-ca'

openssl ecparam -genkey -name secp384r1 -out intermediate-ca/private/intermediate-ca.key
openssl req -config intermediate-ca/openssl.conf -sha256 -new -key intermediate-ca/private/intermediate-ca.key -out intermediate-ca/certs/intermediate-ca.csr -subj '/CN=Interm.'
openssl ca -batch -config root-ca/openssl.conf -keyfile root-ca/private/ca.key -cert root-ca/certs/ca.crt -extensions v3_req -notext -md sha256 -in intermediate-ca/certs/intermediate-ca.csr -out intermediate-ca/certs/intermediate-ca.crt

mkdir child-ca > /dev/null 2>&1

for I in `seq 1 3` ; do
  openssl ecparam -out child-ca/$I.key -name secp384r1 -genkey 
  openssl pkcs8 -topk8 -inform pem -in child-ca/$I.key -outform pem -nocrypt -out child-ca/$I.pem
  openssl req -new -nodes -key child-ca/$I.key -outform pem -out child-ca/$I.request -sha384 -subj "/CN=$I.example.com" 
  openssl ca -batch -config root-ca/openssl.conf -keyfile intermediate-ca/private/intermediate-ca.key -cert intermediate-ca/certs/intermediate-ca.crt -out child-ca/$I.crt -infiles child-ca/$I.request
done

exit 0
