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

  t.is(reachdown(db, 'levelup'), db)
  t.is(reachdown(db, 'deferred-leveldown'), deferred)
  t.is(reachdown(db, 'encoding-down'), enc)
  t.is(reachdown(enc, 'encoding-down'), enc)
  t.is(reachdown(db), memdown)
  t.is(reachdown(enc), memdown)
  t.is(reachdown(memdown), memdown)

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

    t.end()
  })
})

test('subleveldown', function (t) {
  const db = level()
  const enc = db._db
  const memdown = enc.db
  const sub1 = sub(db, 'test')

  t.is(reachdown(sub1, 'subleveldown').type, 'subleveldown')
  t.is(reachdown(sub1, 'deferred-leveldown'), sub1.db)
  t.is(reachdown(sub1, 'levelup'), sub1)
  t.is(reachdown(sub1, 'encoding-down'), sub1._db)
  t.is(reachdown(sub1), memdown)

  sub1.open(function () {
    t.is(reachdown(sub1, 'subleveldown').type, 'subleveldown')
    t.is(reachdown(sub1, 'deferred-leveldown'), null)
    t.is(reachdown(sub1, 'deferred-leveldown', false), memdown)
    t.is(reachdown(sub1, 'levelup'), sub1)
    t.is(reachdown(sub1, 'encoding-down'), sub1._db)
    t.is(reachdown(sub1), memdown)
    t.end()
  })
})
