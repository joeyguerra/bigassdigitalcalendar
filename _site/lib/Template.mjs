import vm from 'node:vm'
class Template {
    constructor (template, data, partials = new Map(), functions = {}) {
        this.template = template
        this.data = data
        this.partials = partials
        this.functions = functions
    }
    renderWithLayout (layout, body) {
        if (!layout || layout.length === 0) {
            return body
        }
        const sandbox = {
            ...this.data,
            ...this.functions,
            body,
        }
        const script = new vm.Script(`result = \`${layout}\``)
        const context = new vm.createContext(sandbox)
        script.runInContext(context)
        return context.result
    }
    async render() {
        let layout = null
        const hasLayout = layoutPath => {
            layout = layoutPath
            return ''
        }
        try {
            const script = new vm.Script(`result = \`${this.template}\``)
            const context = new vm.createContext({
                ...this.data,
                ...this.functions,
                hasLayout
            })
            script.runInContext(context)
            if (layout) {
                context.result = context.result.replace(/^\n/, '')
                return this.renderWithLayout(this.partials.get(layout), context.result)
            }
            return context.result
        } catch (e) {
            console.error('error occured', e)
            throw e
        }
    }
}
export {
    Template
}
