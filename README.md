# Pointspay Salesforce B2C Commerce Cartridge 

## Compatibility with SFCC architectures
- SFRA version 6.x.x & 7.x.x


## Deployment to dev environment
To upload the cartridge:

   Run npm install to install all of the local dependencies

   Run npm run compile:js from the command line that would compile all client-side JS files. Run npm run compile:scss that would do the same for css.

   Create `dw.json` file in the root of the project from the `dw-template.json` file and fill it with your sandbox credentials (check which code version you need to use in `Administration > Site Development > Code Deployment`)

   Run 
   ```
   sgmf-scripts --uploadCartridge pointspay_sfra
   ```
   It will upload pointspay_sfra cartridge to the sandbox you specified in `dw.json` file.


## Cartridge installation

- Upload the cartridge pointspay_sfra into your sandbox by updating the cartridge path. To do so, go to Business Manager > Administration > Sites > Manage Sites > Your Target Site > Settings and insert pointspay_sfra before other cartridges in the cartridge path.
- Upload and import `pointspayMetadata.zip` from the metadata folder. To do so, go to Business Manager > Administration > Site Development > Site Import & Export. Upload archive using Local option in the Upload Archive section. 
- After upload choose `pointspayMetadata.zip` in the list and click on the import button.

**IMPORTANT:** Make sure to rename `RefArch` folder in the metadata archive to the name of the site you want to import this metadata configuration into

## Setting up certificates and keys

First, generate a new pair of certificates for signing the payment request to the Pointspay API.

```
openssl req -newkey rsa:8192 -nodes -keyout private-key.pem -x509 -days 1095 -out pointspay-certificate.cer -sha256
```

Please upload the generated `pointspay-certificate.cer` file as a shop certificate file on the "ON Payment Dashboard" and set the contents of the `private-key.pem` file in the Pointspay payment  method configuration on your Salesforce B2C store.

After that, download the Pointspay certificate from the "ON Payment Dashboard" and extract the public key from it using the following command:

```
openssl x509 -pubkey -noout -in pointspay-certificate.cer > pointspay-public-key.pem
```

Finally, set the contents of the `pointspay-public-key.pem` file in the Pointspay payment method configuration on your Salesforce B2C store and save the configuration changes.

## Integration tests

The cartridge contains integration tests for IPN calls that can be triggered by running
```
npm run test:integration
```