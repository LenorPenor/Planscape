import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
    {
        firstname: {                                                 //firstname
            type: String,                                               //type string
            required: [true, 'Please enter your first name']            //required field
        },

        lastname: {                                                 //lastname
            type: String,                                               //type string
            required: [true, 'Please enter your last name']             //required field
        },

        username: {                                                 //username
            type: String,                                               //type string
            required: [true, 'Please enter a username']                 //required field
        },

        email: {                                                    //user email
            type: String,                                               //type string
            required: [true, 'Please enter an email'],                  //required field
            unique: true                                                //unique field
        },

        password: {                                                 //user password
            type: String,                                               //type string
            required: [true, 'Please enter a password']                 //required field
        },
        
    },
    { timestamps: true },
    { collection: 'users' }
)

export default mongoose.model('User', userSchema)