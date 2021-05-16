import cheerio from 'cheerio'
import got from 'got'
import tough from 'tough-cookie'
import url from 'url'
import Action from './action'
import Logger from './logger'

/**
 * Cookie JAR contains cookies for a current session
 * Session holds auth variables such as RelayState and SAMLResponse
 */
const { Cookie, CookieJar } = tough
const cookieJar = new CookieJar()
const logger = new Logger()

/**
 * _Action
 * Will store the hidden input fields and values returned and that will
 * be used in the next phase
 */
let action = {}

/**
 * Build FormData object from regular JSON object
 * @param {*} dataObject
 */
function newForm(dataObject) {
    return new URLSearchParams(dataObject)
}

/**
 * Sometimes cookies are not captured by thoughCookies
 * This ensures that they will be captured
 * @param {*} res
 * @param {*} domain
 */
function parseCookies(res, uri) {
    if (!res.headers['set-cookie']) return

    const cookies = res.headers['set-cookie'].map(Cookie.parse)
    cookies.forEach(cookie => {
        const newCookie = cookie
        newCookie.domain = uri.host
        cookieJar.setCookieSync(newCookie, uri)
    })
}

/**
 * Call fetch request and default handle response
 * Parser cookies from response and inject on header request
 */
async function doGot(phase, request) {
    const options = request.Options || {}
    let response

    // Inject cookies
    options.cookieJar = cookieJar

    try {
        const URL = new url.URL(request.URL)
        response = await got(request.URL, options)

        if (response.body) {
            const $ = cheerio.load(response.body)
            action = new Action($)
        }
        parseCookies(response, URL)
        logger.push(phase, response, action)
        return response
    } catch (e) {
        const msg = e.message
        if (e.response) logger.push(phase, e.response)
        throw new Error(`(${phase}) ${msg}`)
    }
}

/**
 * Run
 */
async function auth(spURL, user, pass) {
    let req = { URL: spURL }
    let res = await doGot('SP_INIT', req)
    let authenticated = false
    let i = 0

    // Follow forms to authenticate until we have a redirect
    // to our initial URL
    while (!authenticated) {
        //  When authenticated a post to the initial SP_URL will be asked
        // which will be replied with a redirect
        authenticated = action.action === spURL

        const { form } = action
        if (action.isUserRequested) form.j_username = user
        if (action.isPassRequested) form.j_password = pass

        req = {
            URL: action.URL,
            Options: {
                followRedirect: false,
                method: action.method,
                form: newForm(form)
            }
        }

        // eslint-disable-next-line no-await-in-loop
        res = await doGot(`STEP_${i}`, req)

        // Folow redirect unless already authorized
        if (res.statusCode === 302 && !authenticated) {
            req = { URL: res.headers.location }
            // eslint-disable-next-line no-await-in-loop
            res = await doGot('IDP_REDIRECT', req)
        }

        i++
    }

    return cookieJar
}

export { logger as log }
export default auth
