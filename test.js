'use strict'

const test = require('tape')
const level = require('level-mem')
const sub = require('subleveldown')
const reachdown = require('.')

test('basic', function (t) {
  const db = level()
  const deferred = db.db
  const enc = db._db
  const memdown = enc.db

  t.is(reachdown.is(db, 'levelup'), true)
  t.is(reachdown.is(deferred, 'deferred-leveldown'), true)
  t.is(reachdown.is(enc, 'encoding-down'), true)
  t.is(reachdown.is(db, 'foo'), false)
  t.is(reachdown.is(deferred, 'foo'), false)
  t.is(reachdown.is(enc, 'foo'), false)
  t.is(reachdown.is(memdown, 'foo'), false)

  // Not sure what this should do; leave it undocumented for now.
  t.is(reachdown.is(db), false)

  t.is(reachdown(db, 'levelup'), db)
  t.is(reachdown(db, 'deferred-leveldown'), deferred)
  t.is(reachdown(db, 'encoding-down'), enc)
  t.is(reachdown(enc, 'encoding-down'), enc)
  t.is(reachdown(db), memdown)
  t.is(reachdown(enc), memdown)
  t.is(reachdown(memdown), memdown)
  t.is(reachdown(db, 'foo'), null)
  t.is(reachdown(db, 'foo', false), memdown)

  db.open(function () {
    t.is(db.isOpen(), true)
    t.is(reachdown(db, 'levelup'), db)
    t.is(reachdown(db, 'deferred-leveldown'), null)
    t.is(reachdown(db, 'deferred-leveldown', false), memdown)
    t.is(reachdown(db, 'encoding-down'), enc)
    t.is(reachdown(enc, 'encoding-down'), enc)
    t.is(reachdown(db), memdown)
    t.is(reachdown(enc), memdown)
    t.is(reachdown(memdown), memdown)
    t.is(reachdown(db, 'foo'), null)
    t.is(reachdown(db, 'foo', false), memdown)

    t.end()
  })
})

test('visitor function', function (t) {
  const db = level()
  const visits = []
  const result = reachdown(db, function visit (db, type) {
    visits.push({ db, type })
  })

  t.same(visits, [
    { db: db, type: 'levelup' },
    { db: db.db, type: 'deferred-leveldown' },
    { db: db._db, type: 'encoding-down' },
    { db: db._db.db, type: undefined }
  ])
  t.is(result, null)
  t.end()
})

test('visitor function, loose', function (t) {
  const db = level()
  const visits = []
  const result = reachdown(db, function visit (db, type) {
    visits.push({ db, type })
  }, false)

  t.same(visits, [
    { db: db, type: 'levelup' },
    { db: db.db, type: 'deferred-leveldown' },
    { db: db._db, type: 'encoding-down' },
    { db: db._db.db, type: undefined }
  ])
  t.is(result, db._db.db, 'landed on memdown')
  t.end()
})

test('visitor function, return truthy value', function (t) {
  const db = level()
  const visits = []
  const result = reachdown(db, function visit (db, type) {
    visits.push({ db, type })
    if (type === 'deferred-leveldown') return 123
  }, false)

  t.same(visits, [
    { db: db, type: 'levelup' },
    { db: db.db, type: 'deferred-leveldown' }
  ])
  t.is(result, db.db)
  t.end()
})

test('subleveldown', function (t) {
  const db = level()
  const enc = db._db
  const memdown = enc.db
  const sub1 = sub(db, 'test')
  const subdown = sub1._db.db

  t.is(reachdown.is(sub1, 'levelup'), true)
  t.is(reachdown.is(subdown, 'subleveldown'), true)
  t.is(reachdown.is(enc, 'encoding-down'), true)
  t.is(reachdown.is(sub1, 'foo'), false)
  t.is(reachdown.is(subdown, 'foo'), false)
  t.is(reachdown.is(enc, 'foo'), false)

  t.is(reachdown(sub1, 'subleveldown').type, 'subleveldown')
  t.is(reachdown(sub1, 'deferred-leveldown'), sub1.db)
  t.is(reachdown(sub1, 'levelup'), sub1)
  t.is(reachdown(sub1, 'encoding-down'), sub1._db)
  t.is(reachdown(sub1), memdown)
  t.is(reachdown(sub1, 'foo'), null)
  t.is(reachdown(sub1, 'foo', false), memdown)

  sub1.open(function () {
    t.is(reachdown(sub1, 'subleveldown').type, 'subleveldown')
    t.is(reachdown(sub1, 'deferred-leveldown'), null)
    t.is(reachdown(sub1, 'deferred-leveldown', false), memdown)
    t.is(reachdown(sub1, 'levelup'), sub1)
    t.is(reachdown(sub1, 'encoding-down'), sub1._db)
    t.is(reachdown(sub1), memdown)
    t.is(reachdown(sub1, 'foo'), null)
    t.is(reachdown(sub1, 'foo', false), memdown)
    t.end()
  })
})
