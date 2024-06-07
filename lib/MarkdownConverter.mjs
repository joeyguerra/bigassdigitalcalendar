class MarkdownConverter {
    toHtml(markdown) {
        let html = markdown.toString()
        html = html
            .replace(/^\n\n$/gim, '')
            .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
            .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/^[\*|\-]\s?(.*)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>')
            .replace(/^(?!<)(?!\*)(?!\-)\s?(\S.*)\s*$/gm, '<p>$1</p>')
            .replace(/<p><ul>/gim, '<ul>')
            .replace(/<\/li><\/p>/gim, '</li>')
            .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />')
            .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
            .replace(/<p>\s*<\/p>/gim, '')
        return html.trim()
    }

    toMarkdown(html) {
        let markdown = html.toString()
        markdown = markdown
        .replace(/<h6>(.*?)<\/h6>/gim, '###### $1')
        .replace(/<h5>(.*?)<\/h5>/gim, '##### $1')
        .replace(/<h4>(.*?)<\/h4>/gim, '#### $1')
        .replace(/<h3>(.*?)<\/h3>/gim, '### $1')
        .replace(/<h2>(.*?)<\/h2>/gim, '## $1')
        .replace(/<h1>(.*?)<\/h1>/gim, '# $1')
        .replace(/<li>(.*?)<\/li>/gim, '- $1')
        .replace(/<ul>(.*?)/gim, '$1')
        .replace(/<\/ul>/gim, '')
        .replace(/<strong>(.*?)<\/strong>/gim, '**$1**')
        .replace(/<em>(.*?)<\/em>/gim, '*$1*')
        .replace(/<img src="(.*?)" alt="(.*?)" \/>/gim, '![$2]($1)')
        .replace(/<a href="(.*?)">(.*?)<\/a>/gim, '[$2]($1)')
        .replace(/<p>(.*?)<\/p>/gim, '\n\n$1\n\n')
        .replace(/^\s+|\s+$/g, '')
        return markdown.trim()
    }
}

export default MarkdownConverter
export { MarkdownConverter }