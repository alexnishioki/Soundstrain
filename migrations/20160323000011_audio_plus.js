
exports.up = function(knex, Promise) {
	return Promise.all([
  knex.schema.table('audio',function(table) {
  	table.string('user').references('username').inTable('users')
  })
  ])
};

exports.down = function(knex, Promise) {
  
};
