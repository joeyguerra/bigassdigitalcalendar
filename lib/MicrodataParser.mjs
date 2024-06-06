
class PropertyList extends Array {
	constructor(...args) {
	  super(...args)
	}
	findByKey(key){
		let prop = this.find(p=>p.key==key)
		if(prop) return prop
		return {
			value: null
		}
	}
}
const MicrodataParser = () => {
	const getValue = node => {
		const tag = node.tagName.toLowerCase()
		switch(tag){
			case "meta":
				return node.getAttribute("content") || ""
			case "audio":
			case "embed":
			case "iframe":
			case "img":
			case "source":
			case "track":
			case "video":
				return node.getAttribute("src")
			case "a":
			case "area":
			case "link":
				return node.getAttribute("href")
			case "object":
				return node.getAttribute("data")
			case "data":
			case "meter":
				return node.getAttribute("value") || ""
			case "time":
				return new Date(node.getAttribute("datetime"))
			default:
				return node.innerHTML
		}
	}
	const findValue = item => {
		let value = null
		if (item.getAttribute("itemscope") !== null) {
			value = toObject(item)
		} else {
			value = getValue(item)
		}
		return value
	}
	const toObject = node => {
		let result = {properties: new PropertyList()}
		let properties = node.querySelectorAll("[itemprop]")
		result.types = (node.getAttribute("itemtype") || "").split(" ")
		result.id = node.getAttribute("itemid")
		result.key = node.getAttribute("itemprop")
		Array.prototype.slice.call(properties)
			.forEach(item => {
				let key = item.getAttribute("itemprop")
				const value = findValue(item)
				key.split(" ").forEach(k=>{
					result.properties.push({key: k, value})
				})
			})
		return result
	}
	return {
		execute(doc, fn){
			const scopes = Array.prototype.slice.call(doc.querySelectorAll("[itemscope]"))
			scopes.forEach((n, i)=>{
				fn(toObject(n))
			})
		}
	}
}

export default MicrodataParser