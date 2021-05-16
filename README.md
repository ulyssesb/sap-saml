# SAP SAML Authentication

Authenticate in a SAP backend that requires SAML SSO in a rudimental fashion, following the authentication flow using [cheerio](https://www.npmjs.com/package/cheerio) to parser the Identity Provider's responses in order to build the next request.

**Should not be used in a production enviroment**

## Why

Most of SAP's products have services that can be consumed only providing a basic authorization, but in some cases, such as consuming non-whitelisted SAP APIs on S/4HANA Cloud, it will required a user to be logged in via SSO mechanism.

Another application is to consume certain parts of [api.sap.com](api.sap.com), i.e. download an API metadata file.

## Instalation

```
npm i -P sap-saml
```

## API

### `auth(url, user, pass) : CookieJar`

Returns a [cookie jar](https://www.npmjs.com/package/tough-cookie) that can be used in new requests.

### `log`

In case something goes wrong, this log object can be used to debug the authentication process.

## Usage

```
import got from 'got'
import auth, { log } from 'sap-saml'

const cookies = await auth(url, user, pass)

// Inject cookies and call GET on endpoint to test authentication
const resp = await got.get(url, { cookieJar: cookies })
```

## Command

```
$ npx sap-saml --help
Options:
  --help      Show help                                                [boolean]
  --version   Show version number                                      [boolean]
  -s, --url   SAP URL to authenticate to                     [string] [required]
  -u, --user  Username                                       [string] [required]
  -p, --pass  Password                                       [string] [required]
  -d, --dbg   Set debug mode on                                        [boolean]
```
