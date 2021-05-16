/**
 * Parse a SSO response and create the form action parameters
 */
class Action {
    /**
     * Read all children input from form tag and store them
     * in _list attribute as first element
     */
    constructor($) {
        const newForm = {}
        const formElem = $('form')[0]

        $("input[type='hidden']", formElem).each((_, e) => {
            if (e.attribs?.value) newForm[e.attribs.name] = e.attribs.value
        }, {})

        // Also possible that some form fields are children from fieldset
        $("fieldset > input[type='hidden']", formElem).each((_, e) => {
            if (e.attribs?.value) newForm[e.attribs.name] = e.attribs.value
        }, {})

        this.method = formElem.attribs.method.toUpperCase()
        this.action = formElem.attribs.action
        this.form = newForm
        this.isUserRequested = !!$('input#j_username', formElem)[0]
        this.isPassRequested = !!$('input#j_password', formElem)[0]
    }

    /**
     * Returns the latest action's URL
     * Most of the time it can be found in the form action,
     * but it might also be a relative URL, starting with /
     * In this case, it should return the form value for idpSSOEndpoint
     */
    get URL() {
        return this.action.startsWith('/') ? this.form.idpSSOEndpoint : this.action
    }
}

export default Action
