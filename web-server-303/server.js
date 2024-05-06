/*import http from 'node:http'
import { readFile } from 'node:fs/promises'

const PORT = 3000
const server = http.createServer(async (req, res) => {
  const path = req.url.split('?')[0]
  const params = new URLSearchParams(req.url.split('?')[1])
  console.log(`Request for ${path}`)
  params.forEach((value, name) => {
    console.log(`Query string parameter: ${name}=${value}`)
  })
  try {
    const data = await readFile('.' + path, 'utf8')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data, 'utf8')
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found', 'utf8')
  }
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

/* TAREA: Modificar el servidor actual con las siguientes condiciones:
 * responde solo GET
 * responder el archivo de la ruta y manejar errores
 * si es extension html responder con el content-type correcto sino text/plain
 * si no existe el archivo responder con 404 Not Found
 * generar un archivo requests.log donde se almacene la fecha y la ruta de la peticion (mostrar un error por consola si requests.log no existe)
 * evitar que se pueda hacer un request a requests.log
 * devolver status code adecuado SIEMPRE
 * si el path del request es / /index /index.html debe devolver index.html
 * opcional: devolver el favicon

// Path: server.js
import http from 'node:http'
import { readFile, appendFile } from 'node:fs/promises'

const PORT = 3000

const logRequest = async (path) => {
  try {
    await appendFile('requests.log', `${new Date()} - ${path}\n`)
  } catch (error) {
    console.error('Error writing to requests.log')
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain' })
    res.end('405 Method Not Allowed', 'utf8')
    return
  }
  const path = req.url === '/' || req.url === '/index' ? '/index.html' : req.url
  if (path === '/favicon.ico') {
    res.writeHead(204)
    res.end()
    return
  }
  console.log(`Request for ${path}`)
  await logRequest(path)
  try {
    const data = await readFile('.' + path, 'utf8')
    const contentType = path.endsWith('.html') ? 'text/html' : 'text/plain'
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data, 'utf8')
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found', 'utf8')
  }
}
 */

import http from 'node:http'
import { readFile, appendFile } from 'node:fs/promises'
import path from 'node:path'

const PORT = 3000
const LOG_FILE = 'requests.log'

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain' })
    res.end('Error 405: Method Not Allowed', 'utf8')
    return
  }

  let requestPath = req.url.split('?')[0]
  if (['/', '/index', '/index.html'].includes(requestPath)) {
    requestPath = '/index.html'
  }

  if (requestPath === `/${LOG_FILE}`) {
  try {
    await readFile(LOG_FILE);
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    res.end('Error 403: Forbidden', 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Error 404: Not Found', 'utf8')
    } else {
      console.error(`Error reading ${LOG_FILE}: ${error}`)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Error 500: Internal Server Error', 'utf8')
    }
  }
  return;
}
  if (requestPath === '/favicon.ico') {
    try {
      const favicon = await readFile('./favicon.ico')
      res.writeHead(200, { 'Content-Type': 'image/x-icon' })
      res.end(favicon, 'binary')
      return
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Error 404: Not Found', 'utf8')
        return
      }
      else{
      console.error('Error reading favicon.ico:', error)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Error 500: Internal Server Error', 'utf8')
      return
      }
    }
  }

  console.log(`Request for ${requestPath}`)

  try {
    const filePath = '.' + requestPath
    const data = await readFile(filePath, 'utf8')
    const contentType = path.extname(filePath) === '.html' ? 'text/html' : 'text/plain'
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data, 'utf8')

    const logEntry = `${new Date().toISOString()} - ${requestPath}\n`
    await appendFile(LOG_FILE, logEntry)
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Error 404: Not Found', 'utf8')
    } else {
      console.error(`Error reading file or writing to ${LOG_FILE}: ${error}`)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Error 500: Internal Server Error', 'utf8')
    }
  }
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})