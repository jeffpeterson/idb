idb    = require('./idb.js').idb
chai   = require 'chai'
sinon  = require 'sinon'
expect = chai.expect

chai.use require('sinon-chai')

describe 'idb', ->
  before ->
    idb.indexedDB = {}

  it "can be called with or without new", ->
    ln = idb.clone
    expect(new idb).to.equal idb
    expect(new ln ).to.equal ln

  it "has a default database", ->
    expect(idb._database).to.equal 'idb'

  it "sets _objectStore when called with an object", ->
    expect(idb('i')._objectStore).to.equal 'i'

  it 'sets properties', ->
    db = idb.clone.set(a: 1, b: 2).set('c', 3)

    expect(db.a).to.equal 1
    expect(db.b).to.equal 2
    expect(db.c).to.equal 3

    expect(idb.a).to.equal undefined
    expect(idb.b).to.equal undefined
    expect(idb.c).to.equal undefined

  it "can be called with no consequence", ->
    expect(idb).to.equal idb()

  it "has callable clones", ->
    db = idb.clone.clone
    expect(db()).to.equal db

  it 'can calculate a version', ->
    idb.migrate 1: 0, 4: 0, 14: 0

    expect(idb.version).to.equal 14

  it 'allows setting of db', ->
    expect(idb.db('i')._database).to.equal 'i'

  it 'has a default _transactionMode', ->
    expect(idb._transactionMode).to.equal 'readwrite'

  describe '#tap', ->
    it 'passes a clone as the first argument', ->
      ln = idb.db('i').set(_transaction: 1)
      ln.tap (db) ->
        expect(db.__proto__).to.equal ln
        expect(db._database).to.equal 'i'

    it 'allows a return value', ->
      expect(idb.tap(-> 1)).to.equal 1
      expect(idb.tap(->)  ).to.equal idb

  describe '#transaction', ->
    xit 'opens a new transaction', ->
      a = {}
      expect(idb.transaction()._transaction).to.equal a

  it 'allows setting to readonly', ->
    expect(idb.readonly._transactionMode).to.equal 'readonly'

  it 'allows setting to readwrite', ->
    expect(idb.readwrite._transactionMode).to.equal 'readwrite'

  it 'clones itself', ->
    ln = idb.clone.clone().clone.clone
    expect(ln.clone.__proto__).to.equal ln
    expect(ln.clone.prototype).to.equal ln

  describe "#migrate", ->
    it "queues up migrations", ->
      migration = (->)
      migrations = 1: migration

      db = idb.db('i').set('_migrations', {}).migrate migrations

      expect(db._migrations.i   ).to.equal migrations
      expect(db._migrations.i[1]).to.equal migration

    it 'throws if keys are not ints', ->
      fn = ->
        idb.migrate 1: 0, a: 2

      expect(fn).to.throw RangeError

  describe '#then', ->
    it 'requires a promise', ->
      expect(idb.then.bind(idb)).to.throw(Error)

    it 'requires'

  describe "get", ->
    xit 'returns the correct entry', ->
      expect(idb('i').get(1)).to.not.equal(undefined)
