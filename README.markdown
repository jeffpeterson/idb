idb
===

`idb` wraps `IndexedDB`.

Usage
=====

`idb` works by building up a query one method call at a time. We can then act
on the result.

Here's an example:

```coffee
  idb.migrate({
    1: function(m) {
      m('songs').create.index('name');
    }
  });

  idb('songs').each(function(song) {
    console.log(song);
  });

  idb('songs').all(function(songs) {
    console.log(songs);
  });

  var book = { /* ... */ };
  idb('books').put(book);


  idb('albums').get('1').then(function() {
    console.log(this);
  });

  idb('albums').where({artist: "Baths", name: "Cerulean"}).first(function(album) {
    album.name; //=> "Cerulean"
  });
```

Migrations
----------

Migrations are handled with `idb.migrate`.

Indexes
-------

Indexes are used automatically when applicable:

```coffee
  idb.migrate
    1: ->
      @('songs').create.index('name')

  idb('songs').put(id: 1, name: 'test')
  idb('songs').where(name: 'test').first (song) ->
    song.id #=> 1

```

Object Stores
-------------

We can access an ObjectStore by calling

```coffee


```

Transactions
------------

```coffee

```


