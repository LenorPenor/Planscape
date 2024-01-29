import mongoose from "mongoose"

const listSchema = mongoose.Schema(
    {
        project:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },

        title:{
            type: String,
            required: [true, 'Please enter a project title']
        },
        
        tasks:{
            type: Array
        },

        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
    { timestamps: true },
    { collection: 'lists' }
)

export default mongoose.model('List', listSchema)
