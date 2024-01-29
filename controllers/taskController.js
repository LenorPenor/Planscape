import {URGENCY_VALUES, Task} from '../models/taskModel.js'
import List from '../models/listModel.js'

// create task inside of a list (inside of a project)
// @ /api/tasks/:listId
// private
export const setTask = async (req, res) => {
    try {                                                                                                           //try
        const {title, description, urgency, dueDate} = req.body                                                         //get data input from body

        if(!title || (title && !/^\s*[^\s].*$/.test(title))){                                                           //if no title has been added to project
            res.status(400).json({error: 'Please add a title to your task.'})                                               //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        if(title.length > 40){                                                                                          //if title is longer than allowed
            res.status(400).json({error: 'Title cannot be longer than 40 characters'})                                      //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        if(description && description.length > 300){                                                                    //if there's a description and its longer than 300 chars
            res.status(400).json({error: 'Description cannot be longer than 300 characters.'})                              //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        if(!URGENCY_VALUES.includes(req.body.urgency)){                                                                 //if the urgency type is invalid
            res.status(400).json({error: 'Urgency type invalid'})                                                           //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        const taskList = await List.findById(req.params.listId)                                                         //get the list in which the task is being created (to get access to the project id)

        const task = await Task.create({                                                                                //create task with input-data + list id, project id & user id
            title,
            description,
            list: req.params.listId,
            urgency,
            dueDate,
            done: false,
            user: req.user.id,
            project: taskList.project,
        })

        if(task){                                                                                                       //if task was created
            await List.updateOne({_id: task.list}, { $push: { tasks: task._id } })                                          //push it into Lists Task-Array

            res.status(201).json(task)                                                   //send status 201 (created) + created Task
            console.log('Task with id '.blue + task._id +                                                                 //log success message
                        ' has been added to list with id '.blue + task.list)
        }

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// update task + update it in Lists Task-Array
// @ /api/tasks/:id
// private
export const updateTaskDoneState = async (req, res) => {
    try {                                                                                                           //try
        const task = Task.findById(req.params.id)                                                                       //find task with id from params
        if(!task){                                                                                                      //if there's no task
            res.status(404).json({error: 'Task not found'})                                                                 //send status 400 (bad request) + error message
            return                                                                                                          //return
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true})                          //update task
        res.status(200).json({updatedTask})                                                                             //send status 200 (ok) + updated Task
        console.log("Updated tasks done-state with id ".blue + req.params.id)                                             //Log success message

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

export const updateTaskPosition = async (req, res) => {
    try {                                                                                                           //try
        const task = Task.findById(req.params.id)                                                                       //find task with id from params
        if(!task){                                                                                                      //if there's no task
            res.status(404).json({error: 'Task not found'})                                                                 //send status 400 (bad request) + error message
            return                                                                                                          //return
        }

        if(req.params.list != task.list){                                                                               //if list from params is not the same as tasks list-value
            await List.updateOne({_id: task.list}, {$pull: {tasks: task._id}})                                              //pull task from list
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true})                          //update task
        res.status(200).json(updatedTask)                                                                             //send status 200 (ok) + updated Task
        console.log("Updated task position of task with id ".blue + req.params.id)                                             //Log success message

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

export const updateTask = async (req, res) => {
    try {                                                                                                           //try
        const {taskId} = req.params
        const {title, description} = req.body                                                                           //get data input from body

        if(!title || (title && !/^\s*[^\s].*$/.test(title))){                                                           //if no title has been added to project
            res.status(400).json({error: 'Please add a title to your task.'})                                               //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        if(title.length > 40){                                                                                          //if title is longer than allowed
            res.status(400).json({error: 'Title cannot be longer than 40 characters'})                                      //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        if(description && description.length > 300){                                                                    //if there's a description and its longer than 300 chars
            res.status(400).json({error: 'Description cannot be longer than 300 characters.'})                              //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        const task = Task.findById(req.params.id)                                                                       //find task with id from params
        if(!task){                                                                                                          //if there's no task
            res.status(404).json({error: 'Task not found'})                                                                 //send status 400 (bad request) + error message
            return                                                                                                          //return
        }
        const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {new: true})                          //update task
        res.status(200).json(updatedTask)                                                                                 //send status 200 (ok) + updated task
        console.log("Updated task with id ".blue + taskId)                                                         //Log success message

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// delete task + delete it from Lists Task-Array
// @ /api/tasks/:id
// private
export const deleteTask = async (req, res) => {
    try {                                                                                                           //try
        const task = await Task.findById(req.params.id)                                                                       //find task with id from params
        if(!task){                                                                                                      //if there's no task
            res.status(404).json({error: 'Task not found'})                                                                 //send status 400 (bad request) + error message
            return                                                                                                          //return
        }
        await List.updateOne({_id: task.list}, {$pull: {tasks: task._id}})                                              //pull task from lists Task-Array
        await task.remove()                                                                                             //delete task

        res.status(200).json({message: "Successfully deleted a task."})                                                 //send status 200 (ok) + success message
        console.log("Deleted a task ".blue)                                                                           //Log success message

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// get all tasks in a list
// @ /api/tasks/:listId
// private
export const getTasks = async (req, res) => {
    try {                                                                                                           //try
        const taskIds = (await List.findById(req.params.listId)).tasks                                                  //get task Ids
        const tasks = await Promise.all(taskIds.map(id => Task.findById(id)))                                           //get tasks

        res.status(200).json(tasks)                                                                                     //send status 200 (ok) + tasks
        console.log('Getting tasks from list with id '.blue + req.params.listId)                                      //log success messsage

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

export const getTasksInProject = async (req, res) => {
    try {                                                                                                           //try
        const tasks = await Task.find({project: req.params.projectId})                                                  //get tasks

        if(tasks){
            res.status(200).json(tasks)                                                                                     //send status 200 (ok) + tasks
            console.log('Getting tasks from project with id '.blue + req.params.projectId)                                //log success messsage
        }

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// get one specific task
// @ /api/tasks/task/:taskId
// private
export const getTask = async (req, res) => {
    try {                                                                                                           //try
        const task = await Task.find({_id: req.params.taskId})                                                          //get tasks
        if(!task){                                                                                                      //if there's no tasks
            res.status(404).json({error: 'Task not found.'})                                                                 //send status 400 (Bad request) + error message
            return                                                                                                          //return
        }

        res.status(200).json(task)                                                                                      //send status 200 (ok) + tasks
        console.log('Getting task with id '.blue + req.params.taskId)                                                 //log success messsage

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// get all tasks from a user
// @ /api/tasks/
// private
export const getAllTasks = async (req, res) => {
    try {                                                                                                           //try
        const tasks = await Task.find({user: req.user.id})                                                              //get tasks
        if(!tasks){                                                                                                     //if there's no tasks
            res.status(400).json({error: 'No tasks found.'})                                                                //send status 400 (Bad request) + error message
            return                                                                                                          //return
        }
        
        res.status(200).json(tasks)                                                                                     //send status 200 (ok) + tasks
        console.log('Getting all tasks from user with id '.blue + req.user.id)                                        //log success messsage

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}