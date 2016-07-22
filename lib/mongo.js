import * as mongo from 'mongodb';
import config from './config';

class MongoServer {
  constructor(servers) {
    this.servers = servers;
    this.dbs = {};
  }

  initMongoServer() {
    let serverList = [];
    for (let server of this.servers) {
      serverList.push(new mongo.Server(server[0], server[1], {auto_reconnect: true}));
    }
    if (serverList.length > 1) {
      return new mongo.ReplSet(serverList);
    } else {
      return serverList[0];
    }
  }

  openDb(dbName, cb) {
    new mongo.Db(dbName, this.initMongoServer(), {safe: true}).open(cb);
  }

  getDb(dbName, cb) {
    if (this.dbs[dbName]) {
      cb(null, this.dbs[dbName]);
    } else {
      this.openDb(dbName, (err, db) => {
        if (err) {
          cb(err);
        } else {
          this.dbs[dbName] = db;
          cb(null, db);
        }
      });
    }
  }

  getCol(dbName, colName, cb) {
    this.getDb(dbName, (err, db) => {
      if (err) {
        cb(err);
      } else {
        db.collection(colName, cb);
      }
    });
  }

  find(dbName, colName, query, options, cb) {
    if (!cb) {
      cb = options;
      options = {};
    }
    this.getCol(dbName, colName, (err, col) => {
      if (err) {
        cb(err);
      } else {
        col.find(query, options, cb);
      }
    });
  }

  findArray(dbName, colName, query, options, cb) {
    if (!cb) {
      cb = options;
      options = {};
    }
    this.find(dbName, colName, query, options, (err, cursor) => {
      if (err) {
        cb(err);
      } else {
        cursor.toArray(cb);
      }
    });
  }

  findOne(dbName, colName, query, options, cb) {
    if (!cb) {
      cb = options;
      options = {};
    }
    this.getCol(dbName, colName, (err, col) => {
      if (err) {
        cb(err);
      } else {
        col.findOne(query, options, cb);
      }
    });
  }

  aggregate(dbName, colName, pipeline, cb) {
    this.getCol(dbName, colName, (err, col) => {
      if (err) {
        cb(err);
      } else {
        col.aggregate(pipeline, cb);
      }
    });
  }
}

export default new MongoServer(config.mongo.server);
