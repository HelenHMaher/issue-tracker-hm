/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.MONGO_URI;


module.exports = function (app) {
  

  app.route('/api/issues/:project')
  
    .get(function (req, res, next){
      const project = req.params.project;
    
      MongoClient.connect(CONNECTION_STRING, (err, client) => {
        const db = client.db('issueTracker');
        if(err) {
        console.log('Database err: ' + err);
        } else {
        console.log('Successful database connection');
        }
      }) 
    })
    
    .post((req, res, next) => {
      const project = req.params.project;
      const issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }
      if(!issue.issue_title) {
        const err = new Error("missing issue_title");
        err.status = 400;
        return next(err);
      }
      if(!issue.issue_text) {
        const err = new Error("missing issue_text");
        err.status = 400;
        return next(err);
      }
      if(!issue.created_by) {
      const err = new Error("missing created_by");
      err.status = 400;
      return next(err);
      }
      MongoClient.connect(CONNECTION_STRING, (err, client) => {
        const db = client.db('issueTracker');
        if(err) {
        console.log('Database err: ' + err);
        } else {
        console.log('Successful database connection');
        db.collection('issues').insertOne(issue, (err, doc) => {
          res.json(issue);
        })
        }
      }) 
    })
    
    .put((req, res, next) => {
      const project = req.params.project;
      const issueId = req.body._id;
      const issue = req.body;
      delete issue._id;
      Object.keys(issue).map((key) => {if(issue.key === null) delete issue.key});
      if(Object.keys(issue).length === 0) {
        return res.send('no updated field sent');
      } else {
        issue.updated_on = new Date(Date.now);
        MongoClient.connect(CONNECTION_STRING, (err, client) => {
          const db = client.db('issueTracker');
          if(err) {
            console.log('Database err: ' + err);
          } else {
            console.log('Successful database connection');
            db.collection('issues').findOneAndUpdate({_id: issueId}, {$set: issue}, {new: true}, (err, doc) => {
              if (!err) {
                res.send('successfully updated');
              } else {
                const error = new Error(`could not update ${issueId} ${err}`);
                error.status = 400;
                next(error);
              }
            })
          }
        })
      }
    })
    
    .delete((req, res, next) => {
      res.status(200).send("works");
      const project = req.params.project;
      const issueId = req.body._id;
      if(issueId === null) {
        const err = new Error('_id error');
        err.status = 400;
        return next(err);
      } else {
        MongoClient.connect(CONNECTION_STRING, (err, client) => {
          const db = client.db('issueTracker');
          if(err) {
            console.log('Database err: ' + err);
          } else {
            console.log('Successful database connection');
            db.collection('issues').findAndRemove({_id: issueId}, (err, doc) => {
              if(err) {
                const error = new Error(`could not delete ${issueId} ${err}`);
                return next(error);
              } else {
                res.send(`deleted ${issueId}`);
              }
            })
          }
        })
      }
    });
  
};