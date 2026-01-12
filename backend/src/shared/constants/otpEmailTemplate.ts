export const otpEmailTemplate = (name: string, otp: string) => {
  const html = `
  <!doctype html>
  <html xmlns="http://www.w3.org/1999/xhtml">

  <head>
    <title></title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Poppins:400,700,900" rel="stylesheet" type="text/css">
    <style type="text/css">
      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        font-family: 'Open Sans', Helvetica, Arial, sans-serif;
      }

      table,
      td {
        border-collapse: collapse;
      }

      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
    </style>
  </head>

  <body style="background-color:#ffffff;">
    <div style="background-color:#ffffff; padding: 20px 0;">
      <div style="background:#ff637e; margin:0px auto; border-radius:20px; max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
          <tbody>
            <tr>
              <td style="padding:40px 30px; font-weight:600;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                  <tr>
                    <td style="padding-bottom:30px; font-size:45px; font-weight:900; color:#ffffff;">
                      Utter
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:15px; font-size:22px; color:#ffffff;">
                      Dear ${name.split(' ')[0]},
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:25px; font-size:15px; color:#ffffff;">
                      Please verify your email with the OTP given below.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:30px;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center" bgcolor="#2563eb" style="border-radius:30px; padding:12px 30px; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:12px; text-indent:12px;">
                            ${otp}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:15px; line-height:1.5; color:#ffffff;">
                      Thanks,<br>The Utter Team.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </body>

  </html>
  `;

  return html;
};
