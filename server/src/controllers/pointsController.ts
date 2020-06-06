import {Request, Response} from 'express';
import knex from '../database/connection'

class PointsController{
    async show(request: Request, response: Response){
        const {id} = request.params

        const point = await knex('points').where('id', id).first()

        if(!point){
            return response.status(400).json({message: "point not found."})
        }

        const serielizedPoints = {
            ...point,
            image_url: `http://192.168.15.192:3333/uploads/${point.image}`
        }

        const items = await knex('items')
            .join('pointitems', 'items.id', '=', 'pointitems.item_id')
            .where('pointitems.point_id', id)

        return response.json({point: serielizedPoints, items});
    }

    async index(request: Request, response: Response){
        const {city, uf, items} = request.query
        
        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
        .join('pointitems', 'points.id', '=', 'pointitems.point_id')
        .orWhereIn('pointitems.item_id', parsedItems)
        .orWhere('city', String(city))
        .orWhere('uf', String(uf))
        .distinct()
        .select('points.*')

        const serielizedPoints = points.map(point =>{
            return {
                ...points,
                image_url: `http://192.168.15.192:3333/uploads/${point.image}`
            }
        }) 

        return response.json(serielizedPoints)
    }

    async create(request: Request, response: Response){
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        const trx = await knex.transaction()
        
        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        }

        const insertedIds = await trx('points').insert(point)
    
        const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: Number) =>{
            return {
                item_id,
                point_id: insertedIds[0],
            };
        })
    
        await trx('pointitems').insert(pointItems);

        await trx.commit();
    
        return response.json({
            id: insertedIds[0],
            ...point
        })
    }

    
}

export default PointsController;