
exports.up = function(knex, Promise) {
  return Promise.all([
  	knex.schema.dropTable('audio',function(table) {
     
})
])
}

exports.down = function(knex, Promise) {
  knex.schema.dropTable('users')
};
