/*eslint semi: 0, quotes: 0, no-console: 0*/
'use strict';

const fs = require('fs')
const async = require('async')
const nodemailer = require('nodemailer')

const { MAILER_HOST, MAILER_FROM } = process.env

const mail = nodemailer.createTransport(MAILER_HOST)

function loadEmail(file) {
  const input = fs.readFileSync(file).toString()
  const split = input.indexOf('---')
  const to = []
  for (let line of input.substr(0, split).split('\n')) {
    if (line) to.push(line.trim())
  }
  const text = input.substr(split + 3).trim()
  const textSplit = text.indexOf('\n')
  const subject = text.substr(0, textSplit).trim()
  const body = text.substr(textSplit).trim()
  return { to, subject, body }
}

function sendEmail(to, subject, text, done) {
  let options = {
    from: MAILER_FROM,
    to: to,
    subject: subject,
    text: text
  }
  mail.sendMail(options, done)
}

const email = loadEmail(process.argv[2])
async.eachSeries(email.to, (to, next) => {
  process.stdout.write(`${to}...`);
  const name = to.substr(0, to.indexOf('<')).trim()
  const comp = name.split(/ +/)
  const firstName = comp[0]
  const lastName = comp[comp.length - 1]
  let body = email.body
  body = body.replace('{firstName}', firstName)
  body = body.replace('{lastName}', lastName)
  body = body.replace('{name}', name)
  sendEmail(to, email.subject, body, (err) => {
    if (err) console.log('ERROR: ' + err)
    else console.log('OK')
    next()
  })
}, () => { process.exit(0) })
