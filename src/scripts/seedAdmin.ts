import { prisma } from "../lib/prisma"
import { UserRole } from "../middlewares/auth"



async function seedAdmin () {
    try{
        const adminData = {
            name: "new Admin 3",
            email: "admin3@admin.com",
            role: UserRole.ADMIN,
            password: "admin1234",
        }
        // 1. check user existence
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email as string
            }
        });

        if(existingUser) {
            throw new Error("User already exists!");
        }

        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:4000",
            },
            body: JSON.stringify(adminData),
        })

        if(signUpAdmin.ok) {
            await prisma.user.update({
                where: {
                    email: adminData.email,
                },
                data: {
                    emailVerified: true
                }
            })
        }
        console.log(signUpAdmin);

    }
    catch(error) {
        console.error(error)
    }
}

seedAdmin();