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

## Integration tests

The cartridge contains integration tests for IPN calls that can be triggered by running
```
npm run test:integration
```