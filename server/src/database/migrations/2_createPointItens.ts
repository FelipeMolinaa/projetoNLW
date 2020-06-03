import Knex from 'knex'

export async function up(knex: Knex){
    return knex.schema.createTable('pointitems', table =>{
        table.integer('id').primary();
        table.integer('point_id').notNullable().references('id').inTable('points');
        table.integer('item_id').notNullable().references('id').inTable('items');
    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('pointitems')
}