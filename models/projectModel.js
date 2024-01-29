import mongoose from "mongoose"

const projectSchema = mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        title:{
            type: String,
            required: [true, 'Please enter a project title']
        },
        
        lists:{
            type: Array
        }
    },
    { timestamps: true },
    { collection: 'projects' }
)

export default mongoose.model('Project', projectSchema)