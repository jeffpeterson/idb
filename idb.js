// some sample usecases:

//  idb.migrate({
//    1: function(m) {
//      m('tracks').create;
//    }
//  });

// idb('tracks').get('a123')
// idb('tracks').get('a123').done(function(track){ });
// idb('tracks').put({key: 'a123'});

// idb('tracks').tap(function() {
//   this.put(obj);
// });

// idb('tracks').each(function(track) {});

(function(base) {

var idb, flag, attribute;

attribute = function(name, fn) {
  Object.defineProperty(idb, name, {get: fn});
};

flag = function(flagName, props) {
  attribute(flagName, function() {
    return this.clone.set(props);
  });
};

idb = base.idb = function() {
  return idb.onCalled.apply(idb, arguments);
};

idb._connections     = {};
idb._database        = 'idb';
idb._databases       = {};
idb._doneCallback    = null;
idb._factory         = function() {};
idb._migrations      = {};
idb._objectStore     = null;
idb._result          = null;
idb._transactionMode = 'readwrite';
idb.indexedDB        = base.indexedDB;


flag('readonly',  {_transactionMode: 'readonly'});
flag('readwrite', {_transactionMode: 'readwrite'});

attribute('clone', function() {
  var fn = function() {
    return idb.onCalled.apply(fn, arguments);
  };

  fn.__proto__ = fn.prototype = this;

  return fn;
});

attribute('close', function() {
  this._databases[this._database].close();
  return this.clone;
});

attribute('create', function() {

});

attribute('version', function() {
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
      if (!key.hasOwnProperty(k)) continue;
      this[k] = key[k];
    }

    return this;
  }

  this[key] = value;
  return this;
};

idb.tap = function(fn) {
  return (fn && fn.call(this, this)) || this;
};

idb.transaction = idb.atomic = function(fn) {
  this.open(function(ln) {
    var db = ln._databases[ln._database];

    ln._transaction || (ln._transaction = db.transaction(ln._objectStore, ln._transactionMode));
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

idb.put = function(item) {
  return this.readwrite.transaction(function() {
    var req = this._transaction.objectStore(this._objectStore).put(item);

    req.onsuccess = function() {
      this._doneCallback && this._doneCallback(req.result);
    };
  });
};

idb.then = idb.done = function(fn) {
  return this.clone.set('_doneCallback', function() {
    fn.apply(this, this._doneCallback.apply(this, arguments));
  });
};

idb.db = function(name) {
  return this.clone.set('_database', name);
};

idb.get = function(key) {
  return this.transaction(function() {
    var req = this._transaction.objectStore(this._objectStore).get(key);

    req.onsuccess = function() {
      this._doneCallback && this._doneCallback(req.result);
    };
  });
};

idb.from = idb.table = idb.objectStore = function(name) {
  return this.clone.set('_objectStore', name);
};

})(this);
