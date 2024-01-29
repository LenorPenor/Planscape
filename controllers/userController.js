//external
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

//internal
import User from '../models/userModel.js'
import Project from '../models/projectModel.js'
import List from '../models/listModel.js'
import { Task } from '../models/taskModel.js'

import sendEmailReset from '../config/sendMail.js'

// register User
// @ /api/users
// public
export const registerUser = async (req, res) => {
    try {                                                                                                           //try
        const {username, email, password, passwordRp, firstname, lastname} = req.body                                   //get data from body
        let isValid = true                                                                                              //to check if data is valid

        //check if all fields are filled out
        if(!username || !email || !password || !firstname || !lastname || !passwordRp){                                 //if any required field is empty
            res.status(400).json({error: 'Please fill out all fields.'})                                                    //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //check if fields only contain of spaces
        if((username && !/^\s*[^\s].*$/.test(username)) || (email && !/^\s*[^\s].*$/.test(email)) || (password && !/^\s*[^\s].*$/.test(password)) || (firstname && !/^\s*[^\s].*$/.test(firstname)) || (lastname && !/^\s*[^\s].*$/.test(lastname)) || (passwordRp && !/^\s*[^\s].*$/.test(passwordRp))){
            res.status(400).json({error: 'Please fill out all fields.'})                                                    //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        const userEmailExists = await User.findOne({email})                                                             //to check if input email already exists
        const usernameExists = await User.findOne({username})                                                           //to check if input username already exists

        //check if username exists already
        if(usernameExists){                                                                                             //if username exists already
            res.status(403).json({error: 'Username already exists.'})                                                       //send 403 status (forbidden) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return

        }

        //check if email exists already
        if(userEmailExists){                                                                                            //if email exists already
            res.status(403).json({error: 'There is already an account using this email address.'})                          //send 403 status (forbidden) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return

        }

        //check if username is valid
        if(!/^[a-zA-Z0-9_]+$/.test(username)){                                                                          //if username contains forbidden characters
            res.status(400).json({error: 'Username can only contain english letters and underscores.'})                     //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }
        //check if first and lastname are valid
        if(!/^[\p{L}]+(-[\p{L}]+)*$/u.test(firstname) || !/^[\p{L}]+(-[\p{L}]+)*$/u.test(lastname)){                    //if first- or lastname contain forbidden characters
            res.status(400).json({error: 'First- and last name can only contain letters and hyphens between letters.'})     //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        if(username.length > 20){                                                                                       //if username is longer than allowed
            res.status(400).json({error: 'Username cannot be longer than 20 characters'})                                   //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        if(firstname.length > 20){                                                                                      //if firstname is longer than allowed
            res.status(400).json({error: 'First name cannot be longer than 20 characters'})                                 //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        if(lastname.length > 20){                                                                                      //if lastname is longer than allowed
            res.status(400).json({error: 'Last name cannot be longer than 20 characters'})                                 //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //check if email is valid
        if(!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)){                        //if email is invalid
            res.status(400).json({error: 'Invalid email address.'})                                                         //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //check if password is valid
        if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)){                     //if password is invalid
            res.status(400).json({                                                                                          //send 400 status (bad request) and error message
                error:
                `Password must contain a minimum of 8 characters, 
                at least one uppercase letter, 
                one lowercase letter, 
                one number and 
                one special character.`
            })
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //ckeck if password and confirm password inputs match
        if(password !== passwordRp){                                                                                    //if passwords don't match
            res.status(400).json({error: 'Passwords do not match.'})                                                        //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        if(isValid){                                                                                                    //if data is valid
            const salt = await bcrypt.genSalt(10)                                                                           //generate salt
            const hashedPassword = await bcrypt.hash(password, salt)                                                        //hash password

            const user = await User.create({                                                                                //create user with input data
                username,
                firstname,
                lastname,
                email,
                password: hashedPassword
            })
    
            if(user){                                                                                                   //if user was created
                const token = generateToken(user._id)                                                                       //generate access token
                res.status(201)                                                                                             //send status 201 (created)
                .cookie(                                                                                                    //send token as cookie
                    "token", 
                    token, 
                    {
                        domain: 'localhost:3000',
                        path: '/',
                        httpOnly: true,
                        expires: new Date(Date.now() + 900000),
                    }
                )
                .json({                                                                                                     //send user data
                    _id: user.id,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    token: token
                })
    
                console.log('Created user: '.green + user.username)                                                        //log success message

            }else{                                                                                                      //if user was not created
                res.status(400).json({error: 'Invalid User Data'})                                                          //send status 400 (bad request) and error message
                return
            }
        }
        
    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// login User
// @ /api/users/login
// public
export const loginUser = async (req, res) => {
    try {                                                                                                           //try
        const {username, password} = req.body                                                                           //get username and password from body
        const user = await User.findOne({username})                                                                     //check if input user exists in db

        if(user && (await bcrypt.compare(password, user.password))){                                                    //if theres a user with that username & if passwords match (compare hashed password from db with plain text password from input to see if they match)
            const token = generateToken(user._id)                                                                           //generate access token
            res.status(200)                                                                                                 //send status 200 (ok)
            .cookie(                                                                                                        //send token as cookie
                "token",
                token, 
                {
                    domain: 'localhost:3000',
                    path: '/',
                    httpOnly: true,
                    expires: new Date(Date.now() + 900000),
                }
            )
            .json({                                                                                                         //send user data
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                    token: token
                })

            console.log('login successful.')                                                                                //log success message

        }else{                                                                                                          //if passwords dont match or username doesn't exist
            res.status(400).json({error: 'Invalid username or password.'})                                                  //send error message
        }
    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// update User
// @ /api/users/:id
// private
export const updateUser = async (req, res) => {
    try {                                                                                                           //try
        const {id} = req.params                                                                                         //get user id from params
        const {username, firstname, lastname, password, email} = req.body                                               //get update data from body

        const userEmailExists = await User.findOne({email})                                                             //to check if input email already exists
        const usernameExists = await User.findOne({username})                                                           //to check if input username already exists

        const currentUser = await User.findById(id)                                                                     //get current user data
        const currentPassword = currentUser.password                                                                    //get current user password

        let isValid = true                                                                                              //to check if data is valid

        //VALIDATION ------------------------------------------------------------
        //check if all fields are filled out
        if(!username || !firstname || !lastname || !email){                                                             //if any required field is empty
            res.status(400).json({error: 'Please fill out all fields.'})                                                    //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //check if fields only contain of spaces
        if((username && !/^\s*[^\s].*$/.test(username)) || (email && !/^\s*[^\s].*$/.test(email)) || (firstname && !/^\s*[^\s].*$/.test(firstname)) || (lastname && !/^\s*[^\s].*$/.test(lastname))){
            res.status(400).json({error: 'Please fill out all fields.'})                                                    //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //check if username exists already
        if(usernameExists && usernameExists._id != id){                                                                 //if username exists already (and its not your own current username)
            res.status(403).json({error: 'Username already exists.'})                                                       //send 403 status (forbidden) and send error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return

        }

        //check if email exists already
        if(userEmailExists && userEmailExists._id != id){                                                               //if email exists already (and its not your own current email)
            res.status(403).json({error: 'There is already an account using this email address.'})                          //send 403 status (forbidden) and send error message                       //throw error
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return

        }

        //check if username is valid
        if(!/^[a-zA-Z0-9_]+$/.test(username)){                                                                          //if username contains forbidden characters
            res.status(400).json({error: 'Username can only contain english letters and underscores.'})                     //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        if(username.length > 20){                                                                                      //if username is longer than allowed
            res.status(400).json({error: 'Username cannot be longer than 20 characters'})                                 //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        if(firstname.length > 20){                                                                                      //if firstname is longer than allowed
            res.status(400).json({error: 'First name cannot be longer than 20 characters'})                                 //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        if(lastname.length > 20){                                                                                      //if lastname is longer than allowed
            res.status(400).json({error: 'Last name cannot be longer than 20 characters'})                                  //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //check if first and lastname are valid
        if(!/^[\p{L}]+(-[\p{L}]+)*$/u.test(firstname) || !/^[\p{L}]+(-[\p{L}]+)*$/u.test(lastname)){                    //if first- or lastname contain forbidden characters
            res.status(400).json({error: 'First- and last name can only contain letters and hyphens between letters.'})     //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //check if email is valid
        if(!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)){                        //if email is invalid
            res.status(400).json({error: 'Invalid email address.'})                                                         //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //check if password is valid
        if(!password){                                                                                                  //if password input is empty
            res.status(400).json({error: 'Please enter your password.'})                                                    //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        //check if passwords match
        if(await bcrypt.compare(password, currentPassword) === false){                                                  //if password input doesn't match password in db
            res.status(400).json({error: 'Incorrect password.'})                                                            //send 400 status (bad request) and error message
            isValid = false                                                                                                 //set isValid to false
            return                                                                                                          //return
        }

        if(isValid){                                                                                                    //if data is valid
            const updatedUser = await User.updateOne({_id: id}, {username, firstname, lastname, email})                     //update user
    
            if(updatedUser.matchedCount > 0){                                                                           //if user was updated
                res.status(200).json({message: 'user ' + username + ' updated'})                                            //send success message
                console.log('user ' + username + ' updated'.green)                                                         //log success message
            }else{                                                                                                      //if not
                res.json(400)({error: 'user not updated'})                                                                  //send error message
                return
            }
        }
    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// delete User
// @ /api/users/:id
// private
export const deleteUser = async (req, res) => {
    try {                                                                                                           //try
        const {id} = req.params                                                                                         //get user id from params
        const user = await User.findOne({_id: id})                                                                      //get user with user id from params

        const {password} = req.body
        if(!password){
            res.status(400).json({error: 'Please enter your password.'})                                                            //send 400 status (bad request) and error message
            return                                                                                                          //return
        }
        
        if(user){                                                                                                       //if user exists
            await Project.deleteMany({user: id})                                                                            //delete users projects
            await List.deleteMany({user: id})                                                                               //delete users lists
            await Task.deleteMany({user: id})                                                                               //delete users tasks

            res.status(200).json({message: `deleted user '${user.username}'`})                                              //send success message
            console.log('Deleted user: '.green + user.username)                                                            //Log success message

            user.remove()                                                                                                   //delete user

        }else{                                                                                                          //if user does not exist
            res.status(400).json({error: "user doesn't exist"})                                                             //send error message
        }
    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //send status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// get specific user-profile
// @ /api/users/:id
// public
export const getUser = async(req, res) => {
    try {                                                                                                           //try
        const {id} = req.params                                                                                         //get user id from params
        const user = await User.findOne({_id: id})                                                                      //get user with user id from params

        if(user){                                                                                                       //if user exists
            res.status(200).json({username: user.username, firstname: user.firstname,                                       //send user data
            lastname: user.lastname, email: user.email})
            console.log('Getting user: '.green + user.username)                                                            //log success message
        }else{                                                                                                          //if user does not exist
            res.status(404).json({error: `user not found`})                                                            //send error
        }
    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //send status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// send mail if user forgot password
//@ /api/users/reset-password
//private
export const forgotPassword = async(req,res) => {
    try {                                                                                                           //try
        const { email } = req.body                                                                                      //get email input from body, so server can send reset link

        if(!email){                                                                                                     //if email input is empty
            res.status(400).json({error: 'Please enter your e-mail address.'})                                              //send error message
            return
        }

        const user = await User.findOne({email})                                                                    //check if email exists by looking for user with email in db

        if(!user){                                                                                                   //if it exists
            res.status(400).json({error: "An Account with this email address doesn't exist."})                          //send error message
            return
        }

        const token = generateToken(user._id)                                                                       //generate access token
            
        const url = `http://localhost:3000/reset-password/${token}`                                                 //declare url for password reset link
        const name = user.firstname                                                                                 //get users name
        sendEmailReset(email, url, 'Reset your Password', name)                                                     //send email

        res.status(200).json({message: 'We have sent you an email with a link to reset your password.'})            //send success message

    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //send status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// reset password if user forgot it
//@ /api/users/:id
//private
export const resetPassword = async(req,res) => {
    try {                                                                                                           //try
        const {password, passwordRp} = req.body                                                                                     //get new password

        //check if password is valid
        if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)){                     //if password is invalid
            res.status(400).json({                                                                                          //send 400 status (bad request) and error message
                error:
                `Password must contain a minimum of 8 characters, 
                at least one uppercase letter, 
                one lowercase letter, 
                one number and 
                one special character.`
            })
            return                                                                                                          //return
        }

        //ckeck if password and confirm password inputs match
        if(password !== passwordRp){                                                                                    //if passwords don't match
            res.status(400).json({error: 'Passwords do not match.'})                                                        //send 400 status (bad request) and error message                                                                                                //set isValid to false
            console.log(password, passwordRp)
            return                                                                                                          //return
        }

        const salt = await bcrypt.genSalt(10)                                                                           //generate salt
        const hashedPassword = await bcrypt.hash(password, salt)                                                        //hash password

        await User.findOneAndUpdate({_id: req.user.id},{password: hashedPassword})                                      //update password in Db
        res.status(200).json({message: 'Password was updated successfully.'})                                           //send success message

    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                 //send status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

//generate a JWT
export const generateToken = (id) => {                                                                              //generate jwt Token function with user id as param
    return jwt.sign(
        {id}, 
        process.env.JWT_SECRET,
        {expiresIn: '30d'}
    )
}