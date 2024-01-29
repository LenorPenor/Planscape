import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

//user gets access to their token upon registration and login
export const protect = async (req, res, next) => {                                          //protect function, to require token for data-access
        let token                                                                               //create token

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){        //if theres auth and it starts with Bearer (jwt tokens start with Bearer)
            try {                                                                                   //try
                token = req.headers.authorization.split(' ')[1]                                         //get token from headers, split it at space and get index 1 (to remove 'Bearer')
                const decoded = jwt.verify(token, process.env.JWT_SECRET)                               //verify token

                req.user = await User.findById(decoded.id).select('-password')                          //get user that the token belongs to

                next()                                                                                  //call next

            } catch (error) {                                                                       //catch
                console.log(error)                                                                      //log error
                res.status(401).json({error: 'not authorized, invalid token'})                          //send 401 status (unauthorized) and error message
            }
        }

        if(!token){                                                                             //if there's no token
            res.status(401).json({error: 'not authorized, no token'})                               //send 401 status (unauthorized) and error message
        }
}