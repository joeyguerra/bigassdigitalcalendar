import File from 'node:fs/promises'
import path from 'node:path'

const __dirname = path.resolve()

async function readFiles(folders, source, delegate) {
    for await (let file of folders) {
        let fileName = `${source}/${file.name}`
        if (file.isFile()){
            if(delegate.filterOut && await delegate.filterOut(file, fileName)) continue
            if(delegate.fileWasFound) await delegate.fileWasFound({ file, fileName })
        }else{
            if(delegate.directoryWasFound) await delegate.directoryWasFound({ file, fileName })
        }
    }
}

const copy = async (from, to)=>{
    const folders = to.split(path.sep)
    folders.pop()
    let folderPath = "/"
    for(let i = 0; i < folders.length; i++){
        folderPath = path.resolve(folderPath, folders[i])
        try{
            await File.stat(folderPath)
        }catch(e){
            try{await File.mkdir(folderPath)}catch(e){}
        }
    }
    fs.createReadStream(from).pipe(fs.createWriteStream(to))
}


const copyFoldersOver = async (folders, destination) => {
    destination = path.resolve(__dirname, destination)
    for await (let key of folders){
        let folder = path.resolve(__dirname, key)
        let files = await readFiles(folder)
        let root = folder.split(path.sep).pop()
        for await (let file of files) {
            await copy(file.name, file.name.replace(folder, `${destination}${path.sep}${root}`))
        }
    }
}

const copyFilesOver = async (files, destination) => {
    destination = path.resolve(__dirname, destination)
    try{
        await File.mkdir(destination)
    }catch(e){}
    for await (let file of files){
        file = path.resolve(__dirname, file)
        let root = file.split(path.sep).pop()
        await copy(file, `${destination}${path.sep}${root}`)
    }
}


export {
    readFiles,
    copyFoldersOver,
    copyFilesOver
}