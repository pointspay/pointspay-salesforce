#!/bin/bash

# Generate a new private key and certificate
openssl req -newkey rsa:8192 -nodes -keyout private-key.pem -x509 -days 1095 -out pointspay-certificate.cer -sha256

# Extract the public key from the certificate
openssl x509 -pubkey -noout -in pointspay-certificate.cer > pointspay-public-key.pem

# Read the content of the private key and public key files
PRIVATE_KEY_CONTENT=$(cat private-key.pem)
PUBLIC_KEY_CONTENT=$(cat pointspay-public-key.pem)

# Write out the desired content
echo "Private key (used for payment requests to the Pointspay API):
$PRIVATE_KEY_CONTENT

Pointspay public key (used for validating incoming requests from the Pointspay API):
$PUBLIC_KEY_CONTENT

Please upload the generated pointspay-certificate.cer file to the corresponding shop credentials on the ON Payment Dashboard"
