
exports.up = function(knex, Promise) {
  return Promise.all([
  	knex.schema.createTable('users',function(table) {
      table.increments()
      table.string('username').unique().notNullable()
      table.string('email').unique().notNullable()
      table.string('password').unique().notNullable()
      
    	})
  	])
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('users')
};
