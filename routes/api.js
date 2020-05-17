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
      const searchQ = req.query;
      if(searchQ.open) {
        searchQ.open = searchQ.open.toLowerCase();
      }
      if(searchQ._id) searchQ._id = new ObjectId(searchQ._id);
      if(searchQ.created_on) searchQ.created_on = new Date(searchQ.created_on);
      if(searchQ.updated_on) searchQ.updated_on = new Date(searchQ.updated_on);
      Object.keys(searchQ).map((x) => {if(searchQ[x] === "") delete searchQ[x]});
      console.log(searchQ);
      MongoClient.connect(CONNECTION_STRING, (err, client) => {
        const db = client.db('issueTracker');
        if(err) {
        console.log('Database err: ' + err);
        } else {
        console.log('Successful database connection');
        db.collection('issues').find(searchQ).toArray((err, docs) => {
          if(err) return next(err);
          res.send(docs)
        })
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
        open: "true"
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
      Object.keys(issue).map((x) => {if(issue[x] === "") delete issue[x]});
      //console.log(issue);
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
            db.collection('issues').findOneAndUpdate({_id: new ObjectId(issueId)}, {$set: issue}, {new: true}, (err, doc) => {
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
      const project = req.params.project;
      const issueId = req.body._id;
      console.log(req.params.project);
      if(!issueId || issueId.length !== 24) {
        return res.send("_id error");
      } else {
        MongoClient.connect(CONNECTION_STRING, (err, client) => {
          const db = client.db('issueTracker');
          if(err) {
            console.log('Database err: '+err);
          } else {
            console.log('Successful database connection');
            db.collection('issues').findOneAndDelete({_id:new ObjectId(issueId)}, (err, doc) => {
              if(err) {
                res.send(`could not delete ${issueId} ${err}`);
              } else {
                doc.value ? res.send(`deleted ${issueId}`) : res.send(`could not find ${issueId}`);
              }
            })
          }
        })
      }
    });
  
};