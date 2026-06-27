export default () => ({
    mail: {
        HOST: process.env.MAIL_HOST,
        USER: process.env.MAIL_USER,
        PASSWORD: process.env.MAIL_PASSWORD,
        FROM: process.env.MAIL_FROM
    }
})