exports.up = function(knex, Promise) {
  return Promise.all([
  	knex.schema.createTable('audio',function(table){
  		table.increments()
  		table.string('name')
  		table.string('created')
      table.string('file_path')

  	})
  ])
};

exports.down = function(knex, Promise) {
	return Promise.all([
  knex.schema.dropTable('audio')
  ])
};