import app from "./app";
import { prisma } from "./lib/prisma"

const PORT = process.env.PORT || 3000;

async function main() {
    try{
        await prisma.$connect()
        console.log("Connected to Database Successfully");

        // now connect the app
        app.listen(PORT, ()=>{
            console.log(`Server is running on PORT : ${PORT}`);
        })
    }
    catch(error) {
        console.error("An Error Occured : ", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();