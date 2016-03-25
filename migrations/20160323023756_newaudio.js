exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('audio',function(table){
      table.increments()
      table.string('name')
      table.string('created')
      table.string('file_path').unique().notNullable()
      table.string('user').references('username').inTable('users')
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
  knex.schema.dropTable('audio')
  ])
};
