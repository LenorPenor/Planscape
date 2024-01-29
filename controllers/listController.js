import List from '../models/listModel.js'
import { Task } from '../models/taskModel.js'
import Project from '../models/projectModel.js'

// create list inside of a project
// @ /api/lists/:projectId
// private
export const setList = async (req, res) => {
    try {                                                                                                           //try
        const {title} = req.body 
        if(!title || (title && !/^\s*[^\s].*$/.test(title))){                                                           //if no list-title has been added
            res.status(400).json({error: 'Please add a title to your list.'})                                               //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        if(req.body.title.length > 20){                                                                                 //if title is longer than allowed
            res.status(400).json({error: 'Title cannot be longer than 20 characters'})                                      //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        const list = await List.create({                                                                                //create new List with title and id of the project & user
            title: req.body.title,
            project: req.params.projectId,
            user: req.user.id
        })

        if(list){                                                                                                       //if list was created
            await Project.updateOne({_id: list.project}, { $push: { lists: list._id } })                                    //push new list into lists-array from project

            res.status(200).json(list)                                                                     //send status 200 (ok) + created List
            console.log('List with id '.magenta + list.id +                                                                  //log success message
                        ' has been added to project with id '.magenta + list.project)
        }

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// update list inside of a project
// @ /api/lists/:id
// private
export const updateList = async (req, res) => {
    try {                                                                                                           //try
        const {title} = req.body                                                                                        //get title input from body
        if(!title || (title && !/^\s*[^\s].*$/.test(title))){                                                           //if no list-title has been added
            res.status(400).json({error: 'Please add a title to your list.'})                                               //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        if(title.length > 20){                                                                                          //if title is longer than allowed
            res.status(400).json({error: 'Title cannot be longer than 20 characters'})                                      //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        const list = await List.findById(req.params.id)                                                                 //get list with id from params
        if(!list){                                                                                                      //if there's no list with a matching id
            res.status(404).json({error: 'List not found'})                                                                 //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        const updatedList = await List.findByIdAndUpdate(req.params.id, req.body, {new: true})                          //update list
        res.status(200).json(updatedList)                                                                                 //send status 200 (ok) + success message
        console.log("Updated list with id ".magenta + list.id)                                                               //log success message

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// update lists task order if task is being dragged to another position
// @ /api/lists/:id/reorder
// private
export const updateListOrder = async (req, res) => {
    try {                                                                                                           //try
        const task = await Task.findById(req.body.taskId)                                                               //get task that is being dragged
        
        const draggedTask = await List.updateOne({_id: task.list}, {$pull: {tasks: task._id}})                          //remove it from its current position in Lists Task-Array
        if(draggedTask){
            await List.updateOne({_id: req.params.id}, {$push: {tasks: {$each: [task._id], $position: req.body.taskIndex}}})//add it into the Lists Task-Array on its new position
            res.status(200).json({task})                                                                                    //send status 200 (ok) + task
            console.log("Updated list order of list with id ".magenta + task.list)                                           //log success message
        }
        
    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// delete list inside of a project
// @ /api/lists/:id
// private
export const deleteList = async (req, res) => {
    try {                                                                                                           //try
        const list = await List.findById(req.params.id)                                                                 //get list with id from params
        if(!list){                                                                                                      //if there's no list with that id
            res.status(404).json({error: 'List not found'})                                                                 //send status 400 (bad request) + error message
            return                                                                                                          //return
        }

        await Project.updateOne({_id: list.project}, {$pull: {lists: list._id}})                                        //remove list from Projects List-Array
        await Task.deleteMany({list: list._id})                                                                         //delete Tasks that belong to list
        await list.remove()                                                                                             //delete List
    
        res.status(200).json({message: "deleted a list"})                                                               //send status 200 (ok) + success message
        console.log("Deleted a list".magenta)                                                                                   //log success message

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// get all lists inside of a project
// @ /api/lists/:projectId
// private
export const getLists = async (req, res) => {
    try {                                                                                                           //try
        const lists = await List.find({project: req.params.projectId})                                                  //find lists where project = project id from params
        if(!lists){                                                                                                     //if there's no lists
            res.status(404).json({error: 'No lists found.'})                                                                //send status 400 (bad request) + error message
            return                                                                                                          //return
        }
        res.status(200).json(lists)                                                                                     //send status 200 (ok) + lists
        console.log('Getting lists from project with id '.magenta + req.params.projectId)                                //log success messsage

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

export const getList = async (req, res) => {
    try {                                                                                                           //try
        const list = await List.findById(req.params.listId)                                                  //find lists where project = project id from params
        if(!list){                                                                                                     //if there's no lists
            res.status(404).json({error: 'No list found.'})                                                                //send status 400 (bad request) + error message
            return                                                                                                          //return
        }
        res.status(200).json(list)                                                                                     //send status 200 (ok) + lists
        console.log('Getting list with id '.magenta + req.params.listId)                                //log success messsage

    } catch (error) {                                                                                               //catch
        res.status(500)                                                                                                 //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}