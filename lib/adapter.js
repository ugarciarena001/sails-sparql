//(function (root, factory) {
//  "use strict";
//
//  if (typeof exports === "object") {
//    // NodeJS. Does not work with strict CommonJS, but
//    // only CommonJS-like enviroments that support module.exports,
//    // like Node.
//    module.exports = factory(require("stardog"), require("expect"));
//  } else if (typeof define === "function" && define.amd) {
//    // AMD. Register as an anonymous module.
//    define(["stardog", "expect"], factory);
//  } else {
//    // Browser globals (root is window)
//    root.returnExports = factory(root.Stardog, root.expect);
//  }
//}(this, function (Stardog, expect) {
//  "use strict";

var Stardog = require('stardog'),
    shortid = require('shortid');


var insert = function(values, cb) {

  var default_prefix = "mb:";
  var id = shortid.generate();
  id = default_prefix + "n." + id;

  var query = "INSERT {\n";
  query += id + " ";

  // Query Builder
  for (value in values) {
    console.log(value)
    query += default_prefix + 'models.' + collection + '.properties.' + value + ' "' + values[value] + '";\n'
  }

  query += "} WHERE { ?a ?b ?c }";

  var conn = new Stardog.Connection();
  conn.setEndpoint("http://localhost:5820/");
  conn.setCredentials("admin", "admin");

  conn.onlineDB({ database: "mindbabble", strategy: "NO_WAIT" }, function () {

    conn.query({
      database: "mindbabble",
      mimetype: "application/sparql-results+json",
      query: query,
      limit: 20,
      offset: 0
    }, function (data) {
      return cb(null, data);
    });
  });

}

  /**
   * waterline-sails-sparql
   *
   * Most of the methods below are optional.
   *
   * If you don't need / can't get to every method, just implement
   * what you have time for.  The other methods will only fail if
   * you try to call them!
   *
   * For many adapters, this file is all you need.  For very complex adapters, you may need more flexiblity.
   * In any case, it's probably a good idea to start with one file and refactor only if necessary.
   * If you do go that route, it's conventional in Node to create a `./lib` directory for your private submodules
   * and load them at the top of the file with other dependencies.  e.g. var update = `require('./lib/update')`;
   */
  module.exports = (function () {


    // You'll want to maintain a reference to each connection
    // that gets registered with this adapter.
    var connections = {};

    var defaults = {
      // change these to fit your setup
      protocol: 'http://',
      port: 5820,
      host: 'localhost',
      prefix: {
        abr: "mb",
        val: "http://mindbable.com"
      },
      debug: false

      // If setting syncable, you should consider the migrate option,
      // which allows you to set how the sync will be performed.
      // It can be overridden globally in an app (config/adapters.js) and on a per-model basis.
      //
      // drop   => Drop schema and data, then recreate it
      // alter  => Drop/add columns as necessary, but try
      // safe   => Don't change anything (good for production DBs)
      // migrate: 'alter'
    };




    // You may also want to store additional, private data
    // per-connection (esp. if your data store uses persistent
    // connections).
    //
    // Keep in mind that models can be configured to use different databases
    // within the same app, at the same time.
    //
    // i.e. if you're writing a MariaDB adapter, you should be aware that one
    // model might be configured as `host="localhost"` and another might be using
    // `host="foo.com"` at the same time.  Same thing goes for user, database,
    // password, or any other config.
    //
    // You don't have to support this feature right off the bat in your
    // adapter, but it ought to get done eventually.
    //

    var adapter = {

      // Set to true if this adapter supports (or requires) things like data types, validations, keys, etc.
      // If true, the schema for models using this adapter will be automatically synced when the server starts.
      // Not terribly relevant if your data store is not SQL/schemaful.
      //
      // If setting syncable, you should consider the migrate option,
      // which allows you to set how the sync will be performed.
      // It can be overridden globally in an app (config/adapters.js)
      // and on a per-model basis.
      //
      // IMPORTANT:
      // `migrate` is not a production data migration solution!
      // In production, always use `migrate: safe`
      //
      // drop   => Drop schema and data, then recreate it
      // alter  => Drop/add columns as necessary.
      // safe   => Don't change anything (good for production DBs)
      //
      syncable: false,


      // Default configuration for connections
      defaults: {
        // For example, MySQLAdapter might set its default port and host.
        // port: 3306,
        // host: 'localhost',
        // schema: true,
        // ssl: false,
        // customThings: ['eh']
      },


      /**
       *
       * This method runs when a model is initially registered
       * at server-start-time.  This is the only required method.
       *
       * @param  {[type]}   connection [description]
       * @param  {[type]}   collection [description]
       * @param  {Function} cb         [description]
       * @return {[type]}              [description]
       */
      registerConnection: function (connection, collections, cb) {

        if (!connection.identity) return cb(new Error('Connection is missing an identity.'));
        if (connections[connection.identity]) return cb(new Error('Connection is already registered.'));

        var options = {
          "database" : "nodeDB2",
          "options" : { "search.enabled" : true },
          "files" : [ ]
        };

        // Add in logic here to initialize connection
        // e.g. connections[connection.identity] = new Database(connection, collections);
        connections[connection.identity] = connection;

        connections[connection.identity].connection = new Stardog.Connection();
        connections[connection.identity].connection.setEndpoint("http://localhost:5820/");
        connections[connection.identity].connection.setCredentials("admin", "admin");

        console.log("###### Connection #######")
        console.log(connection);

//        console.log("###### Collections #######")
//        console.log(collections)
        
        connections[connection.identity].connection.createDB(options, function (data, response) {
          console.log(data);

          if (response.statusCode == 201) {
            // clean created DB after we know it was created
            conn.dropDB({ database: "nodeDB1" }, function (data2, response2) {

              done();
            });
          }
        });

        cb();
      },


      /**
       * Fired when a model is unregistered, typically when the server
       * is killed. Useful for tearing-down remaining open connections,
       * etc.
       *
       * @param  {Function} cb [description]
       * @return {[type]}      [description]
       */
      // Teardown a Connection
      teardown: function (conn, cb) {

        if (typeof conn == 'function') {
          cb = conn;
          conn = null;
        }
        if (!conn) {
          connections = {};
          return cb();
        }
        if (!connections[conn]) return cb();
        delete connections[conn];
        cb();
      },


      // Return attributes
      describe: function (connection, collection, cb) {
        // Add in logic here to describe a collection (e.g. DESCRIBE TABLE logic)
        return cb();
      },

      /**
       *
       * REQUIRED method if integrating with a schemaful
       * (SQL-ish) database.
       *
       */
      define: function (connection, collection, definition, cb) {
        // Add in logic here to create a collection (e.g. CREATE TABLE logic)


        return cb();
      },

      /**
       *
       * REQUIRED method if integrating with a schemaful
       * (SQL-ish) database.
       *
       */
      drop: function (connection, collection, relations, cb) {
        // Add in logic here to delete a collection (e.g. DROP TABLE logic)
        return cb();
      },

      /**
       *
       * REQUIRED method if users expect to call Model.find(), Model.findOne(),
       * or related.
       *
       * You should implement this method to respond with an array of instances.
       * Waterline core will take care of supporting all the other different
       * find methods/usages.
       *
       */
      find: function (connection, collection, options, cb) {

//      conn.query({
//            database: "myDB",
//            query: "select distinct ?s where { ?s ?p ?o }",
//            limit: 10,
//            offset: 0
//          },
//          function (data) {
//            console.log(data.results.bindings);
//          });

        return cb();
      },

      create: function (connection, collection, values, cb) {

        var default_prefix = "mb:";
        var id = shortid.generate();
        id = default_prefix + "n." + id;

        var query = "INSERT {\n";
        query += id + " ";

        // Query Builder
        for (value in values) {
          console.log(value)
          query += default_prefix + 'models.' + collection + '.properties.' + value + ' "' + values[value] + '";\n'
        }

        query += "} WHERE { ?a ?b ?c }";

        var conn = new Stardog.Connection();
        conn.setEndpoint("http://localhost:5820/");
        conn.setCredentials("admin", "admin");

        conn.onlineDB({ database: "mindbabble", strategy: "NO_WAIT" }, function () {

          conn.query({
            database: "mindbabble",
            mimetype: "application/sparql-results+json",
            query: query,
            limit: 20,
            offset: 0
          }, function (data) {
            console.log("data")
            console.log(data)


            return cb(null, data);
          });
        });
      },

      update: function (connection, collection, options, values, cb) {
        return cb();
      },

      destroy: function (connection, collection, options, values, cb) {
        return cb();
      }

      /*

       // Custom methods defined here will be available on all models
       // which are hooked up to this adapter:
       //
       // e.g.:
       //
       foo: function (collectionName, options, cb) {
       return cb(null,"ok");
       },
       bar: function (collectionName, options, cb) {
       if (!options.jello) return cb("Failure!");
       else return cb();
       destroy: function (connection, collection, options, values, cb) {
       return cb();
       }

       // So if you have three models:
       // Tiger, Sparrow, and User
       // 2 of which (Tiger and Sparrow) implement this custom adapter,
       // then you'll be able to access:
       //
       // Tiger.foo(...)
       // Tiger.bar(...)
       // Sparrow.foo(...)
       // Sparrow.bar(...)


       // Example success usage:
       //
       // (notice how the first argument goes away:)
       Tiger.foo({}, function (err, result) {
       if (err) return console.error(err);
       else console.log(result);

       // outputs: ok
       });

       // Example error usage:
       //
       // (notice how the first argument goes away:)
       Sparrow.bar({test: 'yes'}, function (err, result){
       if (err) console.error(err);
       else console.log(result);

       // outputs: Failure!
       })




       */




    };


    // Expose adapter definition
    return adapter;

  })();

//}))