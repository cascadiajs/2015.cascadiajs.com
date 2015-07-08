var Hapi = require('hapi')
  , twilio = require('twilio')
  , restClient = new twilio.RestClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  , taskRouter = new twilio.TaskRouterClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

var commands = ['ACCEPT', 'DECLINE', 'CLOSE'];

var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: process.env.PORT
});

var organizers = {};
// cache the organizer/worker info
taskRouter.workspaces(process.env.TWILIO_WORKSPACE_SID).workers.get(function(err, res){
  res.workers.forEach(function(worker) {
    var worker = JSON.parse(worker.attributes);
    var key = worker['contact-uri'];
    organizers[key] = {};
    organizers[key]['worker'] = worker;
  });
  console.log(organizers);
});

var getActiveOrganizer = function(number) {
  var activeOrganizer;
  Object.keys(organizers).forEach(function(key) {
    if (organizers[key].task && organizers[key].task.from === number) {
      activeOrganizer = key;
    }
  });
  console.log("Worker for ", number, " is ", activeOrganizer);
  return activeOrganizer;
}

var processCommand = function(command, from) {
  var stash = organizers[from];
  if (command === 'ACCEPT') {
    stash['accepted'] = true;
    taskRouter.workspaces(process.env.TWILIO_WORKSPACE_SID).tasks(stash.taskSid).reservations(stash.reservationSid).post({ReservationStatus: 'accepted'}, function(err, res) { console.log(err, res); });
  }
  else if (command === 'DECLINE') {
    taskRouter.workspaces(process.env.TWILIO_WORKSPACE_SID).tasks(stash.taskSid).reservations(stash.reservationSid).post({ReservationStatus: 'rejected'}, function(err, res) { console.log(err, res); });
    organizers[from] = {};
  }
  else if (command === 'CLOSE') {
    taskRouter.workspaces(process.env.TWILIO_WORKSPACE_SID).workers(stash.workerSid).post({ActivitySid: process.env.TWILIO_ACTIVITY_IDLE_SID}, function(err, res) { console.log(err, res); })
    organizers[from] = {};
  }
};

var events = function(request, reply) {
   console.log("TaskRouter Event: ", request.payload);
};

var assignment = function(request, reply) {
   console.log(request.payload);
   // get task info
   var task = JSON.parse(request.payload.TaskAttributes);
   var worker = JSON.parse(request.payload.WorkerAttributes);
   
   // store some state!
   var key = worker['contact-uri'];
   organizers[key]['task'] = task;
   organizers[key]['worker'] = worker;
   organizers[key]['taskSid'] = request.payload.TaskSid;
   organizers[key]['reservationSid'] = request.payload.ReservationSid;
   organizers[key]['workerSid'] = request.payload.WorkerSid;

   var message = task.from+ ":\n\n"+task['body']+"\n\nReply with 'accept' or 'reject'";
   // send text to organizer
   restClient.messages.create({from: task['to'] , to: worker['contact-uri'], body: message});
   reply(JSON.stringify({})).type('application/json');
};

// Process incoming text messages
var sms = function(request, reply) {
  var twiml = new twilio.TwimlResponse();

  // check to see if the text is from an organizer
  if (Object.keys(organizers).indexOf(request.payload.From) >= 0) {
    var stash = organizers[request.payload.From];
    var command = request.payload.Body.toUpperCase().trim();

    // check to see if the message is a command
    if (commands.indexOf(command) >= 0) {
      processCommand(command, request.payload.From);
    }
    // if currently reserved, forward message to attendee
    else if (stash.accepted) {
      restClient.messages.create({from: request.payload.To, to: stash.task.from, body: stash.worker.name + ": " + request.payload.Body});
    }
    // send message to fellow organizers
    else {
      Object.keys(organizers).forEach(function(num) {
        if (num != request.payload.From) {
          restClient.messages.create({from: request.payload.To, to: num, body: organizers[request.payload.From].worker.name + ": " + request.payload.Body});
        }
      });
    }
  }
  else {
    var activeOrganizer = getActiveOrganizer(request.payload.From);
    // if this is brand-new, create task
    if (activeOrganizer === undefined) {
      var incomingText = {
        to: request.payload.To,
        from: request.payload.From,
        body: request.payload.Body
      };
      // post Task to TaskRouter
      console.log("Posting Task to TaskRouter");
      taskRouter.workspaces(process.env.TWILIO_WORKSPACE_SID).tasks.create({workflowSid: process.env.TWILIO_WORKFLOW_SID, attributes: JSON.stringify(incomingText)}, function(err, res) {console.log(err, res);});   
      // send response to end user
      twiml.message('We have received your request and will be in touch shortly.')

    }
    // else, send to active/assigned worker
    else {
      restClient.messages.create({from: request.payload.To, to: activeOrganizer, body: request.payload.From + ": " + request.payload.Body});
    }

  }

  
  reply(twiml.toString()).type('text/xml');
};

server.route({
    method: 'POST', path:'/events', handler: events
});

server.route({
    method: 'POST', path:'/assignment', handler: assignment
});

server.route({
    method: 'POST', path:'/sms', handler: sms
});

// Start the server
server.start();
console.log("Server started on port ", process.env.PORT);
