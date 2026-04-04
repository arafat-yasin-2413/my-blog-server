import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// nodemailer

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    trustedOrigins: [process.env.APP_URL!],

    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false,
            },
            phone: {
                type: "string",
                required: false,
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false,
            },
        },
    },

    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
    },

    //   email verification function
    emailVerification: {

        sendOnSignUp : true,

        sendVerificationEmail: async ({ user, url, token }, request) => {
            // console.log({user, url, token});
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
                const info = await transporter.sendMail({
                    from: '"My Blog" <myblogapp@ph.com>',
                    to: user.email,
                    subject: "Please Verify Your Email",
                    html: `<!DOCTYPE html>
                		<html lang="en">
                		<head>
                		  <meta charset="UTF-8" />
                		  <title>Email Verification</title>
                		  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                		  <style>
                		    body {
                		      margin: 0;
                		      padding: 0;
                		      background-color: #f4f6f8;
                		      font-family: Arial, Helvetica, sans-serif;
                		    }
                		    .container {
                		      max-width: 600px;
                		      margin: 40px auto;
                		      background-color: #ffffff;
                		      border-radius: 8px;
                		      overflow: hidden;
                		      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                		    }
                		    .header {
                		      background-color: #4f46e5;
                		      color: #ffffff;
                		      padding: 20px;
                		      text-align: center;
                		    }
                		    .content {
                		      padding: 30px;
                		      color: #333333;
                		      line-height: 1.6;
                		    }
                		    .button-wrapper {
                		      text-align: center;
                		      margin: 30px 0;
                		    }
                		    .verify-button {
                		      background-color: #0d0c0f;
                		      color: #ffffff;
                		      padding: 14px 28px;
                		      text-decoration: none;
                		      border-radius: 6px;
                		      font-weight: bold;
                		      display: inline-block;
                		    }
                		    .verify-button:hover {
                		      background-color: #9d9da7;
                		    }
                		    .footer {
                		      padding: 20px;
                		      font-size: 12px;
                		      color: #777777;
                		      text-align: center;
                		      background-color: #fafafa;
                		    }
                		    .link {
                		      word-break: break-all;
                		      color: #4f46e5;
                		    }
                		  </style>
                		</head>
                		<body>
						
                		  <div class="container">
                		    <div class="header">
                		      <h1>Prisma Blog</h1>
                		    </div>
						
                		    <div class="content">

                		      <p>Hello ${user.name}</p>
						
                		      <p>
                		        Thanks for signing up for <strong>Prisma Blog</strong>!  
                		        Please confirm your email address by clicking the button below.
                		      </p>
						
                		      <div class="button-wrapper">
                		        <a href="${verificationUrl}" class="verify-button">
                		          Verify Email
                		        </a>
                		      </div>
						
                		      <p>
                		        If the button doesn’t work, copy and paste this link into your browser:
                		      </p>
						
                		      <p class="link">
                		        ${url}
                		      </p>
						
                		      <p>
                		        This link will expire in 24 hours.  
                		        If you didn’t create an account, you can safely ignore this email.
                		      </p>
						
                		      <p>
                		        — Prisma Blog Team
                		      </p>
                		    </div>
						
                		    <div class="footer">
                		      © 2026 Prisma Blog. All rights reserved.
                		    </div>
                		  </div>
						
                		</body>
                		</html>
                		`,
                });

                console.log("Message sent.", info.messageId);
            } 
            catch (error) {
                console.error(error);
                throw error;
            }
        },
    },

	socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});
