// some sample usecases:

//  idb.migrate({
//    1: function(m) {
//      m('tracks').create;
//    }
//  });

// idb('tracks').get('a123')
// idb('tracks').get('a123').then(function(track){ });
// idb('tracks').put({key: 'a123'});

// idb('tracks').tap(function() {
//   this.put(obj);
// });

// idb('tracks').each(function(track) {});

(function(base) {

var idb, flag, getter, defaultOptions, extend, setProto;

setProto = function(obj, proto) {
  obj.__proto__ = proto;
  return obj;
};

extend = function() {
  var obj = {};

  [].forEach.call(arguments, function(extension) {
    Object.keys(extension).forEach(function(key) {
      if (extension.hasOwnProperty(key))
        obj[key] = extension[key];
    });
  });

  return obj;
};

getter = function(name, fn) {
  Object.defineProperty(idb, name, {get: fn});
};

flag = function(flagName, props) {
  getter(flagName, function() {
    return this.clone.set(props);
  });
};

idb = base.idb = function() {
  return idb.onCalled.apply(idb, arguments);
};

defaultOptions = {
  _attributes:      Object.create(null),
  _connections:     {},
  _promise:         null,
  _database:        'idb',
  _databases:       {},
  _migrations:      {},
  _objectStore:     null,
  _transactionMode: 'readwrite'
};

setProto(idb, defaultOptions);
idb.indexedDB = base.indexedDB;

flag('readonly',  { _transactionMode: 'readonly'  });


flag('readwrite', { _transactionMode: 'readwrite' });


getter('clone', function() {
  var fn = function() {
    return idb.onCalled.apply(fn, arguments);
  };

  setProto(fn, this).prototype = this;

  return fn;
});

getter('close', function() {
  this._databases[this._database].close();
  return this.clone;
});

getter('create', function() {

});

getter('version', function() {
  return Math.max.apply(this, Object.keys(this._migrations[this._database]));
});

idb.onCalled = function(input) {
  switch (typeof input) {
    case 'function':
      return this.done(input);
    case 'object':
      return this.clone.set(input);
    case 'string':
      return this.clone.objectStore(input);
    default:
      return this;
  }
};

idb.open = function(fn) {
  var req, version;


  req = this.indexedDB.open(this._database);

  req.onsuccess = function() {
    idb._databases[name] = req.result;
  };

  req.onupgradeneeded = (function(event) {
    // TODO run migrations
  }).bind(idb.db(name));

  return this.clone;
};

idb.set = function(key, value) {
  if (typeof key === 'object') {
    for (var k in key) {
      if (key.hasOwnProperty(k))
        this[k] = key[k];
    }

    return this;
  }

  this[key] = value;
  return this;
};

idb.tap = function(fn) {
  var ln = this.clone;
  fn && fn.call(ln, ln);
  return this;
};

idb.transaction = idb.atomic = function(fn) {
  this.open(function() {
    var db, transaction;
    db = this._databases[ln._database];

    if (!this._transaction) {
      transaction = db.transaction(ln._objectStore, ln._transactionMode);
    }
  });

  return ln.tap(fn);
};

idb.migrate = function(migrations) {
  if (! Object.keys(migrations).every(function(n) { return n > 0; })) {
    throw new RangeError("migration keys must be positive integers");
  }

  this._migrations[this._database] = migrations;
  return this;
};

idb.where = function(attributes) {
  setProto(attributes, this._attributes);
  this.clone.set('_attributes');
};

idb.put = function(item) {
  return this.readwrite.transaction(function() {
    var req = this._transaction
      .objectStore(this._objectStore)
      .put(item);

    req.onsuccess = function() {
      this.resolve(req.result);
    }.bind(this);

    req.onerror = function() {
      this.reject(req.error);
    }.bind(this);

  });
};

idb.promise = function() {
};

idb.resolve = function(result) {
  this._promise = Object.create(null);
  this._promise.ondone(result);
  this._promise.value = result;
};

idb.reject = function(result) {
  // this._doneCallback(result);
  // this._result = result;
};

idb.then = idb.done = function(fn) {
  if (!this._promise)
    throw new Error("No promise yet!");

  return this.tap(function(ln){
    ln._promise.onSuccess = function() {
      fn.apply(this, this._doneCallback.apply(this, arguments));
    }.bind(this);
  }.bind(this));

};

idb.db = function(databaseName) {
  return this.clone.set('_database', databaseName);
};

idb.get = function(key) {
  return this.transaction(function() {
    var req = this._transaction.objectStore(this._objectStore).get(key);

    req.onsuccess = function() {
      this.resolve(req.result);
    };

    req.onerror = function() {
      this.reject(req.error);
    };
  });
};

idb.from = idb.table = idb.objectStore = function(storeName) {
  return this.clone.set('_objectStore', storeName);
};

})(this);
