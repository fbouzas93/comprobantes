import { Request, Response } from 'express';
import { Apartment } from '../models/Apartment';
import { Bill } from '../models/Bill';
import { Service } from '../models/Service';

export const getBills = async (req: Request, res: Response) => {
    const data = await Apartment.findAll({
        attributes: ['id', 'description', 'order'],
        order: ['order'],
        include: [
            {
                model: Service,
                attributes: ['id', 'name'],
                where: {
                    is_visible: true,
                },
                include: [
                    {
                        model: Bill,
                        attributes: ['id', 'amount', 'payment_date', 'increase_rate'],
                        order: ['payment_date', 'DESC'],
                    }
                ]
            }
        ],
    });

    res.send(data);
};