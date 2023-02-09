async function Import(path) {
    const data = await fetch(path)
    const html = await data.text()  
    return html
}