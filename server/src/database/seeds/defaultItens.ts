import Knex from 'knex'

export async function seed(knex: Knex){
    await knex('items').insert([
        { title: 'lâmpadas', image: 'lampadas.svg' },
        { title: 'Pilhas e baterias', image: 'bateria.svg' },
        { title: 'Papéis e Papelão', image: 'papeis-papelao.svg' },
        { title: 'Residuos Eletronicos', image: 'eletronicos.svg' },
        { title: 'Resíduos Organicos', image: 'organicos.svg' },
        { title: 'Óleo de Cozinha', image: 'oleo.svg' },
    ])
}