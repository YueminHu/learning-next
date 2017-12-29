const fs = require('fs-extra')
const http = require('http')
const https = require('https')
const path = require('path')
const url = require('url')

// express middlewares
const express = require('express')
const cors = require('cors')
const compression = require('compression')
const session = require('express-session')
const bodyParser = require('body-parser')

const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handler = app.getRequestHandler()
// https certificates
const key = fs.readFileSync('./sslcert/214253111870115.key', 'utf8')
const cert = fs.readFileSync('./sslcert/214253111870115.crt', 'utf8')
const credentials = {
  key,
  cert
}

// tools for markdown handling
const marked = require('marked')
const hightligt = require('highlight.js')
const renderer = new marked.Renderer()

//custom html render results
renderer.code = (code, language) => `<pre class='hljs'>
  <code class='lang-${language}'>${hightligt.highlightAuto(code).value}</code>
</pre>`
renderer.image = (href, title, text) => `<img src=${href} />`
renderer.link = (href, title, text) => `<a href=${href} target='${/yoominhu\.site/.test(href) ? '' : '_blank'}'>${text}</a>`
marked.setOptions({
  renderer,
  gfm: true,
  tables: true,
  breaks: true,
})

app.prepare()
  .then(() => {
    const server = express()
    // apply middlewares
    server.use(cors())
    server.use(compression())
    server.use(bodyParser.urlencoded({extended: false}))
    server.use(bodyParser.json())
    // server.use(express.cookieParser())
    // server.use(session({
    //   secret: 'secret',
    //   resave: false,
    //   saveUninitialized: true,
    //   cookie: {
    //     path: '/_next'
    //   },
    //   name: 'nextCookie'
    // }))
    // server.use(session({
    //   secret: 'secret',
    //   resave: false,
    //   saveUninitialized: true,
    //   cookie: {
    //     path: '/api'
    //   },
    //   name: 'cookieName'
    // }))

    // express-first
    // pages
    // post pages
    server.get('/posts/:y/:m/:d/:n', (req, res) => {
      const actualPage = '/post'
      // props to be passed to the react Posts component
      const queryParams = {
        id: `${req.params.y}${req.params.m}${req.params.d}-${req.params.n}`,
        title: `${req.params.n.replace(/\..*/, '')}`
      }
      app.render(req, res, actualPage, queryParams)
    })

    // apis
    // article list
    server.get('/api/post/list', async (req, res) => {
      const articleList = JSON.parse(await fs.readFile('./articles/articleList.json', 'utf-8'))
      const offset = req.query['offset'] || 0
      const size = req.query['size'] || 10
      articleList.list = articleList.list.slice(offset, offset + size)
      // articleList.total = 21
      res.json(articleList)
    })

    // article id enquiry
    server.get('/api/post/:id', async (req, res) => {
      try {
        const fileName = path.resolve('./articles', decodeURIComponent(req.params.id))
        const mdContent = await fs.readFile(fileName, 'utf-8')
        const htmlContent = marked(mdContent)
        const stat = await fs.stat(fileName)
        res.send({
          status: 'success',
          id: req.params.id,
          htmlContent,
          publishTime: stat.birthtime,
          type: 'markdown'
        })
      } catch (e) {
        console.log(e)
        res.end(e)
      }
    })



    // login page
    // server.post('/api/login', async (req, res) => {
    //   const passwordStr = await fs.readFile(path.resolve(__dirname, './password.json'), 'utf-8')
    //   const passwordJson = JSON.parse(passwordStr)
    //   for (let i = 0; i < passwordJson.length; i++) {
    //     const current = passwordJson[i]
    //     if (current.username === req.body.username) {
    //       if (current.password === req.body.password) {
    //         req.session.username = current.username
    //         req.session.auth = current.auth
    //         return res.json({
    //           status: 'success',
    //           user: current.username
    //         }) 
    //       } else {
    //         return res.json({
    //           status: 'error',
    //           message: 'password error!'
    //         })
    //       }
    //     }
    //   }
    //   res.json({
    //     status: 'error',
    //     message: 'user not found!'
    //   })
    // })

    // login logic
    // server.get('/api/login', async (req, res) => {
    //   res.json({
    //     username: req.session.username
    //   })
    // })

    server.get('*', (req, res) => handler(req, res))

    const httpServer = dev ? http.createServer(server) : https.createServer(credentials, server)

    httpServer.listen(dev ? 3000 : 80, err => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })

  })
  .catch(ex => {
    console.log(ex.stack)
    process.exit(1)
  })