import Project from '../models/projectModel.js'
import User from '../models/userModel.js'
import List from '../models/listModel.js'
import { Task } from '../models/taskModel.js'

// create project
// @ /api/projects
// private
export const setProject = async (req, res) => {
    try {                                                                                                           //try
        const {title} = req.body                                                                                        //get title input from body
        if(!title || (title && !/^\s*[^\s].*$/.test(title))){                                                               //if no title has been added to project
            res.status(400).json({error: 'Please add a title to your project.'})                                            //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        if(title.length > 20){                                                                                          //if title is longer than allowed
            res.status(400).json({error: 'Title cannot be longer than 20 characters'})                                      //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        const project = await Project.create({                                                                          //create project with title and user id
            title: req.body.title,
            user: req.user.id
        })
    
        if(project){                                                                                                    //if project was created
            res.status(200).json({createdProject: {project}})                                                               //send status 200 (ok) and project data
            console.log('User with id '.yellow + req.user.id + ' created a project.'.yellow)                                //log success message
        }

    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// get projects from user (with auth token)
// @ /api/projects
// private
export const getProjects = async (req, res) => {
    try {                                                                                                           //try
        const projects = await Project.find({user: req.user.id})                                                        //find projects where user equals token user
        if(!projects){                                                                                                   //if there's no projects
            res.status(404).json({error: 'No projects found.'})                                                             //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        res.status(200).json(projects)                                                                                  //send status 200 (ok) and projects
        console.log('Getting projects from user with id '.yellow + req.user.id)                                         //log success messsage

    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }

}

// get single project
// @ /api/projects/:id
// private
export const getProject = async (req, res) => {
    try {                                                                                                           //try
        const project = await Project.findOne({_id: req.params.id})                                                     //find project with id that matches id from params
        if(!project){                                                                                                   //if there's no projects
            res.status(404).json({error: 'Project not found.'})                                                             //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        res.status(200).json(project)                                                                                   //send status 200 (ok) and project
        console.log('Getting project with id '.yellow + project.id +                                                    //log success message
        ' (' + project.title + ') ' + 'from user with id '.yellow + req.user.id)
        
    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// update project
// @ /api/projects/:id
// private
export const updateProject = async (req, res) => {
    try {                                                                                                           //try
        const {title} = req.body                                                                                        //get title input from body
        if(!title || (title && !/^\s*[^\s].*$/.test(title))){                                                                                                     //if no title has been added to project
            res.status(400).json({error: 'Please add a title to your project.'})                                            //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        if(title.length > 20){                                                                                          //if title is longer than allowed
            res.status(400).json({error: 'Title cannot be longer than 20 characters'})                                      //send 400 status (bad request) and error message
            return                                                                                                          //return
        }

        const project = await Project.findById(req.params.id)                                                           //find project with id that matches id from params
        if(!project){                                                                                                   //if there's no project with a matching id
            res.status(404).json({error: 'Project not found'})                                                              //send status 400 (bad request) and error message
            return                                                                                                          //return
        }

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {new: true})                    //update project
        res.status(200).json({updatedProject})                                                                          //send status 200 (ok) and updated project
        console.log("Updated project with id ".yellow + project.id)                                                     //log success message

    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// delete project
// @ /api/projects/:id
// private
export const deleteProject = async (req, res) => {
    try {                                                                                                           //try
        const project = await Project.findById(req.params.id)                                                           //find project with id that matches id from params
        if(!project){                                                                                               //if there's no project with a matching id
            res.status(404).json({error: 'Project not found'})                                                          //send status 400 (bad request) and error message
            return                                                                                                      //return
        }

        await List.deleteMany({project: project._id})                                                               //delete projects lists
        await Task.deleteMany({project: project._id})                                                               //delete projects tasks
        await project.remove()                                                                                      //delete project

        res.status(200).json({message: `deleted project '${project.title}' with id '${project.id}'`})               //send status 200 (ok) and success message
        console.log("Deleted project with id ".yellow + project.id)                                                 //log success message
        
    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}

// get project stats
// @ /api/projects/:id/stats
// private
export const getStats = async (req,res) => {
    try {                                                                                                           //try
        const projectId = req.params.id                                                                                 //get project id from params
        const totalTasks = await Task.count({project: projectId})                                                           //get project tasks
        const completedTasks = await Task.count({project: projectId, done: true})                                           //get completed tasks
        const openTasks = totalTasks - completedTasks                                                                       //get open tasks
        const overdueTasks = await Task.count({project: projectId, done: false , dueDate: {$lte:(new Date()).toISOString()}}) //get overdue tasks
        res.status(200).json({totalTasks, completedTasks, openTasks, overdueTasks})                                         //send tasks
        console.log('Getting Project-Stats.'.yellow)

    } catch (error) {                                                                                               //catch
        res.status(500).json({error: 'Internal Error.'})                                                                //set status 500 (server error)
        console.log(error.toString().red.underline)                                                                     //log error
    }
}