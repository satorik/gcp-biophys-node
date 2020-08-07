import nodemailer from 'nodemailer'
import config from '../config/config'

export default async (username, email, hashedString, mailType) => {

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.GMAIL_ACC,
      pass: config.GMAIL_PASS
    }
  })

  let mailHtml = ''
  let subject = ''

  if (mailType === 'register') {
    subject = 'Подтверждение регистрации'
    mailHtml = `Здравствуйте, ${username}!
    <br>
    <br>
    Для подтверждения регистрации, перейдите по ссылке:<br>
    ${config.WEB_ADR}/account/activation/${hashedString}
    <br>
    <br>
    После подтверждения, ждите, пока вашу учетную запись одобрит один из модераторов.
    <br>
    <br>
    --
    ByophysSite
     `
  }
  else if (mailType === 'recovery') {
    subject = 'Восстановление пароля'
    mailHtml = `Здравствуйте, ${username}!
    <br>
    <br>
    Для восстановления пароля, пройдите по ссылке:<br>
    ${config.WEB_ADR}/account/recovery/${hashedString}
    <br>
    <br>
    Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.
    <br>
    <br>
    --
    ByophysSite
     `
  }


  try {
     await transporter.sendMail({
      from: config.GMAIL_ACC,
      to: email,
      subject,
      html: mailHtml 
    })

    return true
  } catch (error) {
    console.log('sendMail', error)
  }
}

