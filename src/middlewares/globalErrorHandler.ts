import { NextFunction, Request, Response } from "express"


export default function errorHandler(err:any, req:Request, res:Response, next:NextFunction) {
    res.status(500)
    res.json({
        message: "Error from global error handler!",
        error: err
    })
}

