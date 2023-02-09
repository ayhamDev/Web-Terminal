const Socket = io()
const terminal = document.querySelector(".terminal")

Socket.on('connect',  function() {
    localStorage.setItem("uid",Socket.id)

    Socket.on("info", async (platform,workingDir) => {
        localStorage.setItem("platform",platform) 
        localStorage.setItem("cwd",workingDir)
        stdin()
    })
});    

function stdin() {
    let newStdin = new DOMParser().parseFromString(stdinTemplate(),"text/html").querySelector(".input_line")
    let input = newStdin.querySelector("input")
    terminal.append(newStdin)
    input.focus()
    input.addEventListener("keydown",(e) => {
        if(e.key == "Enter") {
            newStdin.classList.add("disabled")
            const command_value = input.value 
            input.replaceWith(input.cloneNode())

            if(command_value.split(" ")[0] == "cd") {
                let newCWD = command_value.split(" ")[1].toString()
                newCWD = newCWD.replace(/\\t/g,` `)
                if(newCWD.includes("..")) {
                    let cwd = localStorage.getItem("cwd")
                    cwd = cwd.split("\\")
                    cwd.pop()
                    localStorage.setItem("cwd",cwd.join("\\"))
                    stdin()
                }
                if(newCWD.includes(":\\")) {
                    localStorage.setItem("cwd",newCWD)
                    stdin()
                }
                if(!newCWD.includes(":\\") && !newCWD.includes("..")) {
                    let cwd = localStorage.getItem("cwd")
                    cwd += `\\${newCWD}`
                    localStorage.setItem("cwd",cwd)
                    stdin()
                }
            }
            else {
                Socket.emit("command",{ cwd: localStorage.getItem("cwd"), command: command_value })
            }

        }
    })

}
function stdinTemplate() {
    return ejs.render(`
        <div class="input_line">
            <div>
                <span class="user"><%= uid %>@<%= os%></span><span>:~</span>
                <span> <%= cwd %>> <span>
            </div>
            <input class="Command_input" type="text">
        </div>
    `,{ 
        cwd : localStorage.getItem("cwd"),
        os: localStorage.getItem("platform"),
        uid: localStorage.getItem("uid"),
  })
}

function stdout(data) {
    terminal.innerHTML += ejs.render(`
        <div class="output_line">
            <%= data %>
        </div>
    `,{ 
        data
  })
}





Socket.on("stdout",(data) => {
    stdout(data)
})
Socket.on("error",(error) => {
    return stdout(error)
})
Socket.on("close",() => {
    return stdin()
})
