import mongoose from "mongoose"

export const URGENCY_VALUES = ['not urgent', 'slightly urgent', 'urgent', 'very urgent']

const taskSchema = mongoose.Schema(
    {
        list:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'List',
            required: true
        },

        project:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },

        title:{
            type: String,
            required: [true, 'Please name your task']
        },

        description:{
            type: String
        },

        urgency:{
            type: String,
            enum: URGENCY_VALUES
        },

        dueDate:{
            type: Date,
            // min: Date.now()
        },

        done:{
            type: Boolean,
            default: false,
            required: true
        },
        
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
    { timestamps: true },
    { collection: 'tasks' }
)

export const Task = mongoose.model('Task', taskSchema)